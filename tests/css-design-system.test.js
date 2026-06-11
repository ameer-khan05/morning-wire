import { describe, it, expect } from 'vitest';
import * as csstree from 'css-tree';
import { raw } from './helpers.js';

const css = raw('styles.css');
const ast = csstree.parse(css);

/** Collect all property declarations inside a given selector. */
function propsInSelector(selector) {
  const props = [];
  csstree.walk(ast, {
    visit: 'Rule',
    enter(rule) {
      const sel = csstree.generate(rule.prelude);
      if (sel === selector) {
        csstree.walk(rule.block, {
          visit: 'Declaration',
          enter(decl) {
            props.push(decl.property);
          },
        });
      }
    },
  });
  return props;
}

/** Check that the CSS source contains a given substring. */
function cssContains(str) {
  return css.includes(str);
}

describe('CSS design system — custom properties', () => {
  const rootProps = propsInSelector(':root');

  const required = [
    '--ink',
    '--paper',
    '--accent',
    '--tech',
    '--crypto',
    '--markets',
    '--world',
    '--science',
    '--ticker-bg',
    '--ticker-up',
    '--ticker-down',
    '--font-display',
    '--font-body',
    '--font-mono',
  ];

  it.each(required)(':root defines %s', (prop) => {
    expect(rootProps).toContain(prop);
  });
});

describe('CSS design system — section theme classes', () => {
  const themes = [
    ['body.theme-tech', '--tech'],
    ['body.theme-crypto', '--crypto'],
    ['body.theme-markets', '--markets'],
    ['body.theme-world', '--world'],
    ['body.theme-science', '--science'],
  ];

  it.each(themes)('%s sets --accent to var(%s)', (selector, varRef) => {
    expect(cssContains(selector)).toBe(true);
  });
});

describe('CSS design system — typography', () => {
  it('references Fraunces font family', () => {
    expect(cssContains('Fraunces')).toBe(true);
  });

  it('references Inter font family', () => {
    expect(cssContains('Inter')).toBe(true);
  });

  it('references JetBrains Mono font family', () => {
    expect(cssContains('JetBrains Mono')).toBe(true);
  });
});

describe('CSS design system — accent color values', () => {
  const colors = {
    '--tech': '#4338CA',
    '--crypto': '#B45309',
    '--markets': '#047857',
    '--world': '#B91C1C',
    '--science': '#0E7490',
  };

  it.each(Object.entries(colors))(':root %s equals %s', (prop, value) => {
    expect(css).toContain(`${prop}:${value}`);
  });
});

describe('CSS design system — ticker animation', () => {
  it('defines @keyframes ticker-scroll', () => {
    expect(cssContains('@keyframes ticker-scroll')).toBe(true);
  });

  it('ticker-track uses the ticker-scroll animation', () => {
    expect(cssContains('animation:ticker-scroll')).toBe(true);
  });
});

describe('CSS design system — layout constraints', () => {
  it('topbar is position:sticky', () => {
    expect(cssContains('position:sticky')).toBe(true);
  });

  it('max-width is 1120px for main containers', () => {
    expect(cssContains('max-width:1120px')).toBe(true);
  });

  it('.topbar-nav a.is-active uses the accent color', () => {
    expect(cssContains('.topbar-nav a.is-active')).toBe(true);
    expect(cssContains('color:var(--accent)')).toBe(true);
  });
});
