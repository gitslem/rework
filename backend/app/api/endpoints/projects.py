from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import Project, User, ProjectStatus, ProofOfBuild, Application, ApplicationStatus
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectFilter, ProofOfBuildResponse
from app.api.dependencies import get_current_user, get_current_user_optional

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project (business users only)"""
    from app.models.models import UserRole
    
    if current_user.role != UserRole.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business users can create projects"
        )
    
    new_project = Project(
        owner_id=current_user.id,
        **project_data.model_dump()
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return new_project


@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[ProjectStatus] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all projects with filters (public endpoint - authentication optional)"""
    query = db.query(Project)

    # Apply filters
    if category:
        query = query.filter(Project.category == category)

    # Status filtering
    from app.models.models import UserRole
    if status:
        query = query.filter(Project.status == status)
    elif not current_user or (current_user and current_user.role in [UserRole.FREELANCER, UserRole.AGENT]):
        # Unauthenticated users, freelancers, and agents only see OPEN projects by default
        query = query.filter(Project.status == ProjectStatus.OPEN)
    # Business users see all their projects if no status specified

    if min_budget:
        query = query.filter(Project.budget >= min_budget)
    if max_budget:
        query = query.filter(Project.budget <= max_budget)

    projects = query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get a specific project by ID (public endpoint - authentication optional)"""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a project (owner only)"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    # Update fields
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a project (owner only)"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this project"
        )
    
    db.delete(project)
    db.commit()
    
    return None


@router.get("/my/projects", response_model=List[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all projects created by the current user"""
    projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    return projects


@router.get("/{project_id}/proofs", response_model=List[ProofOfBuildResponse])
def get_project_proofs(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all proofs for a specific project.
    Accessible by:
    - Project owner (company)
    - Freelancers with accepted applications on the project
    """
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check authorization
    is_owner = project.owner_id == current_user.id

    # Check if user is an accepted freelancer on this project
    is_accepted_freelancer = db.query(Application).filter(
        Application.project_id == project_id,
        Application.applicant_id == current_user.id,
        Application.status == ApplicationStatus.ACCEPTED
    ).first() is not None

    if not is_owner and not is_accepted_freelancer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view proofs for this project"
        )

    # Get all proofs for this project
    proofs = db.query(ProofOfBuild).filter(
        ProofOfBuild.project_id == project_id
    ).order_by(ProofOfBuild.created_at.desc()).all()

    return proofs
