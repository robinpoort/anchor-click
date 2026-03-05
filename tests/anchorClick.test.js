import { describe, it, expect, beforeEach } from 'vitest';

describe('anchorClick', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('adds clickable class to cards with a link', async () => {
    document.body.innerHTML = `
      <div data-card>
        <a href="/test" data-card-link>Title</a>
      </div>
    `;

    await import('../src/anchorClick.js');

    const card = document.querySelector('[data-card]');
    expect(card.classList.contains('is-clickable-card')).toBe(true);
  });

  it('does not add clickable class to cards without a link', async () => {
    document.body.innerHTML = `
      <div data-card>
        <p>No link here</p>
      </div>
    `;

    await import('../src/anchorClick.js');

    const card = document.querySelector('[data-card]');
    expect(card.classList.contains('is-clickable-card')).toBe(false);
  });
});
