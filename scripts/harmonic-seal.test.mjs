#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import yaml from 'js-yaml';

const root = new URL('../', import.meta.url).pathname;
const source = readFileSync(`${root}assets/js/harmonic-seal.js`, 'utf8');
const context = vm.createContext({ window: {}, console });
vm.runInContext(source, context);
const { flattenRows, boardsEqual, describeRows, pulseBoard, tutorialStepAfterEvent } = context.window.HarmonicSeal;
const data = yaml.load(readFileSync(`${root}_data/harmonic_seal.yml`, 'utf8'));

const expected = [
  {
    initial: ['10011', '01001', '01000', '01110', '10001'],
    target: ['10001', '01010', '00100', '01010', '10001'],
    sequence: [[3, 3], [2, 4]],
  },
  {
    initial: ['01100', '11100', '11011', '00111', '00110'],
    target: ['00100', '00100', '11111', '00100', '00100'],
    sequence: [[2, 2], [3, 3], [4, 4]],
  },
  {
    initial: ['11110', '11101', '11011', '10111', '01111'],
    target: ['00100', '01010', '10001', '01010', '00100'],
    sequence: [[1, 1], [2, 4], [4, 2], [5, 5]],
  },
  {
    initial: ['10000', '01111', '00011', '11000', '10011'],
    target: ['01110', '10001', '10101', '10001', '01110'],
    sequence: [[1, 3], [2, 1], [3, 4], [4, 5], [5, 2]],
  },
];

assert.equal(data.title, 'The Harmonic Seal');
assert.equal(data.folios.length, 4);

data.folios.forEach((folio, index) => {
  assert.deepEqual(folio.initial, expected[index].initial, `Folio ${index + 1} initial rows drifted`);
  assert.deepEqual(folio.target, expected[index].target, `Folio ${index + 1} target rows drifted`);
  [...folio.initial, ...folio.target].forEach((row) => assert.match(row, /^[01]{5}$/));
  let board = flattenRows(folio.initial);
  const target = flattenRows(folio.target);
  expected[index].sequence.forEach(([row, column], pulseIndex) => {
    board = pulseBoard(board, (row - 1) * 5 + column - 1);
    if (pulseIndex < expected[index].sequence.length - 1) {
      assert.equal(boardsEqual(board, target), false, `Folio ${index + 1} completed before its final verified pulse`);
    }
  });
  assert.equal(boardsEqual(board, target), true, `Folio ${index + 1} verified sequence did not solve`);
  const description = describeRows(folio.target);
  assert.match(description, /^Target pattern by row\. Row 1:/, `Folio ${index + 1} target description starts with its first row`);
  assert.match(description, /; Row 5: (?:awake|dormant)/, `Folio ${index + 1} target description includes its fifth row`);
  assert.equal((description.match(/\b(?:awake|dormant)\b/g) || []).length, 25, `Folio ${index + 1} target description exposes all 25 states`);
});

const blank = Array(25).fill(0);
const changed = (board) => board.map((value, index) => value ? index : -1).filter((index) => index >= 0);
assert.equal(changed(pulseBoard(blank, 12)).join(','), '7,11,12,13,17', 'center pulse mask');
assert.equal(changed(pulseBoard(blank, 2)).join(','), '1,2,3,7', 'edge pulse mask');
assert.equal(changed(pulseBoard(blank, 0)).join(','), '0,1,5', 'corner pulse mask');
assert.equal(Array.from(pulseBoard(pulseBoard(blank, 24), 24)).join(','), blank.join(','), 'double pulse is identity');

let tutorialBoard = flattenRows(expected[0].initial);
let tutorialStep = tutorialStepAfterEvent('guided-first', { event: 'restart', folioIndex: 0 });
tutorialBoard = pulseBoard(tutorialBoard, 12);
tutorialStep = tutorialStepAfterEvent(tutorialStep, { event: 'pulse', folioIndex: 0, folioComplete: false });
assert.equal(tutorialStep, 'independent-second', 'the valid guided pulse advances the lesson');
tutorialBoard = pulseBoard(tutorialBoard, 12);
tutorialStep = tutorialStepAfterEvent(tutorialStep, { event: 'pulse', folioIndex: 0, folioComplete: false });
assert.equal(Array.from(tutorialBoard).join(','), flattenRows(expected[0].initial).join(','), 'repeating the guided pulse reverses the board');
assert.equal(tutorialStep, 'independent-second', 'reversing to the initial board does not restore the guide');
tutorialStep = tutorialStepAfterEvent(tutorialStep, { event: 'undo', folioIndex: 0, folioComplete: false });
assert.equal(tutorialStep, 'independent-second', 'undo does not unlearn the guided pulse');
tutorialStep = tutorialStepAfterEvent('complete', { event: 'undo', folioIndex: 0, folioComplete: false });
assert.equal(tutorialStep, 'independent-second', 'undoing a completed Folio I returns to the learned step');
tutorialStep = tutorialStepAfterEvent(tutorialStep, { event: 'restart', folioIndex: 0 });
assert.equal(tutorialStep, 'guided-first', 'explicit folio restart restores the guide');

