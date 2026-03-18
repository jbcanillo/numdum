## Description

Phase 1 core polish: implement edit reminder functionality and improve snooze with datetime picker.

Key changes:
- Add full edit capability for existing reminders (EditReminderForm + integration)
- Extend snooze selector with custom minutes and precise date/time picker
- Update AddReminderForm and EditReminderForm to handle local submission state
- Refresh README.md with new completed features

## Type of change

- [x] New feature (non-breaking change which adds functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring
- [ ] Testing update
- [ ] Build/CI update

## How Has This Been Tested?

1. Build: `npm run build` – compiles successfully (warnings only)
2. Manual testing:
   - Created new reminder
   - Edited an existing reminder (title, date, priority) – changes saved
   - Snoozed with custom minutes – worked
   - Snoozed with datetime picker – worked

## Checklist:

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation (README.md updated)
- [x] My changes generate no new warnings (existing warnings remain unchanged)
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules

## Additional Context

This is the first of the Phase 1 items from the TODO list. The editing UI was already partially present (EditReminderFormModal), but it lacked a clean integration with the ReminderItem and did not work as expected. This change wires it properly and adds the improved snooze with datetime selection.