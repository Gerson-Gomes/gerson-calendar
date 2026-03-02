# Specification - Update Build with CSS Changes (App.css)

## Overview
This track involves applying a minor UI change (adding margins to top buttons) in `gerson-calendar/frontend/src/App.css` and generating a new build of the Gerson Calendar application for the Linux platform. No version bump is required for this update.

## Functional Requirements
- **Apply UI Change**: Ensure the updated `App.css` (with added margins on top buttons) is correctly integrated into the frontend build.
- **Build Generation**: Execute the standard Wails build process to generate a new Linux binary.
- **Verification**: Confirm the build completes successfully and the binary is functional.

## Non-Functional Requirements
- **Performance**: The build process should be efficient and utilize existing cache where possible.
- **Consistency**: The new build must maintain the existing application behavior, apart from the CSS adjustment.

## Acceptance Criteria
- [ ] Updated `App.css` exists in the codebase with the specified margin changes.
- [ ] The `wails build` command executes without errors for the Linux target.
- [ ] A new functional binary is produced in the expected output directory.
- [ ] The visual change (margins on top buttons) is verifiable in the application UI (manual check).

## Out of Scope
- **Version Bumping**: No changes to `package.json`, `wails.json`, or `PKGBUILD` versions.
- **Cross-Platform Builds**: Windows and Darwin builds are not required for this track.
- **Functional Logic Changes**: No changes to backend Go code or frontend TypeScript logic.
