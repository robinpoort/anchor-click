import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import clickDelegation from '../src/clickDelegation.js';

describe('clickDelegation — default attributes', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('adds clickable class to items with a link', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');
    expect(item.classList.contains('is-clickable')).toBe(true);
  });

  it('does not add clickable class to items without a link', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <p>No link here</p>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');
    expect(item.classList.contains('is-clickable')).toBe(false);
  });

  it('returns a destroy method', () => {
    instance = clickDelegation();
    expect(typeof instance.destroy).toBe('function');
  });

  it('removes clickable class on destroy', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');
    expect(item.classList.contains('is-clickable')).toBe(true);
    instance.destroy();
    expect(item.classList.contains('is-clickable')).toBe(false);
  });
});

describe('clickDelegation — custom attributes', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('uses custom clickableClass option', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    instance = clickDelegation({ clickableClass: 'my-custom-class' });
    const item = document.querySelector('[data-delegate]');
    expect(item.classList.contains('my-custom-class')).toBe(true);
  });

  it('calls onClick callback on navigation', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick });
    const item = document.querySelector('[data-delegate]');
    const link = document.querySelector('[data-delegate-to]');

    // Simulate a fast pointerdown + pointerup
    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).toHaveBeenCalledWith(item, link);
  });

  it('removes pending DOMContentLoaded listener when destroyed before init', () => {
    const bodyGetter = vi.spyOn(document, 'body', 'get').mockReturnValue(null);
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    instance = clickDelegation();
    instance.destroy();

    const domReadyHandler = addSpy.mock.calls.find((call) => call[0] === 'DOMContentLoaded')?.[1];
    expect(typeof domReadyHandler).toBe('function');
    expect(removeSpy).toHaveBeenCalledWith('DOMContentLoaded', domReadyHandler);

    bodyGetter.mockRestore();
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Named links
// ---------------------------------------------------------------------------

describe('clickDelegation — named links', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('navigates to the named link when parent has a matching value', () => {
    document.body.innerHTML = `
      <div data-delegate="primary">
        <a href="/primary" data-delegate-to="primary">Primary</a>
        <a href="/secondary">Secondary</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick });
    const item = document.querySelector('[data-delegate]');
    const link = document.querySelector('[data-delegate-to="primary"]');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).toHaveBeenCalledWith(item, link);
  });

  it('does not navigate when clicking on a secondary link inside a named-link item', () => {
    document.body.innerHTML = `
      <div data-delegate="primary">
        <a href="/primary" data-delegate-to="primary">Primary</a>
        <a href="/secondary" id="secondary-link">Secondary</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick });

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    document.getElementById('secondary-link').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Ignored elements
// ---------------------------------------------------------------------------

describe('clickDelegation — ignored elements', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('does not navigate when clicking on a data-delegate-ignore element', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
        <span id="ignored" data-delegate-ignore>Ignored</span>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick });

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    document.getElementById('ignored').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not navigate when clicking on an independent anchor tag', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
        <a href="/other" id="other-link">Other</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick });

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    document.getElementById('other-link').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not navigate when clicking inside a button', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
        <button id="btn">Action</button>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick });

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    document.getElementById('btn').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// MutationObserver
// ---------------------------------------------------------------------------

