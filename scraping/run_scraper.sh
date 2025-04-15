#!/bin/bash

# Set the working directory to the script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate virtual environment if it exists
if [ -d "../.venv" ]; then
    source "../.venv/bin/activate"
fi

if ! command -v python &> /dev/null; then
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    exit 1
fi

# Install dependencies if needed
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    exit 1
fi

# Install playwright browsers if needed
python -m playwright install chromium
if [ $? -ne 0 ]; then
    exit 1
fi

# Run the script
python main.py 
SCRIPT_EXIT_CODE=$?

# Deactivate virtual environment
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
fi

exit $SCRIPT_EXIT_CODE 