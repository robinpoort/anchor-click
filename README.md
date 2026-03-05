# anchor-click

Makes entire items clickable by delegating clicks to an anchor link within. Useful for layouts where you want a large clickable area while still keeping a single, explicit primary link target in complex card markup.

Handles text selection (no accidental navigation), Ctrl+click and middle-click (opens in new tab), touch and pointer devices, and dynamically added items via MutationObserver.

## Installation

```
npm install anchor-click
```

Or include directly via a `<script>` tag:

```html
<script src="anchorClick.min.js"></script>
```

## Usage

Add `data-anchor-target` to any item and `data-anchor` to the anchor inside it, then call `anchorClick()`:

```html
<div data-anchor-target>
  <h2><a href="/page" data-anchor>Title</a></h2>
  <p>Clicking anywhere on this item navigates to /page.</p>
</div>

<script src="anchorClick.min.js"></script>
<script>anchorClick();</script>
```

The item automatically receives the class `is-clickable`, which you can use to style it:

```css
.is-clickable {
  cursor: pointer;
}
```

## Options

All options are optional. Defaults shown below:

```js
const instance = anchorClick({
  parent: 'data-anchor-target',   // attribute on the clickable item
  link: 'data-anchor',      // attribute on the target anchor
  ignore: 'data-anchor-ignore',   // attribute to exclude child elements
  clickableClass: 'is-clickable', // class added to clickable items
  downUpTime: 200,                // max ms between pointerdown/up to count as a click
  onClick: null                   // callback fired on navigation: (item, link) => {}
});
```

## destroy()

`anchorClick()` returns an instance with a `destroy()` method that removes all event listeners, disconnects the MutationObserver and removes `clickableClass` from all items. Useful in SPAs or when switching configurations.

```js
const instance = anchorClick();

// Later:
instance.destroy();
```

## onClick callback

Use `onClick` to run custom logic when an item is navigated to — useful for analytics or state updates:

```js
anchorClick({
  onClick(item, link) {
    console.log('Navigating to', link.href);
  }
});
```

## Multiple links in one item

If an item contains multiple links, use a named reference to specify which link should act as the primary click target:

```html
<div data-anchor-target="primary">
  <h2><a href="/page" data-anchor="primary">Title</a></h2>
  <a href="/other">Other link</a>
</div>
```

## Ignoring elements

Add `data-anchor-ignore` to any element inside an item that should not trigger navigation:

```html
<div data-anchor-target>
  <a href="/page" data-anchor>Title</a>
  <button data-anchor-ignore>Add to favourites</button>
</div>
```

Buttons and anchor tags are always ignored automatically.

## Behaviour

- **Touch & pointer support** — uses `pointerdown`/`pointerup` so mouse, touch and stylus all work.
- **Text selection** — clicking and dragging to select text does not trigger navigation (threshold: 200ms).
- **Ctrl/Meta+click / middle-click** — opens the link in a new tab with `noopener,noreferrer`.
- **Right-click** — ignored, so the browser context menu works as expected.
- **Script in `<head>`** — safe to include before `<body>` exists; initialisation is deferred to `DOMContentLoaded`.
- **Dynamic content** — items added to the DOM after page load are handled automatically via `MutationObserver`.
- **Attribute changes** — adding or removing `data-anchor-target` or `data-anchor` on existing elements is detected automatically.

## License

MIT
