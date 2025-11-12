"""
Sandbox API Endpoints
Handles shared sandbox sessions for AI Build/Test Environment
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json
import logging

from app.db.database import get_db
from app.models.models import SandboxSession, SandboxCollaborator, User, Project, SandboxStatus
from app.schemas.schemas import (
    SandboxCreate,
    SandboxUpdate,
    SandboxResponse,
    SandboxExecuteRequest,
    SandboxExecuteResponse,
    SandboxFileOperation,
    SandboxCollaboratorResponse,
)
from app.api.dependencies import get_current_user
from app.services.sandbox_service import sandbox_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sandboxes", tags=["sandboxes"])


def check_sandbox_access(sandbox: SandboxSession, user: User) -> bool:
    """Check if user has access to the sandbox"""
    # Owner always has access
    if sandbox.owner_id == user.id:
        return True

    # Check if user is in shared_with list
    shared_with = sandbox.shared_with if isinstance(sandbox.shared_with, list) else []
    if user.id in shared_with:
        return True

    # Check if user is associated with the project
    if sandbox.project_id:
        # Owner of the project has access
        if sandbox.project.owner_id == user.id:
            return True

        # Check if user has an application to the project
        # (This allows freelancers who applied to access the sandbox)
        from app.models.models import Application, ApplicationStatus
        application = (
            Session.object_session(sandbox)
            .query(Application)
            .filter(
                Application.project_id == sandbox.project_id,
                Application.applicant_id == user.id,
                Application.status.in_([ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED])
            )
            .first()
        )
        if application:
            return True

    return False


@router.post("/", response_model=SandboxResponse, status_code=status.HTTP_201_CREATED)
def create_sandbox(
    sandbox_data: SandboxCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new sandbox session"""

    # Validate project_id if provided
    if sandbox_data.project_id:
        project = db.query(Project).filter(Project.id == sandbox_data.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check if user has access to the project
        if project.owner_id != current_user.id:
            # Check if user has applied to the project
            from app.models.models import Application
            application = db.query(Application).filter(
                Application.project_id == project.id,
                Application.applicant_id == current_user.id
            ).first()

            if not application:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have access to this project"
                )

    # Create default files if none provided
    files = sandbox_data.files
    if not files:
        # Create starter template
        language = sandbox_data.language.value
        template = sandbox_service.get_language_template(language)

        file_ext = {
            "python": "py",
            "javascript": "js",
            "typescript": "ts",
        }.get(language, "txt")

        files = {
            f"main.{file_ext}": {
                "content": template,
                "type": "file"
            }
        }

    # Create sandbox
    new_sandbox = SandboxSession(
        owner_id=current_user.id,
        name=sandbox_data.name,
        description=sandbox_data.description,
        language=sandbox_data.language,
        project_id=sandbox_data.project_id,
        shared_with=sandbox_data.shared_with or [],
        files=files,
        runtime_config={
            "timeout": 30,
            "memory_limit": "256m",
            "cpu_limit": "0.5",
        }
    )

    db.add(new_sandbox)
    db.commit()
    db.refresh(new_sandbox)

    logger.info(f"Created sandbox {new_sandbox.id} by user {current_user.id}")
    return new_sandbox


@router.get("/", response_model=List[SandboxResponse])
def get_sandboxes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    project_id: Optional[int] = None,
    status: Optional[SandboxStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's sandbox sessions"""
    query = db.query(SandboxSession)

    # Filter by ownership or shared access
    from sqlalchemy import or_, cast, Integer
    from sqlalchemy.dialects.postgresql import ARRAY

    # User should see sandboxes they own or that are shared with them
    query = query.filter(
        or_(
            SandboxSession.owner_id == current_user.id,
            SandboxSession.shared_with.contains([current_user.id])
        )
    )

    # Apply additional filters
    if project_id:
        query = query.filter(SandboxSession.project_id == project_id)
    if status:
        query = query.filter(SandboxSession.status == status)

    # Order by most recently accessed
    query = query.order_by(SandboxSession.last_accessed_at.desc())

    sandboxes = query.offset(skip).limit(limit).all()
    return sandboxes


@router.get("/{sandbox_id}", response_model=SandboxResponse)
def get_sandbox(
    sandbox_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific sandbox by ID"""
    sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sandbox not found"
        )

    # Check access
    if not check_sandbox_access(sandbox, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this sandbox"
        )

    # Update last accessed time
    sandbox.last_accessed_at = datetime.utcnow()
    db.commit()

    return sandbox


@router.patch("/{sandbox_id}", response_model=SandboxResponse)
def update_sandbox(
    sandbox_id: int,
    sandbox_data: SandboxUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a sandbox (owner only)"""
    sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sandbox not found"
        )

    # Only owner can update
    if sandbox.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can update the sandbox"
        )

    # Update fields
    update_data = sandbox_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sandbox, field, value)

    db.commit()
    db.refresh(sandbox)

    logger.info(f"Updated sandbox {sandbox_id}")
    return sandbox