describe('clickDelegation — MutationObserver', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('adds clickable class to dynamically added items', async () => {
    instance = clickDelegation();

    const item = document.createElement('div');
    item.setAttribute('data-delegate', '');
    item.innerHTML = '<a href="/test" data-delegate-to>Title</a>';
    document.body.appendChild(item);

    await new Promise(r => setTimeout(r, 0));

    expect(item.classList.contains('is-clickable')).toBe(true);
  });

  it('removes clickable class when data-delegate is removed', async () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');
    expect(item.classList.contains('is-clickable')).toBe(true);

    item.removeAttribute('data-delegate');
    await new Promise(r => setTimeout(r, 0));

    expect(item.classList.contains('is-clickable')).toBe(false);
  });

  it('adds clickable class when data-delegate-to is added to a link', async () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" id="link">Title</a>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');
    expect(item.classList.contains('is-clickable')).toBe(false);

    document.getElementById('link').setAttribute('data-delegate-to', '');
    await new Promise(r => setTimeout(r, 0));

    expect(item.classList.contains('is-clickable')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Timing (downUpTime)
// ---------------------------------------------------------------------------

describe('clickDelegation — timing (downUpTime)', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('navigates when pointer is released within downUpTime', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick, downUpTime: 200 });
    const item = document.querySelector('[data-delegate]');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    vi.advanceTimersByTime(100);
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).toHaveBeenCalled();
  });

  it('does not navigate when pointer is held longer than downUpTime', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick, downUpTime: 200 });
    const item = document.querySelector('[data-delegate]');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    vi.advanceTimersByTime(250);
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not navigate after pointercancel resets the press', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick, downUpTime: 200 });
    const item = document.querySelector('[data-delegate]');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    window.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, isPrimary: true }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Modifier keys / new tab
// ---------------------------------------------------------------------------

describe('clickDelegation — modifier keys', () => {
  let instance;
  let openSpy;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it('opens in new tab on ctrl+click', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true, button: 0, ctrlKey: true }));

    expect(openSpy).toHaveBeenCalledWith(expect.any(String), '_blank', 'noopener,noreferrer');
  });

  it('opens in new tab on meta+click', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true, button: 0, metaKey: true }));

    expect(openSpy).toHaveBeenCalledWith(expect.any(String), '_blank', 'noopener,noreferrer');
  });

  it('opens in new tab on middle-click', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 1 }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true, button: 1 }));

    expect(openSpy).toHaveBeenCalledWith(expect.any(String), '_blank', 'noopener,noreferrer');
  });
});

// ---------------------------------------------------------------------------
// Destroy
// ---------------------------------------------------------------------------

describe('clickDelegation — destroy', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('stops navigating after destroy is called', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <a href="/test" data-delegate-to>Title</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = clickDelegation({ onClick });
    instance.destroy();

    const item = document.querySelector('[data-delegate]');
    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Non-anchor targets (buttons)
// ---------------------------------------------------------------------------

describe('clickDelegation — non-anchor targets', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('calls click() on a button target', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <button data-delegate-to id="btn">Action</button>
      </div>
    `;
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');
    const btn = document.getElementById('btn');
    const clickSpy = vi.spyOn(btn, 'click');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('calls click() instead of window.open on ctrl+click when target has no href', () => {
    document.body.innerHTML = `
      <div data-delegate>
        <button data-delegate-to id="btn">Action</button>
      </div>
    `;
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    instance = clickDelegation();
    const item = document.querySelector('[data-delegate]');
    const btn = document.getElementById('btn');
    const clickSpy = vi.spyOn(btn, 'click');

    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true, button: 0, ctrlKey: true }));

    expect(openSpy).not.toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Build and runtime safety
// ---------------------------------------------------------------------------

describe('clickDelegation — build and runtime safety', () => {
  it('keeps dist/clickDelegation.js in sync with src/clickDelegation.js', () => {
    const src = readFileSync(resolve('src/clickDelegation.js'), 'utf8');
    const dist = readFileSync(resolve('dist/clickDelegation.js'), 'utf8');
    expect(dist).toBe(src);
  });

  it('does not throw when evaluated without document (SSR/Node)', () => {
    const source = readFileSync(resolve('src/clickDelegation.js'), 'utf8');
    const context = {
      module: { exports: {} },
      exports: {},
      global: {}
    };

    expect(() => vm.runInNewContext(source, context)).not.toThrow();
    expect(typeof context.module.exports).toBe('function');
  });

  it('dist/clickDelegation.esm.js exports a function as default', () => {
    const esmSource = readFileSync(resolve('dist/clickDelegation.esm.js'), 'utf8');

    // Must start with the factory assignment (build.js string-slice is intact)
    expect(esmSource).toMatch(/^const clickDelegation = \(function \(window\)/);

    // Must end with a proper default export
    expect(esmSource).toMatch(/export default clickDelegation;\s*$/);
  });
});
