# Phase 4: Polish & Production Readiness

## Goal
Harden the Reminder App for real-world usage: reliability, accessibility, performance, and test coverage.

---

## 1. Offline Support (PWA)

- Add `public/manifest.json` for installability
- Service worker via Workbox (or CRA default)
- Cache-first strategy for static assets; network-first for data
- Show offline indicator in header
- Ensure journal/reminder forms handle offline queue (optional for MVP)

**Deliverable:** App is installable as PWA; works offline with last-known data.

---

## 2. Error Handling & Loading States

- Replace generic “Loading…” with skeleton screens
- Add toast notifications for:
  - Backup success/failure
  - Restore success/failure
  - Reminder/journal CRUD results
- Error boundaries for component-level failures
- Network error handling with retry UI

**Deliverable:** Consistent, user-friendly feedback everywhere.

---

## 3. Accessibility (a11y)

- Keyboard navigation: all interactive elements reachable
- ARIA labels for icon buttons, charts, tooltips
- Focus management (trap focus in full-page forms)
- Contrast check against WCAG AA
- Screen reader announcements for dynamic updates
- Test with VoiceOver/NVDA

**Deliverable:** Passes automated a11y audit (eslint-plugin-jsx-a11y) and manual checks.

---

## 4. Performance Tuning

- Lazy load heavy components (charts, forms) with React.lazy
- Code-split routes via React Router
- Optimize images/icons (lucide-react already small)
- Reduce re-renders: memoize components, useMemo for derived data
- Measure with Lighthouse; target >90 PWA score

**Deliverable:** Faster initial load, smooth interactivity.

---

## 5. Testing

- Unit tests: increase coverage to >80%
  - Already have analytics/Stat tests; add form validation tests
- Integration tests with React Testing Library for user flows
- E2E tests using Playwright:
  - Create/edit/delete reminder
  - Create/edit/delete journal entry
  - Backup/restore full flow
  - Navigation and page transitions
  - Offline/online behavior

**Deliverable:** CI runs tests on PR; E2E tests in GitHub Actions.

---

## 6. Code Quality & Docs

- Enforce strict TypeScript types (if not already)
- Update `README.md` with:
  - Setup steps
  - Architecture overview
  - Testing commands
  - Deployment instructions
- Add `CONTRIBUTING.md` with PR template
- Clean TODOs and dead code

**Deliverable:** Codebase is maintainable and documented.

---

## Implementation Order

1. **Sprint 1:**
   - Toasts + error boundaries
   - Skeleton loading states
   - Basic PWA manifest + service worker

2. **Sprint 2 (Alarms & Notifications):**
   - Service Worker with IndexedDB for persistent alarms
   - `notificationSync` util and auto-alarm sync from reminders state
   - Enable Notifications button in header
   - Notification click actions with snooze (10 min / 1 hr)
   - Alarms survive app restarts and device reboots

3. **Sprint 3:**
   - Accessibility pass
   - Performance optimizations (lazy, code split)

4. **Sprint 4:**
   - Unit test expansion
   - Playwright setup and first E2E flows
   - Docs, final polish, CI integration
   - Staging deploy and smoke tests

---

## Success Metrics

- Lighthouse score: Performance >90, Accessibility >90, PWA >90
- Test coverage: statements >85%
- Zero critical/eslint errors on CI
- No reported a11y violations

---

## Risks & Mitigations

- **PWA complexity:** Use Workbox CLI; keep service worker minimal
- **E2E flakiness:** Use `playwright-test` with stable selectors and waits
- **Accessibility gaps:** Consider external audit if time-constrained

---

Next step: create detailed tasks per item and start Sprint 1. Approve to proceed?
