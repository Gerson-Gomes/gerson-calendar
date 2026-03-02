# Specification: PKGBUILD and README Update (v2.3.0)

## Overview
This track involves updating project metadata and documentation to reflect the new version `2.3.0` and its corresponding features, specifically the sidebar improvements. It also includes the final step of pushing these changes to the remote repository.

## Functional Requirements
1.  **Version Bump**:
    -   Update the `PKGBUILD` file to reflect version `2.3.0`.
    -   Ensure any related fields (like `pkgrel` or checksums if manual) are handled correctly if applicable.
2.  **README Update**:
    -   Update `README.md` to include a description of the sidebar features designed to help users organize their week effectively.
3.  **Source Control**:
    -   Commit the changes with a clear message.
    -   Push the committed changes to the configured remote repository.

## Acceptance Criteria
- [ ] `PKGBUILD` correctly shows `pkgver=2.3.0`.
- [ ] `README.md` contains a section or mention of the sidebar's role in organization.
- [ ] The local changes are successfully pushed and verified on the remote repository.

## Out of Scope
- Functional code changes to the application itself.
- Changes to other build or distribution files (unless directly required by the version bump).
