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
assert.equal(constellations.horizonFade(-1), 0);
assert.equal(constellations.horizonFade(0), 0);
assert.equal(constellations.horizonFade(12), 1);
assert.equal(constellations.horizonFade(20), 1);
const fades = Array.from({ length: 25 }, (_, index) => constellations.horizonFade(index / 2));
assert.ok(fades.every((value, index) => index === 0 || value >= fades[index - 1]), 'horizon smoothstep is monotonic');
assert.ok(Math.abs(constellations.horizonFade(6) - .5) < 1e-9, 'horizon fade is a smoothstep midpoint');
assert.ok(constellations.project({ altitude: 1, azimuth: 0 }, 400, 300).horizonOpacity > 0, 'visible near-horizon stars fade smoothly from zero');
assert.equal(constellations.project({ altitude: 12, azimuth: 0 }, 400, 300).horizonOpacity, 1, 'horizon fade clears by twelve degrees');
const catalog = JSON.parse(readFileSync(`${root}assets/data/wayfinder-constellations.json`, 'utf8'));
const ids = new Set(catalog.stars.map((star) => star.id));
const hips = new Set(catalog.stars.map((star) => star.hip));
const memberIds = new Set(catalog.constellations.flatMap((entry) => entry.lines.flat()));
const declaredIds = catalog.constellations.flatMap((entry) => entry.members);
assert.equal(catalog.constellations.length, 18, 'catalog contains exactly 18 constellation figures');
assert.ok(catalog.stars.length >= 85 && catalog.stars.length <= 110, 'catalog stays within the 85–110 member-star target');
assert.equal(hips.size, catalog.stars.length, 'every star has a unique HIP identifier');
assert.equal(catalog.constellations.filter((entry) => entry.hemisphere === 'north').length, 7);
assert.equal(catalog.constellations.filter((entry) => entry.hemisphere === 'equatorial').length, 4);
assert.equal(catalog.constellations.filter((entry) => entry.hemisphere === 'south').length, 7);
assert.deepEqual(
  catalog.constellations.map((entry) => entry.name).sort(),
  ['Andromeda','Aquila','Carina','Cassiopeia','Centaurus','Crux','Cygnus','Leo','Lyra','Orion','Perseus','Piscis Austrinus','Sagittarius','Scorpius','Taurus','Ursa Major','Ursa Minor','Vela'].sort(),
);
assert.equal(ids.size, memberIds.size, 'catalog contains no field stars');
assert.equal(new Set(declaredIds).size, declaredIds.length, 'each star is declared in exactly one constellation');
assert.equal(new Set(declaredIds).size, ids.size, 'every catalog star has a declared constellation');
ids.forEach((id) => assert.ok(memberIds.has(id), `${id} belongs to a constellation figure`));
memberIds.forEach((id) => assert.ok(ids.has(id), `${id} exists`));
catalog.constellations.forEach((constellation) => {
  assert.ok(['north', 'equatorial', 'south'].includes(constellation.hemisphere), `${constellation.name} has a valid hemisphere`);
  assert.ok(Number.isFinite(constellation.labelPriority) && Number.isInteger(constellation.labelPriority) && constellation.labelPriority >= 1 && constellation.labelPriority <= 3, `${constellation.name} has a normalized label priority`);
  const declaredMembers = new Set(constellation.members);
  constellation.lines.flat().forEach((id) => assert.ok(declaredMembers.has(id), `${id} is declared as a member of ${constellation.name}`));
  constellation.members.forEach((id) => assert.ok(ids.has(id), `${constellation.name} member ${id} exists`));
  const essential = constellation.members.map((id) => catalog.stars.find((star) => star.id === id)).filter((star) => star.mag > 3.5);
  assert.ok(essential.length <= 1, `${constellation.name} has at most one topology-essential member fainter than V=3.50`);
});
const overFour = catalog.stars.filter((star) => star.mag > 4);
assert.deepEqual(overFour.map((star) => star.hip), [111954], 'HIP 111954 is the sole documented V>4 topology exception');
catalog.stars.forEach((star) => {
  assert.equal(star.id, `h${star.hip}`, `${star.id} is auditable from its HIP identifier`);
  assert.ok(Number.isFinite(star.ra) && star.ra >= 0 && star.ra < 360);
  assert.ok(Number.isFinite(star.dec) && star.dec >= -90 && star.dec <= 90);
  assert.ok(Math.abs(star.ra * 10000 - Math.round(star.ra * 10000)) < 1e-7, `${star.id} RA is rounded to four decimals`);
  assert.ok(Math.abs(star.dec * 10000 - Math.round(star.dec * 10000)) < 1e-7, `${star.id} Dec is rounded to four decimals`);
  assert.ok(Math.abs(star.mag * 100 - Math.round(star.mag * 100)) < 1e-7, `${star.id} magnitude is rounded to two decimals`);
});

const desktop = constellations.profileForWidth(1280);
const tablet = constellations.profileForWidth(768);
const compact = constellations.profileForWidth(390);
assert.equal(desktop.name, 'desktop'); assert.equal(desktop.maxLabels, 7); assert.equal(desktop.maxFigures, 18);
assert.equal(tablet.name, 'tablet'); assert.equal(tablet.magnitudeLimit, 3.5); assert.equal(tablet.maxLabels, 4); assert.equal(tablet.maxFigures, 18);
assert.equal(compact.name, 'compact'); assert.equal(compact.magnitudeLimit, 2.75); assert.equal(compact.maxLabels, 0); assert.equal(compact.maxFigures, 6); assert.equal(compact.maxStars, 28);
for (const [width, expected] of [[320,'compact'],[576,'compact'],[577,'tablet'],[768,'tablet'],[1025,'desktop']]) {
  assert.equal(constellations.profileForWidth(width).name, expected, `${width}px selects ${expected}`);
}
const allVisible = new Map(catalog.stars.map((star) => [star.id, { horizonOpacity: .8 }]));
const compactFigures = constellations.rankVisibleFigures(catalog, allVisible, compact);
assert.ok(compactFigures.length <= 6);
assert.ok(compactFigures.flatMap((entry) => entry.visibleMembers).length <= 28);
assert.ok(compactFigures.every((entry) => entry.visibleMembers.every((id) => catalog.stars.find((star) => star.id === id).mag <= 2.75)));
assert.equal(
  compactFigures.map((entry) => entry.figure.name).join('|'),
  constellations.rankVisibleFigures(catalog, allVisible, compact).map((entry) => entry.figure.name).join('|'),
  'compact ranking is deterministic',
);