let longHistoryBoard = [...blank];
const history = [];
for (let index = 0; index < 31; index += 1) {
  history.push([...longHistoryBoard]);
  longHistoryBoard = pulseBoard(longHistoryBoard, index % 25);
}
while (history.length) longHistoryBoard = history.pop();
assert.equal(Array.from(longHistoryBoard).join(','), blank.join(','), 'more than 25 snapshots undo to origin');

for (const forbidden of ['localStorage', 'sessionStorage', 'fetch(', 'XMLHttpRequest', 'sendBeacon', 'canvas', 'Math.random']) {
  assert.equal(source.includes(forbidden), false, `game source contains forbidden capability: ${forbidden}`);
}

const include = readFileSync(`${root}_includes/navigation.html`, 'utf8');
assert.equal((include.match(/role="grid"/g) || []).length, 1, 'one current-chord grid');
assert.match(include, /data-harmonic-seal-target[^>]*role="img"|role="img"[^>]*data-harmonic-seal-target/);
assert.match(include, /aria-describedby="harmonic-target-description"/);
assert.match(include, /data-harmonic-seal-target-description/);
const gameMarkup = include.slice(include.indexOf('<section class="harmonic-seal"'));
assert.doesNotMatch(gameMarkup, /score|timer|move count|\bpar\b|hint|solution/i);

const styles = readFileSync(`${root}_sass/objects/_harmonic-seal.scss`, 'utf8');
assert.match(styles, /\.harmonic-seal-invitation\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/, 'hidden invitation overrides its enhanced grid display');
const home = readFileSync(`${root}index.html`, 'utf8');
const actionsMarkup = home.match(/<div class="atelier-actions">([\s\S]*?)<\/div>/)?.[1] || '';
assert.equal((actionsMarkup.match(/<a class="atelier-button/g) || []).length, 2, 'hero actions contain only the two primary page links');
assert.doesNotMatch(actionsMarkup, /harmonic-seal|<button/, 'Play does not share the hero action row');
assert.match(home, /<aside class="harmonic-seal-invitation" data-harmonic-seal-invitation hidden aria-labelledby="harmonic-seal-invitation-title">/, 'invitation starts wholly hidden and labels itself with its title');
assert.match(home, /aria-hidden="true">✦<\/span>/, 'invitation mark is decorative');
assert.match(home, /Playable interlude · \{\{ site\.data\.harmonic_seal\.folios \| size \}\} folios/, 'invitation derives its folio count from data');
assert.match(home, /id="harmonic-seal-invitation-title">\{\{ site\.data\.harmonic_seal\.title \}\}/, 'invitation title comes from Harmonic Seal data');
assert.equal(data.invitation, 'Match the target chord by pulsing a sigil and each direct neighbour.', 'invitation compactly states the goal and mechanic');
assert.match(home, /\{\{ site\.data\.harmonic_seal\.invitation \}\}/, 'invitation goal and mechanic come from Harmonic Seal data');
assert.match(home, /data-wayfinder-open="harmonic-seal">Play The Harmonic Seal<\/button>/, 'Play visible copy supplies its accessible name');
assert.doesNotMatch(home.match(/<button class="atelier-button harmonic-seal-trigger"[\s\S]*?<\/button>/)?.[0] || '', /aria-label/, 'Play has no redundant aria-label');
const triggerRule = styles.match(/\.atelier-button\.harmonic-seal-trigger\s*\{([^}]+)\}/)?.[1] || '';
for (const declaration of [
  /appearance:\s*none/,
  /align-self:\s*center/,
  /box-sizing:\s*border-box/,
  /min-height:\s*46px/,
  /background:\s*rgba\(189,\s*139,\s*71,\s*\.08\)/,
  /cursor:\s*pointer/,
  /font:\s*inherit/,
]) assert.match(triggerRule, declaration, `Play reset/style includes ${declaration}`);
assert.doesNotMatch(triggerRule, /animation|transition/, 'Play has no constant attention effect');
const invitationRule = styles.match(/\.harmonic-seal-invitation\s*\{([^}]+)\}/)?.[1] || '';
for (const declaration of [
  /grid-template-columns:\s*auto minmax\(0, 1fr\) auto/,
  /max-width:\s*38rem/,
  /border-left:\s*3px/,
  /linear-gradient/,
]) assert.match(invitationRule, declaration, `invitation folio-slip treatment includes ${declaration}`);
assert.doesNotMatch(invitationRule, /animation|transition|glow|pulse/, 'invitation has no attention effect');

console.log('PASS (Harmonic Seal rules, authored boards, and static contracts).');
