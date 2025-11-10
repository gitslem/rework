#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run database migrations
# Note: Uncomment the following line once you have created Alembic migrations
# alembic upgrade head

echo "Build completed successfully!"
