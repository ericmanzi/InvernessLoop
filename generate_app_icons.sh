#!/bin/bash
# Script to generate all required iOS app icon sizes from a source image

set -e

SOURCE_IMAGE="$1"
OUTPUT_DIR="OverrideAssetsLoop.xcassets/AppIcon.appiconset"

if [ -z "$SOURCE_IMAGE" ] || [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Usage: $0 <source_image.png>"
    echo "Please provide a source image (ideally 1024x1024 or larger)"
    exit 1
fi

echo "Generating app icons from $SOURCE_IMAGE..."

# Create backup
if [ ! -d "icon_backup" ]; then
    echo "Creating backup of existing icons..."
    mkdir -p icon_backup
    cp -r "$OUTPUT_DIR"/* icon_backup/
fi

# Generate all required icon sizes
# iOS Marketing (App Store)
convert "$SOURCE_IMAGE" -resize 1024x1024 "$OUTPUT_DIR/Icon.png"

# iPhone and iPad icon sizes
convert "$SOURCE_IMAGE" -resize 20x20 "$OUTPUT_DIR/icon_20pt.png"
convert "$SOURCE_IMAGE" -resize 40x40 "$OUTPUT_DIR/icon_20pt@2x.png"
convert "$SOURCE_IMAGE" -resize 40x40 "$OUTPUT_DIR/icon_20pt@2x-1.png"
convert "$SOURCE_IMAGE" -resize 60x60 "$OUTPUT_DIR/icon_20pt@3x.png"

convert "$SOURCE_IMAGE" -resize 29x29 "$OUTPUT_DIR/icon_29pt.png"
convert "$SOURCE_IMAGE" -resize 58x58 "$OUTPUT_DIR/icon_29pt@2x.png"
convert "$SOURCE_IMAGE" -resize 58x58 "$OUTPUT_DIR/icon_29pt@2x-1.png"
convert "$SOURCE_IMAGE" -resize 87x87 "$OUTPUT_DIR/icon_29pt@3x.png"

convert "$SOURCE_IMAGE" -resize 40x40 "$OUTPUT_DIR/icon_40pt.png"
convert "$SOURCE_IMAGE" -resize 80x80 "$OUTPUT_DIR/icon_40pt@2x.png"
convert "$SOURCE_IMAGE" -resize 80x80 "$OUTPUT_DIR/icon_40pt@2x-1.png"
convert "$SOURCE_IMAGE" -resize 120x120 "$OUTPUT_DIR/icon_40pt@3x.png"

convert "$SOURCE_IMAGE" -resize 120x120 "$OUTPUT_DIR/icon_60pt@2x.png"
convert "$SOURCE_IMAGE" -resize 180x180 "$OUTPUT_DIR/icon_60pt@3x.png"

convert "$SOURCE_IMAGE" -resize 76x76 "$OUTPUT_DIR/icon_76pt.png"
convert "$SOURCE_IMAGE" -resize 152x152 "$OUTPUT_DIR/icon_76pt@2x.png"

convert "$SOURCE_IMAGE" -resize 167x167 "$OUTPUT_DIR/icon_83.5@2x.png"

echo "✓ All icon sizes generated successfully!"
echo ""
echo "Icon files updated in: $OUTPUT_DIR"
echo "Backup saved in: icon_backup/"
echo ""
echo "Next steps:"
echo "1. Review the generated icons"
echo "2. Run: git diff to see changes"
echo "3. Run: git add OverrideAssetsLoop.xcassets/AppIcon.appiconset/"
echo "4. Commit the changes"
