# anchor-click

Makes entire card elements clickable by delegating clicks to an anchor link within. Useful for card-based layouts where you want a large clickable area without wrapping everything in an `<a>` tag (which is invalid HTML for block-level content).

Handles text selection (no accidental navigation), Ctrl+click and middle-click (opens in new tab), and dynamically added cards via MutationObserver.

## Installation

```
npm install anchor-click
```

Or include directly via a `<script>` tag:

```html
<script src="anchorClick.min.js"></script>
```

## Usage

Add `data-card` to any card element and `data-card-link` to the anchor inside it:

```html
<div data-card>
  <h2><a href="/page" data-card-link>Title</a></h2>
  <p>Clicking anywhere on this card navigates to /page.</p>
</div>
```

The card automatically receives the class `is-clickable-card`, which you can use to style it:

```css
.is-clickable-card {
  cursor: pointer;
}
```

## Multiple links in one card

If a card contains multiple links, use a named reference to specify which link should act as the primary click target:

```html
<div data-card="primary">
  <h2><a href="/page" data-card-link="primary">Title</a></h2>
  <a href="/other">Other link</a>
</div>
```

## Ignoring elements

Add `data-card-ignore` to any element inside a card that should not trigger navigation:

```html
<div data-card>
  <a href="/page" data-card-link>Title</a>
  <button data-card-ignore>Add to favourites</button>
</div>
```

Buttons and anchor tags are always ignored automatically.

## Behaviour

- **Text selection** — clicking and dragging to select text does not trigger navigation (threshold: 200ms).
- **Ctrl+click / middle-click** — opens the link in a new tab.
- **Dynamic content** — cards added to the DOM after page load are handled automatically via `MutationObserver`.

## License

MIT
