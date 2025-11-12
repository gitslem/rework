# Payment, Escrow & Ratings Integration Guide

## Quick Summary of What Needs to Be Built

This guide focuses on the three features you're planning to integrate:
1. **Payment Processing** (Stripe integration)
2. **Escrow System** (Fund management and release)
3. **Ratings & Reviews** (User feedback and scoring)

---

## 1. PAYMENT PROCESSING LAYER

### Current State
- Database model exists: `Payment` table with fields:
  - `amount`, `platform_fee`, `stripe_payment_intent_id`
  - `status` (PENDING, PROCESSING, COMPLETED, FAILED)
  - `payer_id`, `payee_id`, `project_id`
- Stripe dependencies installed: `stripe>=7.11.0`
- Environment variables configured (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)

### What Needs to Be Built

#### Backend Implementation

**File: `/backend/app/api/endpoints/payments.py` (NEW)**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import stripe

router = APIRouter(prefix="/payments", tags=["payments"])

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/create-intent")
async def create_payment_intent(
    project_id: int,
    amount: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Stripe payment intent for project"""
    # Check project exists and user is owner
    # Create payment intent with Stripe
    # Save Payment record with PENDING status
    # Return client_secret for frontend

@router.post("/confirm")
async def confirm_payment(
    payment_id: int,
    payment_method_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm payment and move to PROCESSING"""
    # Verify payment belongs to current user
    # Call Stripe to confirm payment
    # Update payment status

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    # Verify webhook signature
    # On payment_intent.succeeded:
    #   - Update Payment status to COMPLETED
    #   - Create Escrow record
    #   - Send notification
    # On payment_intent.payment_failed:
    #   - Update Payment status to FAILED
    #   - Send notification

@router.get("/")
async def list_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all payments for current user (as payer or payee)"""

@router.get("/{payment_id}")
async def get_payment(payment_id: int, ...):
    """Get payment details"""
```

**File: `/backend/app/services/payment_service.py` (NEW)**
```python
import stripe
from app.core.config import settings
from sqlalchemy.orm import Session

class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def create_payment_intent(self, amount: float, project_id: int, metadata: dict):
        """Create Stripe payment intent"""
        # Calculate platform fee (0.1%)
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency="usd",
            metadata={"project_id": project_id}
        )
        return intent
    
    def confirm_payment(self, payment_intent_id: str):
        """Confirm payment processing"""
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return intent
    
    def get_payment_status(self, payment_intent_id: str):
        """Check payment status with Stripe"""
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return intent.status
    
    def calculate_fees(self, amount: float) -> tuple:
        """Calculate platform fee and net amount"""
        platform_fee = amount * 0.001  # 0.1% fee
        net_amount = amount - platform_fee
        return platform_fee, net_amount
```

#### Frontend Implementation

**File: `/frontend/src/lib/paymentAPI.ts` (NEW)**
```typescript
export const paymentAPI = {
  createIntent: (projectId: number, amount: number) =>
    api.post('/payments/create-intent', {
      project_id: projectId,
      amount: amount
    }),
  
  confirmPayment: (paymentId: number, paymentMethodId: string) =>
    api.post('/payments/confirm', {
      payment_id: paymentId,
      payment_method_id: paymentMethodId
    }),
  
  getPayments: () => api.get('/payments/'),
  
  getPayment: (id: number) => api.get(`/payments/${id}`)
};
```

**File: `/frontend/src/components/PaymentForm.tsx` (NEW)**
```typescript
import { loadStripe } from '@stripe/js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export const PaymentForm = ({ projectId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e) => {
    // Get payment intent from backend
    // Confirm payment with Stripe
    // Update local state on success
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay ${amount}</button>
    </form>
  );
};
```

### Integration Points

1. **When Application is Accepted:**
   ```python
   # In applications.py endpoint
   @router.patch("/{application_id}")
   async def update_application_status(...):
       if update_data.status == ApplicationStatus.ACCEPTED:
           # Create payment intent
           payment_service.create_payment_intent(
               amount=project.budget,
               project_id=project.id
           )
           # Create escrow hold
           escrow_service.create_escrow(...)
   ```

2. **When Project is Completed:**
   ```python
   # Verify with proof-of-build first
   # Then release escrow funds
   # Update payment status to COMPLETED
   # Distribute payments
   ```

---

## 2. ESCROW SYSTEM

### Database Changes

**File: `/database/migrations/escrow.sql` (NEW)**
```sql
CREATE TYPE escrow_status AS ENUM ('held', 'released', 'refunded', 'disputed');

CREATE TABLE escrows (
    id SERIAL PRIMARY KEY,
    
    -- Relationships
    payment_id INTEGER NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Fund management
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2),
    freelancer_amount DECIMAL(10, 2),
    agent_amount DECIMAL(10, 2),
    
    -- Status
    status escrow_status DEFAULT 'held',
    
    -- Release conditions
    release_condition VARCHAR(50),  -- "proof_verified", "completion_confirmed", "manual"
    proof_id INTEGER REFERENCES proofs_of_build(id),
    
    -- Dispute tracking
    is_disputed BOOLEAN DEFAULT FALSE,
    dispute_reason TEXT,
    
    -- Timestamps
    held_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escrows_status ON escrows(status);
CREATE INDEX idx_escrows_project_id ON escrows(project_id);
CREATE INDEX idx_escrows_payment_id ON escrows(payment_id);
```

### Backend Service

**File: `/backend/app/services/escrow_service.py` (NEW)**
```python
from sqlalchemy.orm import Session
from app.models.models import Escrow, Payment, Project, User
from decimal import Decimal

class EscrowService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_escrow(
        self,
        payment_id: int,
        project_id: int,
        amount: float,
        release_condition: str = "proof_verified"
    ):
        """Hold funds in escrow after payment"""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        platform_fee, net_amount = self.calculate_distribution(amount)
        
        escrow = Escrow(
            payment_id=payment_id,
            project_id=project_id,
            amount=amount,
            platform_fee=platform_fee,
            freelancer_amount=net_amount,  # Will split with agent if needed
            status="held",
            release_condition=release_condition
        )
        
        self.db.add(escrow)
        self.db.commit()
        return escrow
    
    def release_escrow(self, escrow_id: int, proof_id: int = None):
        """Release escrowed funds"""
        escrow = self.db.query(Escrow).filter(Escrow.id == escrow_id).first()
        
        # Update status
        escrow.status = "released"
        escrow.released_at = datetime.utcnow()
        escrow.proof_id = proof_id
        
        # Create transactions to payees
        payment = self.db.query(Payment).filter(Payment.id == escrow.payment_id).first()
        
        # Pay platform fee
        # Pay freelancer/agent
        # Update profile earnings
        
        self.db.commit()
        return escrow
    
    def refund_escrow(self, escrow_id: int, reason: str = None):
        """Refund escrowed funds"""
        escrow = self.db.query(Escrow).filter(Escrow.id == escrow_id).first()
        
        # Update escrow status
        escrow.status = "refunded"
        escrow.dispute_reason = reason
        
        # Refund payment through Stripe
        # stripe.Refund.create(payment_intent=...)
        
        self.db.commit()
        return escrow
    
    def calculate_distribution(self, amount: float) -> tuple:
        """Calculate platform fee and net payout"""
        platform_fee = Decimal(amount) * Decimal('0.001')  # 0.1%
        net = Decimal(amount) - platform_fee
        return float(platform_fee), float(net)
```

### API Endpoints

**File: `/backend/app/api/endpoints/escrow.py` (NEW)**
```python
@router.get("/escrows")
async def list_escrows(current_user: User = Depends(get_current_user), ...):
    """List all escrows for current user"""

@router.get("/escrows/{escrow_id}")
async def get_escrow(escrow_id: int, ...):
    """Get escrow details"""

@router.post("/escrows/{escrow_id}/release")
async def release_escrow(
    escrow_id: int,
    proof_id: int = None,
    current_user: User = Depends(get_current_user),
    ...
):
    """Release escrowed funds (requires proof verification)"""

@router.post("/escrows/{escrow_id}/dispute")
async def dispute_escrow(
    escrow_id: int,
    reason: str,
    current_user: User = Depends(get_current_user),
    ...
):
    """Open dispute for escrowed funds"""

@router.post("/escrows/{escrow_id}/refund")
async def refund_escrow(
    escrow_id: int,
    reason: str,
    current_user: User = Depends(get_current_user),
    ...
):
    """Refund escrowed funds"""
```

---

## 3. RATINGS & REVIEWS SYSTEM

### Current State
- ✅ Review model exists with fields:
  - `rating` (1-5), `comment`, `project_id`
  - `reviewer_id`, `reviewee_id`
- ✅ Profile model has average rating fields
- ❌ Review endpoints NOT implemented

### Backend Implementation

**File: `/backend/app/api/endpoints/reviews.py` (NEW)**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.models import Review, User, Project, Application, ApplicationStatus

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a review after project completion"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == review_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify reviewer was involved (owner or freelancer/agent)
    app = db.query(Application).filter(
        Application.project_id == review_data.project_id,
        Application.applicant_id == review_data.reviewee_id,
        Application.status == ApplicationStatus.ACCEPTED
    ).first()
    
    if not app and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Prevent duplicate reviews
    existing = db.query(Review).filter(
        Review.project_id == review_data.project_id,
        Review.reviewer_id == current_user.id,
        Review.reviewee_id == review_data.reviewee_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed this user for this project")
    
    # Create review
    review = Review(
        project_id=review_data.project_id,
        reviewer_id=current_user.id,
        reviewee_id=review_data.reviewee_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(review)
    
    # Update reviewee's average rating
    update_user_rating(review_data.reviewee_id, db)
    
    db.commit()
    db.refresh(review)
    
    return review

@router.get("/{user_id}")
async def get_user_reviews(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all reviews for a user"""
    reviews = db.query(Review).filter(
        Review.reviewee_id == user_id
    ).offset(skip).limit(limit).all()
    
    return reviews

@router.get("/{user_id}/summary")
async def get_review_summary(user_id: int, db: Session = Depends(get_db)):
    """Get review summary for user"""
    from sqlalchemy import func
    
    summary = db.query(
        func.avg(Review.rating).label("average_rating"),
        func.count(Review.id).label("total_reviews"),
        func.min(Review.rating).label("min_rating"),
        func.max(Review.rating).label("max_rating")
    ).filter(Review.reviewee_id == user_id).first()
    
    return {
        "average_rating": float(summary.average_rating or 0),
        "total_reviews": summary.total_reviews or 0,
        "min_rating": summary.min_rating,
        "max_rating": summary.max_rating
    }

@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete review (reviewer only)"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.reviewer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(review)
    db.commit()
    
    return None

def update_user_rating(user_id: int, db: Session):
    """Update user profile with average rating"""
    from sqlalchemy import func
    
    result = db.query(
        func.avg(Review.rating),
        func.count(Review.id)
    ).filter(Review.reviewee_id == user_id).first()
    
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile:
        profile.average_rating = float(result[0]) if result[0] else 0.0
        profile.total_reviews = result[1] or 0
        db.commit()
```

### Frontend Implementation

**File: `/frontend/src/components/ReviewForm.tsx` (NEW)**
```typescript
import React, { useState } from 'react';
import { paymentAPI } from '@/lib/api';

interface ReviewFormProps {
  projectId: number;
  revieweeId: number;
  onSuccess: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  projectId,
  revieweeId,
  onSuccess
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await paymentAPI.createReview({
        project_id: projectId,
        reviewee_id: revieweeId,
        rating: rating,
        comment: comment
      });
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded p-2"
          rows={4}
          placeholder="Share your experience..."
        />
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};
```

**File: `/frontend/src/components/RatingDisplay.tsx` (NEW)**
```typescript
export const RatingDisplay: React.FC<{ userId: number }> = ({ userId }) => {
  const { data: summary, isLoading } = useQuery(
    ['reviews', userId],
    () => paymentAPI.getReviewSummary(userId)
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex items-center gap-2">
      <div className="text-yellow-400">★</div>
      <span className="font-bold">{summary?.average_rating.toFixed(1)}</span>
      <span className="text-gray-500">({summary?.total_reviews} reviews)</span>
    </div>
  );
};
```

---

## 4. INTEGRATION WORKFLOW

### Sequence of Events

1. **Freelancer applies to project**
   ```
   POST /applications/
   ```

2. **Business accepts application**
   ```
   PATCH /applications/{id}
   ├── Check user role (must be project owner)
   ├── Create payment intent
   │   └── POST /payments/create-intent
   └── Create escrow
       └── POST /escrows/ (status: held)
   ```

3. **Freelancer/Agent receives payment request**
   ```
   Frontend shows payment form with Stripe Elements
   ├── User enters payment method
   └── POST /payments/confirm (status: processing)
   ```

4. **Stripe webhook confirms payment**
   ```
   POST /payments/webhook
   ├── Update Payment status: COMPLETED
   ├── Create Notification
   └── Escrow remains held
   ```

5. **Freelancer completes work and uploads proof**
   ```
   POST /proofs/
   ├── GitHub commit, PR, screenshot, or file
   └── Status: PENDING (awaiting verification)
   ```

6. **Project owner verifies proof**
   ```
   POST /proofs/{id}/verify
   ├── Check GitHub API / file integrity
   └── Update Proof status: VERIFIED
   ```

7. **Release escrowed funds**
   ```
   POST /escrows/{id}/release
   ├── Update Escrow status: RELEASED
   ├── Distribute funds:
   │   ├── Platform fee (0.1%)
   │   └── Freelancer/Agent (99.9%)
   └── Update Profile.total_earnings
   ```

8. **Project owner leaves review**
   ```
   POST /reviews/
   ├── Create Review record
   └── Recalculate Profile.average_rating
   ```

---

## 5. TESTING CHECKLIST

### Local Development Testing

- [ ] Create payment with test Stripe key
- [ ] Create escrow and verify funds are held
- [ ] Release escrow and verify funds distributed
- [ ] Create review and verify rating calculation
- [ ] Test duplicate review prevention
- [ ] Test unauthorized access to payments/reviews
- [ ] Verify Stripe webhook signature
- [ ] Test refund flow

### Integration Testing

- [ ] Application acceptance → Payment creation
- [ ] Payment confirmation → Notification sent
- [ ] Proof verification → Escrow release
- [ ] Multiple reviews → Average rating updated correctly

---

## 6. SECURITY CONSIDERATIONS

1. **Payment Processing**
   - Never store raw credit card data
   - Always use Stripe API for payment operations
   - Verify webhook signatures with secret key
   - Use HTTPS for all payment endpoints
   - Implement rate limiting on payment endpoints

2. **Escrow**
   - Only payer or payee can release/refund
   - Require proof verification before release
   - Log all escrow operations
   - Implement dispute resolution process

3. **Reviews**
   - Prevent review manipulation (one per project pair)
   - Only allow reviews after project completion
   - Implement review moderation for abuse
   - Hide reviewer identity option (future)

---

## 7. FILES SUMMARY

### Files to Create (Backend)
```
/backend/app/api/endpoints/payments.py
/backend/app/api/endpoints/reviews.py
/backend/app/api/endpoints/escrow.py
/backend/app/services/payment_service.py
/backend/app/services/escrow_service.py
/database/migrations/escrow.sql
```

### Files to Create (Frontend)
```
/frontend/src/lib/paymentAPI.ts
/frontend/src/components/PaymentForm.tsx
/frontend/src/components/ReviewForm.tsx
/frontend/src/components/RatingDisplay.tsx
/frontend/src/pages/payments.tsx
/frontend/src/pages/reviews.tsx
```

### Files to Modify
```
/backend/app/models/models.py (add Escrow model)
/backend/app/schemas/schemas.py (add Escrow, Review, Payment schemas)
/backend/main.py (add new routers)
/frontend/src/lib/api.ts (add payment API methods)
```

---

## 8. NEXT STEPS

1. **Create database migration** for Escrow table
2. **Implement payment service** and endpoints
3. **Add Stripe webhook** handling
4. **Create review endpoints**
5. **Build frontend components**
6. **Wire up integration** between features
7. **Test with Stripe test keys**
8. **Deploy and monitor**

---

Generated: 2025-11-12
