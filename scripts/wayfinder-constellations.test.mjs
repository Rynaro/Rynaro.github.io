#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url).pathname;
let ready;
const context = { document: { addEventListener: (_event, callback) => { ready = callback; } }, window: { addEventListener() {} }, navigator: {}, fetch() {}, console, Date, Math };
vm.runInNewContext(readFileSync(`${root}assets/js/sigil-navigation.js`, 'utf8'), context);
assert.equal(typeof ready, 'function');
const constellations = context.window.WayfinderConstellations;
const failedClasses = new Set();
const failedChart = {
  classList: { add: (name) => failedClasses.add(name) },
  querySelector: (selector) => ({
    '[data-wayfinder-constellations]': { getContext: () => null },
    '[data-constellation-locate]': {},
    '[data-constellation-status]': {}
  })[selector]
};
assert.equal(constellations.mount(failedChart), null);
assert.equal(failedClasses.has('are-constellations-ready'), false, 'failed canvas mount leaves controls hidden');
const pole = constellations.horizontalPosition(0, 90, 35, 0, new Date('2026-01-01T00:00:00Z'));
assert.ok(Math.abs(pole.altitude - 35) < 0.0001, 'pole altitude equals latitude');
assert.equal(constellations.project({ altitude: -1, azimuth: 0 }, 400, 400), null);
const zenith = constellations.project({ altitude: 90, azimuth: 123 }, 400, 300);
assert.ok(Math.abs(zenith.x - 200) < 0.0001 && Math.abs(zenith.y - 150) < 0.0001);
const catalog = JSON.parse(readFileSync(`${root}assets/data/wayfinder-constellations.json`, 'utf8'));
const ids = new Set(catalog.stars.map((star) => star.id));
const memberIds = new Set(catalog.constellations.flatMap((entry) => entry.lines.flat()));
const declaredIds = catalog.constellations.flatMap((entry) => entry.members);
assert.equal(ids.size, memberIds.size, 'catalog contains no field stars');
assert.equal(new Set(declaredIds).size, declaredIds.length, 'each star is declared in exactly one constellation');
assert.equal(new Set(declaredIds).size, ids.size, 'every catalog star has a declared constellation');
ids.forEach((id) => assert.ok(memberIds.has(id), `${id} belongs to a constellation figure`));
memberIds.forEach((id) => assert.ok(ids.has(id), `${id} exists`));
catalog.constellations.forEach((constellation) => {
  const declaredMembers = new Set(constellation.members);
  constellation.lines.flat().forEach((id) => assert.ok(declaredMembers.has(id), `${id} is declared as a member of ${constellation.name}`));
  constellation.members.forEach((id) => assert.ok(ids.has(id), `${constellation.name} member ${id} exists`));
});
assert.equal(ids.has('veg'), false, 'Vega is not silently treated as a Cygnus member');
const markup = readFileSync(`${root}_includes/navigation.html`, 'utf8');
assert.match(markup, /data-constellation-locate/);
assert.match(markup, /Visible constellations/);
assert.match(markup, /site's code does not send or store your coordinates/);
assert.match(markup, /astrolabe__utility[\s\S]*astrolabe__close[\s\S]*astrolabe__constellation-controls/, 'close remains first in focus order inside the utility group');
const styles = readFileSync(`${root}_sass/objects/_navigation.scss`, 'utf8');
assert.match(styles, /\.astrolabe__constellation-controls\s*\{\s*display:\s*none/);
assert.match(styles, /\.astrolabe\.are-constellations-ready \.astrolabe__constellation-controls\s*\{\s*display:\s*flex/);
const script = readFileSync(`${root}assets/js/sigil-navigation.js`, 'utf8');
assert.ok(script.indexOf("if (!context) return null") < script.indexOf("chart.classList.add('are-constellations-ready')"), 'controls reveal only after a 2D renderer mounts');
console.log('PASS (Wayfinder visible-constellation math and privacy contract).');
