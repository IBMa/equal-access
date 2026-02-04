#!/bin/bash

# Script to update npm dependencies in all package.json directories
# Saves the root directory and returns to it at the end

# Save the root directory
ROOT_DIR=$(pwd)

echo "Starting dependency updates from: $ROOT_DIR"
echo "================================================"

# Find all package.json files (excluding node_modules)
# Extract unique directories and run npm update in each
find . -name "package.json" -not -path "*/node_modules/*" | while read -r package_file; do
    # Get the directory containing the package.json
    package_dir=$(dirname "$package_file")
    
    echo ""
    echo "Updating dependencies in: $package_dir"
    echo "------------------------------------------------"
    
    # Change to the directory
    cd "$ROOT_DIR/$package_dir" || continue
    
    # Run npm update
    npm update
    
    # Check if npm update was successful
    if [ $? -eq 0 ]; then
        echo "✓ Successfully updated dependencies in $package_dir"
    else
        echo "✗ Failed to update dependencies in $package_dir"
    fi
done

# Return to root directory
cd "$ROOT_DIR" || exit

echo ""
echo "================================================"
echo "Dependency updates complete. Returned to: $(pwd)"
