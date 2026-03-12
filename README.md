# click-delegation

Makes entire elements clickable by delegating clicks to a clickable element within. Works with anchor links, buttons, or any other clickable element. Useful for layouts where you want a large clickable area while still keeping a single, explicit primary target in complex card markup.

Handles text selection (no accidental clicks), Ctrl+click and middle-click on links (opens in new tab), touch and pointer devices, and dynamically added items via MutationObserver.

## Installation

```
npm install click-delegation
```

Or include directly via a `<script>` tag:

```html
<script src="clickDelegation.min.js"></script>
```

## Usage

Add `data-delegate` to any item and `data-delegate-to` to the clickable element inside it, then call `clickDelegation()`:

```html
<div data-delegate>
  <h2><a href="/page" data-delegate-to>Title</a></h2>
  <p>Clicking anywhere on this item navigates to /page.</p>
</div>

<script src="clickDelegation.min.js"></script>
<script>clickDelegation();</script>
```

Works with buttons too:

```html
<div data-delegate>
  <h2>Card title</h2>
  <button data-delegate-to>Open modal</button>
</div>
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
const instance = clickDelegation({
  parent: 'data-delegate',   // attribute on the clickable item
  target: 'data-delegate-to',            // attribute on the target element
  ignore: 'data-delegate-ignore',   // attribute to exclude child elements
  clickableClass: 'is-clickable', // class added to clickable items
  downUpTime: 200,                // max ms between pointerdown/up to count as a click
  onClick: null                   // callback fired on click: (item, target) => {}
});
```

## destroy()

`clickDelegation()` returns an instance with a `destroy()` method that removes all event listeners, disconnects the MutationObserver and removes `clickableClass` from all items. Useful in SPAs or when switching configurations.

```js
const instance = clickDelegation();

// Later:
instance.destroy();
```

## onClick callback

Use `onClick` to run custom logic when an item is clicked — useful for analytics or state updates. The callback fires before the target element's click and cannot cancel it:

```js
clickDelegation({
  onClick(item, target) {
    console.log('Clicked', target);
  }
});
```

## Multiple targets in one item

If an item contains multiple clickable elements, use a named reference to specify which one should act as the primary target:

```html
<div data-delegate="primary">
  <h2><a href="/page" data-delegate-to="primary">Title</a></h2>
  <a href="/other">Other link</a>
</div>
```

## Ignoring elements

Add `data-delegate-ignore` to any element inside an item that should not trigger a click:

```html
<div data-delegate>
  <a href="/page" data-delegate-to>Title</a>
  <button data-delegate-ignore>Add to favourites</button>
</div>
```

Buttons and anchor tags are always ignored as click sources automatically (so they retain their own independent behaviour), unless they carry the `data-delegate-to` attribute themselves.

## Behaviour

- **Keyboard accessibility** — keyboard users interact with the inner target element directly; the library does not add keyboard activation to the container element.
- **Touch & pointer support** — uses `pointerdown`/`pointerup` so mouse, touch and stylus all work.
- **Text selection** — clicking and dragging to select text does not trigger a click (threshold: 200ms).
- **Ctrl/Meta+click / middle-click** — opens anchor links in a new tab with `noopener,noreferrer`. Non-anchor targets (e.g. buttons) receive a regular `click()`.
- **Right-click** — ignored, so the browser context menu works as expected.
- **Script in `<head>`** — safe to include before `<body>` exists; initialisation is deferred to `DOMContentLoaded`.
- **Dynamic content** — items added to the DOM after page load are handled automatically via `MutationObserver`.
- **Attribute changes** — adding or removing `data-delegate` or `data-delegate-to` on existing elements is detected automatically.

## License

MIT
