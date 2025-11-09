# Remote Works Platform

A full-stack remote work marketplace connecting freelancers, agents, and businesses. Built with FastAPI, Next.js, PostgreSQL, and modern web technologies.

## 🚀 Features

### For Freelancers
- Browse and apply to remote projects
- Earn 99.9% of project income
- Option to outsource work to agents for passive income
- AI-powered job matching
- Profile and resume management

### For Agents (Reworkers)
- Work on behalf of freelancers
- Earn 3x more than traditional freelancing
- Get matched to available projects
- Build portfolio and ratings

### For Businesses
- Post projects and requirements
- AI-matched talent recommendations
- Access to verified freelancers and agents
- Project management dashboard
- Secure payment processing

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Primary database
- **Alembic** - Database migrations
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Redis** - Caching and sessions

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client

## 📁 Project Structure

```
remote-works-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── applications.py
│   │   │   │   └── users.py
│   │   │   └── dependencies.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   └── database.py
│   │   ├── models/
│   │   │   └── models.py
│   │   └── schemas/
│   │       └── schemas.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic.ini
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── lib/
    │   │   ├── api.ts
    │   │   └── authStore.ts
    │   ├── pages/
    │   │   ├── _app.tsx
    │   │   ├── index.tsx
    │   │   ├── login.tsx
    │   │   ├── register.tsx
    │   │   └── dashboard.tsx
    │   └── styles/
    │       └── globals.css
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Redis (optional)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Create PostgreSQL database**
```bash
createdb remoteworks
```

6. **Run database migrations**
```bash
# The tables will be created automatically on first run
# Or use Alembic for migrations:
alembic upgrade head
```

7. **Run the backend server**
```bash
python main.py
# Or with uvicorn directly:
uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

4. **Run the development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/remoteworks
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_SECRET_KEY=your-stripe-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
OPENAI_API_KEY=your-openai-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/me/profile` - Get current user profile
- `PATCH /api/v1/users/me/profile` - Update profile
- `GET /api/v1/users/me/stats` - Get dashboard stats

### Projects
- `GET /api/v1/projects/` - List all projects
- `POST /api/v1/projects/` - Create project (business only)
- `GET /api/v1/projects/{id}` - Get project details
- `PATCH /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### Applications
- `POST /api/v1/applications/` - Apply to project
- `GET /api/v1/applications/` - Get my applications
- `GET /api/v1/applications/project/{id}` - Get project applications
- `PATCH /api/v1/applications/{id}` - Update application status

## 🎨 Key Features Implementation

### AI Matching System
The platform uses AI to match freelancers with projects based on:
- Skill overlap
- Experience level
- Past project success
- Availability

### Payment System
- Stripe integration for secure payments
- 0.1% platform fee
- Automatic payment splitting for agent assignments
- Payment history and tracking

### Rating & Review System
- 5-star rating system
- Project-based reviews
- Profile rating aggregation
- Quality assurance metrics

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy from main branch

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy from main branch

### Database
- Use managed PostgreSQL (Railway, Supabase, or AWS RDS)
- Run migrations on production

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection
- Rate limiting (implement with Redis)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues & TODOs

### High Priority
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Integrate real Stripe payment processing
- [ ] Implement file upload to S3
- [ ] Add real-time notifications

### Medium Priority
- [ ] Implement search and filters for projects
- [ ] Add chat/messaging system
- [ ] Create admin dashboard
- [ ] Add project categories and tags
- [ ] Implement AI matching algorithm

### Low Priority
- [ ] Add social media authentication
- [ ] Implement referral system
- [ ] Add analytics dashboard
- [ ] Create mobile app
- [ ] Add multi-language support

## 📞 Support

For support, email support@remote-works.io or open an issue in the repository.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Inspired by Upwork, Fiverr, and other freelance platforms
- Built with modern web technologies and best practices
