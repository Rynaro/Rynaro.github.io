import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import yaml from 'js-yaml';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'assets/js/home.js'), 'utf8');
const homeSource = readFileSync(join(root, 'index.html'), 'utf8');
const renderedHome = readFileSync(join(root, '_site/index.html'), 'utf8');
const homepage = yaml.load(readFileSync(join(root, '_data/homepage.yml'), 'utf8'));
const expectedPlates = homepage.hero.plates.map((plate) => ({ src: plate.src, caption: plate.caption }));

function readPng(relativePath) {
  const png = readFileSync(join(root, relativePath.replace(/^\//, '')));
  return {
    signature: png.subarray(0, 8).toString('hex'),
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    colorType: png[25],
  };
}

function runPlateScript(randomValue) {
  let randomCalls = 0;
  let errorHandler;
  const fallback = expectedPlates[0];
  const image = {
    attributes: { src: fallback.src },
    getAttribute(name) { return this.attributes[name]; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(type, handler) { if (type === 'error') errorHandler = handler; },
    removeEventListener(type, handler) { if (type === 'error' && errorHandler === handler) errorHandler = undefined; },
  };
  const caption = { textContent: fallback.caption };
  const template = { content: { textContent: JSON.stringify(expectedPlates) } };
  const plate = {
    querySelector(selector) {
      return {
        '[data-home-plate-image]': image,
        '[data-home-plate-caption]': caption,
        '[data-home-plate-options]': template,
      }[selector] ?? null;
    },
  };
  const context = {
    document: { querySelector: (selector) => selector === '[data-home-plate]' ? plate : null },
    Math: Object.assign(Object.create(Math), {
      random() { randomCalls += 1; return randomValue; },
    }),
  };
  vm.runInNewContext(source, context);
  return { image, caption, getErrorHandler: () => errorHandler, randomCalls };
}

test('homepage declares the two plate options and keeps arrival as its rendered fallback', () => {
  assert.deepEqual(expectedPlates, [
    {
      src: '/assets/images/rynaro-arrival-baroque-860.png',
      caption: 'Rynaro comes from nowhere—and appears exactly where he is needed.',
    },
    {
      src: '/assets/images/rynaro-second-stem-860.png',
      caption: 'When Henrique must become more without becoming less, Rynaro answers.',
    },
  ]);
  assert.doesNotMatch(homeSource, /plate_caption/);
  assert.match(homeSource, /assign fallback_plate = home\.hero\.plates \| first/);
  assert.match(homeSource, /<template data-home-plate-options>/);
  assert.match(renderedHome, /<figure class="atelier-plate" aria-labelledby="plate-caption" data-home-plate>/);
  assert.match(renderedHome, /src="\/assets\/images\/rynaro-arrival-baroque-860\.png"[^>]+width="860" height="860"[^>]+decoding="async"[^>]+data-home-plate-image/);
  assert.match(renderedHome, /<figcaption id="plate-caption" data-home-plate-caption>Rynaro comes from nowhere—and appears exactly where he is needed\.<\/figcaption>/);
});

test('both optimized plate assets are valid 860px RGBA PNGs', () => {
  for (const plate of expectedPlates) {
    assert.deepEqual(readPng(plate.src), {
      signature: '89504e470d0a1a0a',
      width: 860,
      height: 860,
      colorType: 6,
    });
  }
});

test('plate selection is uniform by index and happens exactly once per load', () => {
  const first = runPlateScript(0);
  assert.equal(first.randomCalls, 1);
  assert.equal(first.image.attributes.src, expectedPlates[0].src);
  assert.equal(first.caption.textContent, expectedPlates[0].caption);

  const second = runPlateScript(0.999999);
  assert.equal(second.randomCalls, 1);
  assert.equal(second.image.attributes.src, expectedPlates[1].src);
  assert.equal(second.caption.textContent, expectedPlates[1].caption);
});

test('an image error restores both fallback fields without rerolling', () => {
  const page = runPlateScript(0.999999);
  page.getErrorHandler()();
  assert.equal(page.randomCalls, 1);
  assert.equal(page.image.attributes.src, expectedPlates[0].src);
  assert.equal(page.caption.textContent, expectedPlates[0].caption);
  assert.equal(page.getErrorHandler(), undefined);
});

test('rotation remains guarded and does not use persistence, announcements, or transitions', () => {
  assert.doesNotMatch(source, /localStorage|sessionStorage|aria-live|transition/);
  assert.match(source, /if \(plate\)/);
  assert.match(source, /if \(plateImage && plateCaption && plateOptions\)/);
  assert.match(source, /var constellation = document\.querySelector\('\[data-constellation\]'\)/);
});
