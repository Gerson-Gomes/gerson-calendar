#!/bin/bash

# Load PKGBUILD variables
source PKGBUILD

EXPECTED_VER="2.2.0"
EXPECTED_REL="1"

echo "Checking PKGBUILD metadata..."
echo "Found pkgver: $pkgver (Expected: $EXPECTED_VER)"
echo "Found pkgrel: $pkgrel (Expected: $EXPECTED_REL)"

if [[ "$pkgver" == "$EXPECTED_VER" && "$pkgrel" == "$EXPECTED_REL" ]]; then
    echo "SUCCESS: Metadata matches."
    exit 0
else
    echo "FAILURE: Metadata mismatch."
    exit 1
fi
