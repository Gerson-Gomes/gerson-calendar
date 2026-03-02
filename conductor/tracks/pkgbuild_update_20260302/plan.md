# Implementation Plan: PKGBUILD Version Update (2.2.0)

## Phase 1: Metadata Update [checkpoint: 6f8455f]
- [x] Task: Create a verification script to check `PKGBUILD` metadata. 1106c51
    - [x] Write a script `verify_pkgbuild.sh` that checks for `pkgver=2.2.0` and `pkgrel=1`.
    - [x] Run the script and confirm it fails (Red phase).
- [x] Task: Update `PKGBUILD` file with new version and release info. f76c6dd
    - [x] Update `pkgver` to `2.2.0`.
    - [x] Update `pkgrel` to `1`.
    - [x] Run `verify_pkgbuild.sh` and confirm it passes (Green phase).
- [x] Task: Conductor - User Manual Verification 'Metadata Update' (Protocol in workflow.md) 6f8455f

## Phase 2: Final Integration & Cleanup
- [x] Task: Run a dry-run or lint check on the updated `PKGBUILD`. f6ca74c
    - [x] Run `namcap PKGBUILD` (if available) or simply check for syntax errors.
- [ ] Task: Remove the temporary verification script.
- [ ] Task: Conductor - User Manual Verification 'Final Integration & Cleanup' (Protocol in workflow.md)
