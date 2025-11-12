"""
Sandbox Execution Service
Handles code execution in isolated Docker containers
"""
import asyncio
import json
import tempfile
import os
import time
from typing import Dict, Tuple, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SandboxExecutionService:
    """Service for executing code in isolated sandbox environments"""

    # Resource limits
    DEFAULT_TIMEOUT = 30  # seconds
    MAX_TIMEOUT = 300  # 5 minutes
    DEFAULT_MEMORY_LIMIT = "256m"
    DEFAULT_CPU_LIMIT = "0.5"  # 50% of one CPU

    # Supported languages and their Docker images
    LANGUAGE_IMAGES = {
        "python": "python:3.11-slim",
        "javascript": "node:18-alpine",
        "typescript": "node:18-alpine",
    }

    # Command templates for different languages
    LANGUAGE_COMMANDS = {
        "python": "python {file}",
        "javascript": "node {file}",
        "typescript": "npx ts-node {file}",
    }

    def __init__(self):
        """Initialize the sandbox service"""
        self.docker_available = self._check_docker_availability()

    def _check_docker_availability(self) -> bool:
        """Check if Docker is available"""
        try:
            # Try to run a simple docker command
            import subprocess
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception as e:
            logger.warning(f"Docker not available: {e}")
            return False

    async def execute_code(
        self,
        code: str,
        language: str,
        timeout: int = DEFAULT_TIMEOUT,
        file_name: Optional[str] = None,
    ) -> Tuple[bool, str, Optional[str], int]:
        """
        Execute code in an isolated sandbox

        Args:
            code: Code to execute
            language: Programming language (python, javascript, typescript)
            timeout: Execution timeout in seconds
            file_name: Optional file name (e.g., 'main.py')

        Returns:
            Tuple of (success, output, error, duration_ms)
        """
        start_time = time.time()

        # Validate language
        if language not in self.LANGUAGE_IMAGES:
            return False, "", f"Unsupported language: {language}", 0

        # Validate timeout
        if timeout > self.MAX_TIMEOUT:
            timeout = self.MAX_TIMEOUT

        # Determine file extension and name
        if not file_name:
            extensions = {
                "python": "py",
                "javascript": "js",
                "typescript": "ts",
            }
            file_name = f"main.{extensions.get(language, 'txt')}"

        try:
            if self.docker_available:
                # Use Docker for isolated execution
                success, output, error = await self._execute_in_docker(
                    code, language, file_name, timeout
                )
            else:
                # Fallback to local execution (less secure, for development only)
                logger.warning("Docker not available, using local execution (insecure!)")
                success, output, error = await self._execute_locally(
                    code, language, file_name, timeout
                )

            duration_ms = int((time.time() - start_time) * 1000)
            return success, output, error, duration_ms

        except asyncio.TimeoutError:
            duration_ms = int((time.time() - start_time) * 1000)
            return False, "", f"Execution timed out after {timeout}s", duration_ms
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Execution error: {e}", exc_info=True)
            return False, "", f"Execution error: {str(e)}", duration_ms

    async def _execute_in_docker(
        self,
        code: str,
        language: str,
        file_name: str,
        timeout: int,
    ) -> Tuple[bool, str, Optional[str]]:
        """Execute code in a Docker container"""
        import subprocess

        # Create temporary directory for code
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write code to file
            file_path = os.path.join(temp_dir, file_name)
            with open(file_path, "w") as f:
                f.write(code)

            # Get Docker image and command
            image = self.LANGUAGE_IMAGES[language]
            command_template = self.LANGUAGE_COMMANDS[language]
            command = command_template.format(file=file_name)

            # Build Docker command
            docker_cmd = [
                "docker", "run",
                "--rm",  # Remove container after execution
                "--network", "none",  # No network access
                "--memory", self.DEFAULT_MEMORY_LIMIT,
                "--cpus", self.DEFAULT_CPU_LIMIT,
                "--read-only",  # Read-only filesystem
                "--tmpfs", "/tmp:rw,noexec,nosuid,size=65536k",  # Temp directory
                "-v", f"{temp_dir}:/workspace:ro",  # Mount code directory (read-only)
                "-w", "/workspace",  # Set working directory
                image,
                "sh", "-c", command
            ]

            # Execute
            try:
                result = await asyncio.wait_for(
                    asyncio.create_subprocess_exec(
                        *docker_cmd,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE,
                    ),
                    timeout=timeout + 5  # Add buffer for Docker overhead
                )

                stdout, stderr = await asyncio.wait_for(
                    result.communicate(),
                    timeout=timeout
                )

                output = stdout.decode('utf-8', errors='replace')
                error = stderr.decode('utf-8', errors='replace')

                success = result.returncode == 0
                return success, output, error if error else None

            except asyncio.TimeoutError:
                # Kill the container if it's still running
                try:
                    subprocess.run(
                        ["docker", "ps", "-q", "--filter", f"ancestor={image}"],
                        capture_output=True,
                        timeout=5
                    )
                except:
                    pass
                raise

    async def _execute_locally(
        self,
        code: str,
        language: str,
        file_name: str,
        timeout: int,
    ) -> Tuple[bool, str, Optional[str]]:
        """
        Execute code locally without Docker (INSECURE - for development only)
        WARNING: This should never be used in production
        """
        logger.warning("⚠️  INSECURE LOCAL EXECUTION - FOR DEVELOPMENT ONLY")

        with tempfile.TemporaryDirectory() as temp_dir:
            # Write code to file
            file_path = os.path.join(temp_dir, file_name)
            with open(file_path, "w") as f:
                f.write(code)

            # Determine execution command
            if language == "python":
                cmd = ["python3", file_path]
            elif language == "javascript":
                cmd = ["node", file_path]
            elif language == "typescript":
                cmd = ["npx", "ts-node", file_path]
            else:
                return False, "", f"Unsupported language: {language}"

            # Execute
            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=temp_dir,
                )

                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout
                )

                output = stdout.decode('utf-8', errors='replace')
                error = stderr.decode('utf-8', errors='replace')

                success = process.returncode == 0
                return success, output, error if error else None

            except asyncio.TimeoutError:
                try:
                    process.kill()
                except:
                    pass
                raise

    async def create_sandbox_container(
        self,
        sandbox_id: int,
        language: str,
    ) -> Optional[str]:
        """
        Create a persistent Docker container for a sandbox session
        Returns container ID or None if failed
        """
        if not self.docker_available:
            logger.warning("Docker not available, cannot create persistent container")
            return None

        try:
            import subprocess

            image = self.LANGUAGE_IMAGES.get(language)
            if not image:
                logger.error(f"Unsupported language: {language}")
                return None

            # Pull image if not exists
            subprocess.run(
                ["docker", "pull", image],
                capture_output=True,
                timeout=60
            )

            # Create container (but don't start it yet)
            container_name = f"sandbox_{sandbox_id}"
            result = subprocess.run(
                [
                    "docker", "create",
                    "--name", container_name,
                    "--network", "none",
                    "--memory", self.DEFAULT_MEMORY_LIMIT,
                    "--cpus", self.DEFAULT_CPU_LIMIT,
                    image,
                    "sleep", "infinity"
                ],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:
                container_id = result.stdout.strip()
                logger.info(f"Created container {container_id} for sandbox {sandbox_id}")
                return container_id
            else:
                logger.error(f"Failed to create container: {result.stderr}")
                return None

        except Exception as e:
            logger.error(f"Error creating sandbox container: {e}", exc_info=True)
            return None

    async def terminate_sandbox_container(self, container_id: str) -> bool:
        """Terminate and remove a sandbox container"""
        if not self.docker_available or not container_id:
            return False

        try:
            import subprocess

            # Stop container
            subprocess.run(
                ["docker", "stop", container_id],
                capture_output=True,
                timeout=10
            )

            # Remove container
            result = subprocess.run(
                ["docker", "rm", container_id],
                capture_output=True,
                timeout=10
            )

            success = result.returncode == 0
            if success:
                logger.info(f"Terminated and removed container {container_id}")
            else:
                logger.error(f"Failed to remove container {container_id}: {result.stderr}")

            return success

        except Exception as e:
            logger.error(f"Error terminating container: {e}", exc_info=True)
            return False

    def get_language_template(self, language: str) -> str:
        """Get a starter template for the given language"""
        templates = {
            "python": '''# Python Sandbox
print("Hello from Python!")

# Example: Simple calculation
def calculate(x, y):
    return x + y

result = calculate(5, 3)
print(f"5 + 3 = {result}")
''',
            "javascript": '''// JavaScript Sandbox
console.log("Hello from JavaScript!");

// Example: Simple calculation
function calculate(x, y) {
    return x + y;
}

const result = calculate(5, 3);
console.log(`5 + 3 = ${result}`);
''',
            "typescript": '''// TypeScript Sandbox
console.log("Hello from TypeScript!");

// Example: Simple calculation with types
function calculate(x: number, y: number): number {
    return x + y;
}

const result: number = calculate(5, 3);
console.log(\`5 + 3 = \${result}\`);
''',
        }
        return templates.get(language, "// No template available")


# Global instance
sandbox_service = SandboxExecutionService()
