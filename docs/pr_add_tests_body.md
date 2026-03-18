## Description

This PR adds a Jest test suite for the core features implemented in Phase 1, ensuring reliability and preventing regressions.

Coverage includes:
- `AddReminderForm` – form submission, validation, cancel
- `EditReminderForm` – pre‑populated fields, update flow, cancel
- `ReminderItem` – complete, delete, snooze, edit button behavior
- `SnoozeSelector` – preset options, custom minutes, datetime picker

Also adds `src/setupTests.js` to configure Jest matchers (`@testing-library/jest-dom`).

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [x] This change adds tests – no change to app behavior
- [ ] Documentation update
- [ ] Refactoring
- [ ] Testing update
- [ ] Build/CI update

## How Has This Been Tested?

1. `npm test` runs all tests successfully in local environment.
2. Verified mock implementation of `useReminders` hook to isolate component behavior.
3. Tests cover rendering, user interactions, and async submissions.

## Checklist:

- [x] All tests pass locally (`npm test` – CI will verify)
- [x] Code follows style guidelines (ESLint)
- [x] Self‑review completed
- [ ] No changes to documentation needed (tests only)
- [ ] No new warnings introduced
- [x] All new test files are named according to convention (`*.test.js`)
- [ ] Tests are independent and repeatable

## Additional Context

These tests were created to satisfy CI (avoid “No tests found” errors) and to provide a baseline for future development. They mock the `useReminders` hook to focus on component logic. Future tests could include more edge cases and integration tests.