#!/bin/bash

# Set the base directory path
BASE_DIR="/Users/ck/Dev/eigen/alphawrite/packages/edu-datasets/research/twr/twr-2.0"

# Set the output file
OUTPUT_FILE="$BASE_DIR/combined_chapters.md"

# Create or clear the output file
> "$OUTPUT_FILE"

# Loop through chapters 5-11 and concatenate them
for i in {5..11}; do
    CHAPTER_FILE="$BASE_DIR/Chapter $i.md"
    
    # Check if the chapter file exists
    if [ -f "$CHAPTER_FILE" ]; then
        # Append the chapter content
        cat "$CHAPTER_FILE" >> "$OUTPUT_FILE"
    else
        echo "Warning: Chapter $i not found at $CHAPTER_FILE"
    fi
done

echo "Combined chapters have been saved to $OUTPUT_FILE"