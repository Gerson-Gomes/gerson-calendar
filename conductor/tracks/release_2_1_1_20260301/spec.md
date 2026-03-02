# Track: Apply the new changes in a new version of the build, update PKGBUILD

## Overview
This track focuses on releasing a new version (`2.1.1`) of Gerson Calendar, incorporating recent changes (specifically the new ICS Import/Export features), and updating the associated build and packaging artifacts.

## Scope
- Update the `PKGBUILD` file with the new version number and generate updated checksums.
- Execute the build process to generate the new `2.1.1` application binary using Wails.
- Update project documentation to reflect the new version release.
- Automatically generate and include release notes highlighting the recent ICS Import/Export additions based on recent commits.

## Out of Scope
- No new features or bug fixes beyond those already implemented in the recent commits.
- Modification of existing CI/CD pipelines (unless necessary for the build generation).

## Acceptance Criteria
- [ ] `PKGBUILD` contains `pkgver=2.1.1` and correct, up-to-date checksums.
- [ ] A new, functional binary for version `2.1.1` is successfully built.
- [ ] Relevant documentation (e.g., README, Changelog) mentions version `2.1.1` and summarizes the new features.
- [ ] The updated `PKGBUILD` and documentation are committed to version control.