@router.delete("/{sandbox_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sandbox(
    sandbox_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a sandbox (owner only)"""
    sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sandbox not found"
        )

    # Only owner can delete
    if sandbox.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can delete the sandbox"
        )

    # Terminate container if exists
    if sandbox.container_id:
        await sandbox_service.terminate_sandbox_container(sandbox.container_id)

    db.delete(sandbox)
    db.commit()

    logger.info(f"Deleted sandbox {sandbox_id}")
    return None


@router.post("/{sandbox_id}/execute", response_model=SandboxExecuteResponse)
async def execute_code(
    sandbox_id: int,
    execute_request: SandboxExecuteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute code in the sandbox"""
    sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sandbox not found"
        )

    # Check access
    if not check_sandbox_access(sandbox, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this sandbox"
        )

    # Get code to execute
    if execute_request.code:
        # Direct code execution
        code = execute_request.code
    else:
        # Execute from file
        file_path = execute_request.file_path
        files = sandbox.files if isinstance(sandbox.files, dict) else {}

        if file_path not in files:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File '{file_path}' not found in sandbox"
            )

        file_data = files[file_path]
        if not isinstance(file_data, dict) or "content" not in file_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file format for '{file_path}'"
            )

        code = file_data["content"]

    # Execute
    success, output, error, duration_ms = await sandbox_service.execute_code(
        code=code,
        language=sandbox.language.value,
        timeout=execute_request.timeout,
        file_name=execute_request.file_path,
    )

    # Update sandbox
    sandbox.last_output = output
    sandbox.last_error = error
    sandbox.last_executed_at = datetime.utcnow()
    sandbox.total_executions += 1
    sandbox.total_runtime_ms += duration_ms

    # Add to execution history
    history = sandbox.execution_history if isinstance(sandbox.execution_history, list) else []
    history.append({
        "timestamp": datetime.utcnow().isoformat(),
        "file_path": execute_request.file_path,
        "success": success,
        "output": output[:500] if output else "",  # Truncate for history
        "error": error[:500] if error else None,
        "duration_ms": duration_ms,
    })

    # Keep only last 50 executions
    sandbox.execution_history = history[-50:]

    db.commit()

    logger.info(f"Executed code in sandbox {sandbox_id} - success: {success}")

    return SandboxExecuteResponse(
        success=success,
        output=output,
        error=error,
        duration_ms=duration_ms,
        timestamp=datetime.utcnow(),
    )


@router.post("/{sandbox_id}/files", response_model=SandboxResponse)
def manage_file(
    sandbox_id: int,
    file_op: SandboxFileOperation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create, update, or delete files in the sandbox"""
    sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sandbox not found"
        )

    # Check access
    if not check_sandbox_access(sandbox, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this sandbox"
        )

    files = sandbox.files if isinstance(sandbox.files, dict) else {}

    # Perform operation
    if file_op.operation == "create" or file_op.operation == "update":
        if not file_op.content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content is required for create/update operations"
            )

        files[file_op.file_path] = {
            "content": file_op.content,
            "type": "file",
            "updated_at": datetime.utcnow().isoformat(),
        }
        action = "created" if file_op.operation == "create" else "updated"

    elif file_op.operation == "delete":
        if file_op.file_path not in files:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File '{file_op.file_path}' not found"
            )
        del files[file_op.file_path]
        action = "deleted"

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid operation: {file_op.operation}"
        )

    # Update sandbox
    sandbox.files = files
    db.commit()
    db.refresh(sandbox)

    logger.info(f"File {action}: {file_op.file_path} in sandbox {sandbox_id}")
    return sandbox


@router.post("/{sandbox_id}/share", response_model=SandboxResponse)
def share_sandbox(
    sandbox_id: int,
    user_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Share sandbox with other users"""
    sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sandbox not found"
        )

    # Only owner can share
    if sandbox.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can share the sandbox"
        )

    # Verify all users exist
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )

    # Update shared_with list
    existing_shares = sandbox.shared_with if isinstance(sandbox.shared_with, list) else []
    new_shares = list(set(existing_shares + user_ids))
    sandbox.shared_with = new_shares

    db.commit()
    db.refresh(sandbox)

    logger.info(f"Shared sandbox {sandbox_id} with users: {user_ids}")
    return sandbox


