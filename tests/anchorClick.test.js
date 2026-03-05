import { describe, it, expect, beforeEach, vi } from 'vitest';
import anchorClick from '../src/anchorClick.js';

describe('anchorClick — default attributes', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('adds clickable class to items with a link', () => {
    document.body.innerHTML = `
      <div data-anchor-target>
        <a href="/test" data-anchor>Title</a>
      </div>
    `;
    instance = anchorClick();
    const item = document.querySelector('[data-anchor-target]');
    expect(item.classList.contains('is-clickable')).toBe(true);
  });

  it('does not add clickable class to items without a link', () => {
    document.body.innerHTML = `
      <div data-anchor-target>
        <p>No link here</p>
      </div>
    `;
    instance = anchorClick();
    const item = document.querySelector('[data-anchor-target]');
    expect(item.classList.contains('is-clickable')).toBe(false);
  });

  it('returns a destroy method', () => {
    instance = anchorClick();
    expect(typeof instance.destroy).toBe('function');
  });

  it('removes clickable class on destroy', () => {
    document.body.innerHTML = `
      <div data-anchor-target>
        <a href="/test" data-anchor>Title</a>
      </div>
    `;
    instance = anchorClick();
    const item = document.querySelector('[data-anchor-target]');
    expect(item.classList.contains('is-clickable')).toBe(true);
    instance.destroy();
    expect(item.classList.contains('is-clickable')).toBe(false);
  });
});

describe('anchorClick — custom attributes', () => {
  let instance;

  beforeEach(() => {
    document.body.innerHTML = '';
    if (instance) instance.destroy();
  });

  it('uses custom clickableClass option', () => {
    document.body.innerHTML = `
      <div data-anchor-target>
        <a href="/test" data-anchor>Title</a>
      </div>
    `;
    instance = anchorClick({ clickableClass: 'my-custom-class' });
    const item = document.querySelector('[data-anchor-target]');
    expect(item.classList.contains('my-custom-class')).toBe(true);
  });

  it('calls onClick callback on navigation', () => {
    document.body.innerHTML = `
      <div data-anchor-target>
        <a href="/test" data-anchor>Title</a>
      </div>
    `;
    const onClick = vi.fn();
    instance = anchorClick({ onClick });
    const item = document.querySelector('[data-anchor-target]');
    const link = document.querySelector('[data-anchor]');

    // Simulate a fast pointerdown + pointerup
    window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
    item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, isPrimary: true }));

    expect(onClick).toHaveBeenCalledWith(item, link);
  });
});
