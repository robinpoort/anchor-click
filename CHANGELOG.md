# Changelog

## [1.0.1] - 2026-03-06

### Changed
- Modernised library source and build script to ES2015+ syntax (const/let, arrow functions, template literals)

### Added
- Demo: floating log panel (fixed bottom-right, shows navigation events and interactions)

### Docs
- Clarified that the `onClick` callback fires before navigation and cannot cancel it
- Documented that keyboard users navigate via the inner `<a>` directly

## [1.0.0] - 2026-03-05

### Added

- Make entire elements clickable by delegating pointer events to a clickable element within
- Configurable via options: `parent`, `target`, `ignore`, `clickableClass`, `downUpTime`, `onClick`
- Named target support — use matching attribute values to target a specific element in multi-target items
- `data-delegate-ignore` attribute to exclude child elements from triggering a click
- Buttons, inputs and anchor tags are always ignored as click sources automatically
- Ctrl/Meta+click and middle-click open anchor targets in a new tab (`noopener,noreferrer`)
- MutationObserver for dynamically added items and attribute changes
- `destroy()` method to remove all event listeners and clean up classes
- UMD build — works as AMD module, CommonJS module, or global script tag
- Safe to include in `<head>` — initialization is deferred to `DOMContentLoaded` if needed
- TypeScript types included
