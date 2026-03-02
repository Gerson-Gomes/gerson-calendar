# Specification: PKGBUILD Version Update (2.2.0)

## Overview
Update the Arch Linux `PKGBUILD` file to reflect the new application version `2.2.0`. This ensures that users building the package from source get the latest stable version with the correct metadata.

## Functional Requirements
- **Version Update**: Update `pkgver` from `2.1.1` to `2.2.0`.
- **Release Reset**: Update `pkgrel` to `1`.
- **Validation**: Ensure the `PKGBUILD` remains valid and functional for building the application.

## Non-Functional Requirements
- **Consistency**: Maintain the existing build logic and directory structure within the `PKGBUILD`.
- **Reliability**: Verify that the build process correctly handles the local source code copy into the isolated sandbox.

## Acceptance Criteria
- `PKGBUILD` file has `pkgver=2.2.0`.
- `PKGBUILD` file has `pkgrel=1`.
- A successful build can be initiated using `makepkg` (or simulated if environment constraints apply).

## Out of Scope
- Adding new features to the application.
- Changing runtime or build-time dependencies (unless strictly required for the version bump).
- Updating the application source code itself.
