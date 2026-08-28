import { existsSync, readFileSync, statSync } from 'node:fs';

let failures = 0;

function check(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    return;
  }

  failures += 1;
  console.error(`FAIL: ${message}`);
}

const cssPath = '_site/assets/css/main.css';
check(existsSync(cssPath), 'the production artifact contains compiled main.css');

if (existsSync(cssPath)) {
  const css = readFileSync(cssPath, 'utf8');
  check(statSync(cssPath).size >= 50_000, 'compiled main.css is at least 50 KB');
  check(/(?:^|})[^@{}][^{]*\{[^{}]*:[^{};]+;?/m.test(css), 'main.css contains concrete CSS declarations');
  check(!/@(?:use|forward)\b/.test(css), 'main.css contains no raw Sass module directives');
}

const canonicalPosts = [
  '_site/2020/01/13/first-voyage-of-rubist-into-clojure.html',
  '_site/2023/02/10/why-implementing-proper-use-cases-brought-joy-into-my-code.html',
  '_site/2023/02/16/taming-your-app-with-domains.html',
];

for (const path of canonicalPosts) {
  check(existsSync(path), `canonical post output exists: ${path.replace('_site', '')}`);
}

const shiftedPosts = [
  '_site/2020/01/14/first-voyage-of-rubist-into-clojure.html',
  '_site/2023/02/11/why-implementing-proper-use-cases-brought-joy-into-my-code.html',
  '_site/2023/02/17/taming-your-app-with-domains.html',
];

for (const path of shiftedPosts) {
  check(!existsSync(path), `UTC-shifted post output is absent: ${path.replace('_site', '')}`);
}

const cnamePath = '_site/CNAME';
check(existsSync(cnamePath), 'the Pages artifact retains CNAME');
if (existsSync(cnamePath)) {
  check(readFileSync(cnamePath, 'utf8').trim() === 'hlavezzo.me', 'CNAME targets hlavezzo.me');
}

if (failures) {
  console.error(`\nFAIL: ${failures} production compatibility issue(s).`);
  process.exit(1);
}

console.log('\nPASS: Jekyll 4 production artifact compatibility.');
