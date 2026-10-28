## What

<!-- What does this PR change? -->

## Why

<!-- Why is this change needed? -->

## How to test

<!-- How to verify the change. -->

## Screenshot / Screen recording

<!-- For UI changes. Remove this section otherwise. -->

## Checklist

### UX

- [ ] Responsive Design: Tested at key breakpoints (mobile, tablet, desktop)
- [ ] Themes: Checked in light and dark mode
- [ ] UI States: Loading, empty, error, success states implemented
- [ ] Error Handling: User-friendly error messages, no unhandled crashes

### Testing

- [ ] Unit tests: New or changed code that needs no fakes is covered in `*.spec.ts(x)`
- [ ] Integration tests: New or changed code that needs a faked network, timer or browser API is covered in `*.integration.spec.ts(x)`
- [ ] E2E tests: Critical user flows still work, and `e2e/*.e2e.ts` is updated when a flow changes

### Documentation

- [ ] README: Updated when setup, scripts or behavior change

### Accessibility (WCAG AA)

- [ ] Keyboard navigation: All actions reachable and usable without a mouse
- [ ] Focus management: Visible focus, logical order, focus moves sensibly after actions
- [ ] Color contrast: 4.5:1 for body text, 3:1 for UI components and large text
- [ ] Accessible names: `aria-label` / `aria-labelledby` agree with what users see