for (const date of [new Date('2026-01-01T00:00:00Z'), new Date('2026-07-01T12:00:00Z')]) {
  for (const latitude of [60, 0, -60]) {
    const worldPoints = new Map(catalog.stars.map((star) => [star.id, constellations.project(constellations.horizontalPosition(star.ra, star.dec, latitude, 0, date), 600, 600)]));
    const worldSelection = constellations.rankVisibleFigures(catalog, worldPoints, desktop);
    assert.ok(worldSelection.length > 0, `sky selection exists at latitude ${latitude} on ${date.toISOString()}`);
    if (latitude === 60) assert.ok(worldSelection.some(({ figure }) => figure.hemisphere === 'north'), 'northern figures are selected at +60°');
    if (latitude === -60) assert.ok(worldSelection.some(({ figure }) => figure.hemisphere === 'south'), 'southern figures are selected at -60°');
  }
}

for (const ra of [0, 90, 180, 270, 360]) {
  const sample = constellations.galacticEquatorPoint(ra);
  assert.ok(Number.isFinite(sample.ra) && Number.isFinite(sample.dec));
  assert.ok(sample.ra >= 0 && sample.ra < 360 && sample.dec >= -90 && sample.dec <= 90);
}
const galacticSamples = constellations.sampleGalacticEquator({ latitude: 0, longitude: 0 }, new Date('2026-01-01T00:00:00Z'), 600, 600, 3);
assert.ok(galacticSamples.some(Boolean) && galacticSamples.some((sample) => sample === null), 'galactic wash breaks cleanly at the horizon');
assert.ok(galacticSamples.filter(Boolean).every((sample) => Number.isFinite(sample.x) && Number.isFinite(sample.y)), 'galactic wash projections stay finite');
for (const profile of [desktop, tablet, compact]) {
  const layers = constellations.milkyWayLayers(profile);
  assert.equal(layers.length, 2, `${profile.name} uses a two-layer Milky Way wash`);
  assert.ok(layers.every((layer) => Number.isFinite(layer.width) && layer.width > 0 && Number.isFinite(layer.opacity) && layer.opacity > 0));
  assert.ok(layers[0].width > layers[1].width, 'wide atmospheric wash sits behind its brighter core');
}

const labelProfile = constellations.profileForWidth(1280);
const labelPoints = new Map([
  ['a', { x: 90, y: 90, altitude: 30 }], ['b', { x: 110, y: 95, altitude: 25 }], ['c', { x: 100, y: 110, altitude: 20 }],
  ['d', { x: 92, y: 92, altitude: 35 }], ['e', { x: 112, y: 97, altitude: 28 }], ['f', { x: 102, y: 112, altitude: 22 }],
]);
const labelEntries = [
  { figure: { name: 'First', labelPriority: 1 }, visibleMembers: ['a','b','c'] },
  { figure: { name: 'Second', labelPriority: 2 }, visibleMembers: ['d','e','f'] },
];
const placed = constellations.placeLabels(labelEntries, labelPoints, labelProfile, 340, 260, () => 40);
assert.equal(placed.length, 2, 'eight-offset search finds a collision-free alternative');
assert.ok(!((placed[0].box.left < placed[1].box.right) && (placed[0].box.right > placed[1].box.left) && (placed[0].box.top < placed[1].box.bottom) && (placed[0].box.bottom > placed[1].box.top)), 'accepted labels do not overlap');
const skyRadius = 260 * .46;
placed.forEach(({ box }) => [[box.left,box.top],[box.right,box.top],[box.left,box.bottom],[box.right,box.bottom]].forEach(([x,y]) => assert.ok(Math.hypot(x - 170, y - 130) <= skyRadius, 'label corners remain inside the circular sky')));
const centerPoints = new Map([['a',{x:170,y:130,altitude:80}],['b',{x:171,y:130,altitude:80}],['c',{x:169,y:130,altitude:80}]]);
assert.equal(constellations.placeLabels([labelEntries[0]], centerPoints, labelProfile, 340, 260, () => 90).length, 0, 'central medallion exclusion rejects every unsafe offset');
const lowPoints = new Map([['a',{x:100,y:100,altitude:11}],['b',{x:110,y:100,altitude:10}],['c',{x:105,y:110,altitude:9}]]);
assert.equal(constellations.placeLabels([labelEntries[0]], lowPoints, labelProfile, 340, 260, () => 40).length, 0, 'desktop labels require three members and twelve-degree clearance');
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
assert.match(script, /window\.addEventListener\('resize', scheduleDraw\)/, 'resize uses the coalesced scheduler');
assert.match(script, /if \(resizeFrame !== null\) return;/, 'only one resize frame can be queued');
assert.doesNotMatch(script, /setInterval|requestAnimationFrame\([^)]*draw/, 'constellation rendering does not animate continuously');
console.log('PASS (Wayfinder visible-constellation math and privacy contract).');