@router.get("/{sandbox_id}/collaborators", response_model=List[SandboxCollaboratorResponse])
def get_collaborators(
    sandbox_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get active collaborators in a sandbox"""
    sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sandbox not found"
        )

    # Check access
    if not check_sandbox_access(sandbox, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this sandbox"
        )

    # Get active collaborators (not left yet)
    collaborators = (
        db.query(SandboxCollaborator)
        .filter(
            SandboxCollaborator.sandbox_id == sandbox_id,
            SandboxCollaborator.left_at.is_(None)
        )
        .all()
    )

    return collaborators


@router.post("/{sandbox_id}/snapshot", response_model=SandboxResponse)
def create_snapshot(
    sandbox_id: int,
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a snapshot (copy) of the sandbox"""
    sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sandbox not found"
        )

    # Check access
    if not check_sandbox_access(sandbox, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this sandbox"
        )

    # Create snapshot
    snapshot = SandboxSession(
        owner_id=current_user.id,
        name=name,
        description=f"Snapshot of: {sandbox.name}",
        language=sandbox.language,
        project_id=sandbox.project_id,
        shared_with=[],
        files=sandbox.files.copy() if sandbox.files else {},
        runtime_config=sandbox.runtime_config.copy() if sandbox.runtime_config else {},
        version=1,
        parent_snapshot_id=sandbox.id,
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    logger.info(f"Created snapshot {snapshot.id} from sandbox {sandbox_id}")
    return snapshot


# WebSocket connection manager for real-time collaboration
class SandboxConnectionManager:
    """Manage WebSocket connections for sandbox collaboration"""

    def __init__(self):
        # Dictionary: sandbox_id -> list of (websocket, user_id)
        self.active_connections: dict[int, list[tuple[WebSocket, int]]] = {}

    async def connect(self, websocket: WebSocket, sandbox_id: int, user_id: int):
        """Connect a user to a sandbox"""
        await websocket.accept()

        if sandbox_id not in self.active_connections:
            self.active_connections[sandbox_id] = []

        self.active_connections[sandbox_id].append((websocket, user_id))
        logger.info(f"User {user_id} connected to sandbox {sandbox_id}")

    def disconnect(self, sandbox_id: int, user_id: int):
        """Disconnect a user from a sandbox"""
        if sandbox_id in self.active_connections:
            self.active_connections[sandbox_id] = [
                (ws, uid) for ws, uid in self.active_connections[sandbox_id]
                if uid != user_id
            ]

            # Remove sandbox if no more connections
            if not self.active_connections[sandbox_id]:
                del self.active_connections[sandbox_id]

            logger.info(f"User {user_id} disconnected from sandbox {sandbox_id}")

    async def broadcast(self, sandbox_id: int, message: dict, exclude_user: Optional[int] = None):
        """Broadcast a message to all connected users in a sandbox"""
        if sandbox_id not in self.active_connections:
            return

        disconnected = []

        for websocket, user_id in self.active_connections[sandbox_id]:
            # Skip the sender if exclude_user is set
            if exclude_user and user_id == exclude_user:
                continue

            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                disconnected.append(user_id)

        # Clean up disconnected users
        for user_id in disconnected:
            self.disconnect(sandbox_id, user_id)


# Global connection manager
manager = SandboxConnectionManager()


@router.websocket("/{sandbox_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    sandbox_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time collaboration
    Usage: ws://host/api/v1/sandboxes/{sandbox_id}/ws?token=<jwt_token>
    """
    try:
        # Authenticate user from token
        from app.core.security import decode_access_token
        from app.api.dependencies import get_user_from_token

        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            if not user_id:
                await websocket.close(code=1008, reason="Invalid token")
                return

            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                await websocket.close(code=1008, reason="User not found")
                return

        except Exception as e:
            logger.error(f"WebSocket auth error: {e}")
            await websocket.close(code=1008, reason="Authentication failed")
            return

        # Check sandbox access
        sandbox = db.query(SandboxSession).filter(SandboxSession.id == sandbox_id).first()
        if not sandbox:
            await websocket.close(code=1008, reason="Sandbox not found")
            return

        if not check_sandbox_access(sandbox, user):
            await websocket.close(code=1008, reason="Access denied")
            return

        # Connect user
        await manager.connect(websocket, sandbox_id, user.id)

        # Create or update collaborator record
        collaborator = db.query(SandboxCollaborator).filter(
            SandboxCollaborator.sandbox_id == sandbox_id,
            SandboxCollaborator.user_id == user.id,
            SandboxCollaborator.left_at.is_(None)
        ).first()

        if not collaborator:
            collaborator = SandboxCollaborator(
                sandbox_id=sandbox_id,
                user_id=user.id
            )
            db.add(collaborator)
            db.commit()

        # Broadcast user joined
        await manager.broadcast(
            sandbox_id,
            {
                "type": "user_joined",
                "user_id": user.id,
                "timestamp": datetime.utcnow().isoformat()
            },
            exclude_user=user.id
        )

        try:
            while True:
                # Receive message from client
                data = await websocket.receive_json()
                message_type = data.get("type")

                # Update last activity
                collaborator.last_activity = datetime.utcnow()

                if message_type == "cursor_move":
                    # Update cursor position
                    collaborator.cursor_position = data.get("position")
                    db.commit()

                    # Broadcast cursor position to others
                    await manager.broadcast(
                        sandbox_id,
                        {
                            "type": "cursor_update",
                            "user_id": user.id,
                            "position": data.get("position")
                        },
                        exclude_user=user.id
                    )

                elif message_type == "typing":
                    # Update typing status
                    collaborator.is_typing = data.get("is_typing", False)
                    db.commit()

                    # Broadcast typing status
                    await manager.broadcast(
                        sandbox_id,
                        {
                            "type": "typing_update",
                            "user_id": user.id,
                            "is_typing": collaborator.is_typing,
                            "file": data.get("file")
                        },
                        exclude_user=user.id
                    )

                elif message_type == "file_change":
                    # File content changed
                    # Broadcast change to others (they'll pull the latest)
                    await manager.broadcast(
                        sandbox_id,
                        {
                            "type": "file_changed",
                            "user_id": user.id,
                            "file_path": data.get("file_path"),
                            "timestamp": datetime.utcnow().isoformat()
                        },
                        exclude_user=user.id
                    )

                elif message_type == "execution_started":
                    # Code execution started
                    await manager.broadcast(
                        sandbox_id,
                        {
                            "type": "execution_started",
                            "user_id": user.id,
                            "file_path": data.get("file_path"),
                            "timestamp": datetime.utcnow().isoformat()
                        },
                        exclude_user=user.id
                    )

                elif message_type == "execution_completed":
                    # Code execution completed
                    await manager.broadcast(
                        sandbox_id,
                        {
                            "type": "execution_completed",
                            "user_id": user.id,
                            "success": data.get("success"),
                            "timestamp": datetime.utcnow().isoformat()
                        },
                        exclude_user=user.id
                    )

        except WebSocketDisconnect:
            # User disconnected
            manager.disconnect(sandbox_id, user.id)

            # Update collaborator record
            collaborator.left_at = datetime.utcnow()
            db.commit()

            # Broadcast user left
            await manager.broadcast(
                sandbox_id,
                {
                    "type": "user_left",
                    "user_id": user.id,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )

    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await websocket.close(code=1011, reason="Internal server error")
        except:
            pass
