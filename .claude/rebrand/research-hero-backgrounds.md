# Hero Background Rework — Research Report

**Scope:** Replace the current hero canvas (starfield + nebula + cursor-proximity constellation lines, `assets/js/observatory.js`, 416 lines) with a bespoke, alive, on-brand background for "Henrique A. Lavezzo — Code Alchemist."
**Date:** 2026-07-19
**Hard constraints honored throughout:** first-party code only (vanilla Canvas 2D or raw WebGL/GLSL — no three.js/p5/pixi), WCAG 2.2.2 pause control + reduced-motion *substitution*, no-JS static fallback, bounded CPU/GPU work, AA-legible text on dark palette (#211C30→#312A45, gold #e6a553).

---

## 1. The cliché map — why the current hero reads as "template"

The specific tells that make a hero background read as tutorial-grade in 2024–2026:

1. **Particles joined by proximity lines ("constellation").** This is the single most-copied canvas effect on the web. It is the signature output of particles.js (Vincent Garreau, 2015) and its successor tsParticles — described even by fan articles as "one of the most copied solutions across the web" ([cssscript.com](https://www.cssscript.com/canvas-particle-animation/), [particles.js.org](https://particles.js.org/), [speckyboy round-up](https://speckyboy.com/particle-animation-code-snippets/)). The cursor-linking variant is the default demo config. Any viewer who has seen five startup sites has seen this exact effect.
2. **Slow-drift starfields with no depth story.** Random dots + tiny velocity + wraparound is the first canvas tutorial most people write ([kirupa's 3D starfield tutorial](https://www.kirupa.com/animations/animated_3d_starfield_effect.htm) is literally an intro-to-canvas lesson). Without parallax layers, depth, or narrative it reads as screensaver.
3. **Generic gradient blobs / aurora smears.** Now shipped as stock components by UI kits ([Aceternity "Modern Hero With Gradients"](https://ui.aceternity.com/blocks/hero-sections/modern-hero-with-gradients)) and sold as image packs ([Grainient](https://grainient.supply/collections/hero-gradients)); Design Shack's 2025 trend survey treats "gradient meshes, aurora, blobs" as a commodity category ([designshack.net](https://designshack.net/articles/trends/background-design-trends/)).
4. **The AI-slop signature.** The 2025–26 homogenization critique is now explicit: "you can spot AI-generated landing pages immediately by the purple-to-indigo gradient in the hero… the default color Tailwind CSS shipped with, now appearing on what feels like half the internet" ([Wheels Up Collective, "We Don't Want a Beige Internet"](https://www.wheelsupcollective.com/post/we-dont-want-a-beige-internet)). A dark-violet site with a drifting particle field sits dangerously close to this signature *by accident of palette* — the background must be unmistakably authored to escape it.
5. **Motion without meaning.** The common thread: the effect exists because it was easy, not because it says anything. Awwwards' own editorial on shader effects stresses that what separates featured work is *purposeful implementation* and integration with the site's visual language, not the effect itself ([awwwards.com, "The Rise of Shaders, Filters and Effects"](https://www.awwwards.com/the-rise-of-shaders-filters-and-effects-in-web-projects.html)).

**Verdict on the current hero:** it stacks tells #1 + #2 + (by palette) #4. Keeping any cursor-proximity line-linking in the rework, in any styling, keeps the cliché.

---

## 2. Technique taxonomy

For each: what it is → feel → build → performance → a11y → real examples.

### 2.1 Fragment-shader gradients / aurora / plasma / domain-warped fBm

- **What:** A fullscreen quad + fragment shader computing color per pixel from layered value/simplex noise. The premium version is **domain warping**: `f(p) = fbm(p + fbm(p + fbm(p)))` — feeding noise back into its own coordinates. Canonical reference: Inigo Quilez ([iquilezles.org/articles/warp](https://iquilezles.org/articles/warp/)), whose exact pattern is:
  ```glsl
  vec2 q = vec2(fbm(p + vec2(0.0,0.0)), fbm(p + vec2(5.2,1.3)));
  vec2 r = vec2(fbm(p + 4.0*q + vec2(1.7,9.2)), fbm(p + 4.0*q + vec2(8.3,2.8)));
  float f = fbm(p + 4.0*r);
  // q and r are FREE secondary signals — drive hue/glow from them
  ```
- **Feel:** Smoke, marble, nebular ink, "living mineral." Reads as authored because the color ramp and warp constants are yours; nobody else's field looks the same.
- **Build:** Raw WebGL1 is enough — one program, one fullscreen triangle, ~150 lines of boilerplate. Time uniform advanced slowly. Study pieces: [Shadertoy "Domain warped FBM"](https://www.shadertoy.com/view/wttXz8), [Domain Warping Study](https://www.shadertoy.com/view/W3KyR3), aurora reference [Shadertoy "Auroras" by nimitz](https://www.shadertoy.com/view/XtGGRt).
- **Performance:** 3 nested fBm × 4–5 octaves = ~60 noise evaluations/pixel. Fine on desktop GPUs; on mobile render at half resolution and upscale (imperceptible for smoke), or drop to 3 octaves. Cost is *fixed* per frame — no unbounded work.
- **A11y:** Motion is pure color/opacity evolution — no translation, no parallax, lowest vestibular-risk category per Smashing Magazine's reduced-motion guidance ([smashingmagazine.com](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/)). Freezing the time uniform yields a *premium still* — the substitution problem solves itself.
- **Examples:** the entire "hero shader" genre on Awwwards ([Hero Shader collection](https://www.awwwards.com/awwwards/collections/webgl-shaders-code/)); shader-studio SOTD winners like [Shader Development Studio](https://www.awwwards.com/sites/shader-development-studio).

### 2.2 Flow fields / curl-noise particles

- **What:** Particles advected through a vector field. **Curl noise** is the key upgrade: take the curl of a noise potential (`v = (∂n/∂y, −∂n/∂x)` in 2D via central differences) — the result is divergence-free, so particles *never clump or vacuum out*; they swirl like incompressible fluid ([emildziewanowski.com/curl-noise](https://emildziewanowski.com/curl-noise/), [Chris Arasin's Canvas-2D curl-dots](https://chrisarasin.com/curl-noise-dots/)).
- **Feel:** Ink in water, wind, spirits, "turbulent yet organized." Trails (draw with low-alpha fade instead of clearRect) give a silk/smoke ribbon look ([clicktorelease, "Lines on flow fields"](https://www.clicktorelease.com/code/generative-lines-flow-fields/), [Sighack "Perlin Noise Fields"](https://sighack.com/post/getting-creative-with-perlin-noise-fields), [varun.ca/noise](https://varun.ca/noise/)).
- **Build:** Canvas 2D handles 1,000–3,000 particles with trails at 60fps easily (Arasin's demo is plain Canvas). Raw WebGL GL_POINTS handles 100k+. First-party value-noise implementation is ~40 lines.
- **Performance:** Linear in particle count; fully bounded. Cap count by `devicePixelRatio`/viewport; halve on `navigator.hardwareConcurrency < 4`.
- **A11y:** Continuous drift *is* motion — needs the pause control; but flow motion is local and small-scale (not page-panning), so vestibular risk is moderate-low. Reduced-motion substitute: render one long-exposure pass at load (run the field 300 steps into an offscreen canvas, show the static trail painting — genuinely beautiful stills).
- **Examples:** [charlottedann.com "Magical vector fields"](https://charlottedann.com/article/magical-vector-fields); the UntilLabs hero (below) uses curl noise + fBm for its "molecular" motion layer.

### 2.3 Metaballs / gooey fields

- **What:** Sum of inverse-square falloffs from N moving blobs, thresholded: `Σ rᵢ²/|p−cᵢ|² > T`. In a fragment shader this is a one-liner per ball; on Canvas 2D use marching squares on a coarse grid for vector outlines ([Jamie Wong, "Metaballs and WebGL"](https://jamie-wong.com/2016/07/06/metaballs-and-webgl/), [Codrops "Drawing 2D Metaballs with WebGL2"](https://tympanus.net/codrops/2021/01/19/drawing-2d-metaballs-with-webgl2/), [vishald.com gooey shader](https://vishald.com/blog/gooey-webgl/)).
- **Feel:** Mercury, lava-lamp, alchemical fluid merging/splitting — literally *solve et coagula* as physics.
- **Build:** Fragment shader with 6–10 balls = trivial GPU cost. Smooth-min (`smin`) blending gives the liquid-metal look.
- **Performance:** O(pixels × balls); with ≤12 balls it's near-free.
- **A11y:** Ball motion is slow local drift; freeze positions for the still. Threshold/edge glow can animate via opacity only under reduced motion.
- **Examples:** [Codrops droplet metaballs (2025)](https://tympanus.net/codrops/2025/06/09/how-to-create-interactive-droplet-like-metaballs-with-three-js-and-glsl/); Chamoy Creative gooey effect writeup ([medium/@cmiscm](https://medium.com/@cmiscm/gooey-effect-for-chamoy-creative-4ce0b5ff5baf)).

### 2.4 Voronoi / organic cellular

- **What:** Distance-to-nearest-seed partitioning; IQ's border technique gives mathematically crisp cell edges ([iquilezles.org/articles/voronoilines](https://iquilezles.org/articles/voronoilines/), [cellularffx](https://iquilezles.org/articles/cellularffx/), [Book of Shaders ch. 12](https://thebookofshaders.com/12/)).
- **Feel:** Crystal lattice, cracked glaze, stained glass, cells. Animating seed points slowly makes the lattice breathe.
- **Build:** Pure fragment shader; 3×3 grid neighborhood search keeps it cheap ([Sangil Lee's cellular-noise survey](https://sangillee.com/2025-04-18-cellular-noises/)).
- **Performance:** ~9 distance evaluations per pixel — very cheap.
- **A11y:** Excellent — edge-glow pulsing is pure opacity animation; static lattice is a strong still.
- **Examples:** [Shadertoy "Voronoi - distances"](https://www.shadertoy.com/view/ldl3W8); crystal aesthetics of [Igloo Inc](https://www.awwwards.com/sites/igloo-inc) (procedural crystal growth, Awwwards Site of the Year 2024).

### 2.5 Dithering / halftone / Bayer / CRT

- **What:** Quantize a smooth field to few colors, using an ordered Bayer threshold matrix so the error becomes a visible retro pattern. Recursive definition fits in 3 lines of GLSL ([Codrops "A Quick Guide to Bayer Dithering"](https://tympanus.net/codrops/2025/07/30/interactive-webgl-backgrounds-a-quick-guide-to-bayer-dithering/)):
  ```glsl
  float Bayer2(vec2 a){ a = floor(a); return fract(a.x/2. + a.y*a.y*.75); }
  #define Bayer4(a)  (Bayer2(.5*(a))*.25 + Bayer2(a))
  #define Bayer8(a)  (Bayer4(.5*(a))*.25 + Bayer2(a))
  // color = field > Bayer8(gl_FragCoord.xy) ? ink : paper;
  ```
- **Feel:** Deliberate, crafted, "early bitmap era" — Maxime Heckel: the constraint "contrasts pleasantly against the modern web landscape" ([blog.maximeheckel.com](https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/)). For this site it's also a direct Final-Fantasy-pixel-era signifier.
- **Build:** Fragment shader; combine with any field (fBm, gradient, image luminance). Blue-noise texture variant for a less mechanical grain.
- **Performance:** The Codrops implementation renders "in under 0.2 ms even at 4K" and ships in ~3 KB of shader code — among the cheapest fully-interactive backgrounds possible.
- **A11y:** Superb — the *pattern* carries the aesthetic even when frozen; interaction can be click-triggered ripples (user-initiated motion is outside 2.2.2's auto-start clause).
- **Examples:** **JetBrains' Junie campaign page** used exactly this ([cited by Codrops](https://tympanus.net/codrops/2025/07/30/interactive-webgl-backgrounds-a-quick-guide-to-bayer-dithering/)); [Codrops real-time dithering shader (June 2025)](https://tympanus.net/codrops/2025/06/04/building-a-real-time-dithering-shader/); already commodified into UI kits ([Cult UI "Hero Dithering"](https://www.cult-ui.com/docs/components/hero-dithering)) — so use it as a *finish* on a bespoke field, not as the whole idea.

### 2.6 ASCII / text-mode rendering

- **What:** Divide the frame into cells, map cell luminance to glyph density; glyphs drawn procedurally ("shaders don't have fonts" — Efecto draws characters on a 5×7 pixel grid with math, no font atlas needed) ([Codrops "Efecto", Jan 2026](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/), [Codrops ASCII shader with OGL, Nov 2024](https://tympanus.net/codrops/2024/11/13/creating-an-ascii-shader-using-ogl/)).
- **Feel:** Terminal, code-as-matter. On-brand for an engineer, and the glyph set can be **runes** instead of ASCII — same algorithm, different atlas.
- **Build:** WebGL cell shader, or Canvas 2D `fillText` on a coarse grid (fine at ≤80×45 cells).
- **Performance:** GPU version trivial; Canvas version bounded by cell count, not pixels.
- **A11y:** **Must** be `aria-hidden` and pointer-transparent so the fake text never reaches screen readers or selection. Static frame is characterful.
- **Examples:** [nextjs-ascii-hero demo](https://nextjs-ascii-hero.vercel.app/); Efecto's 8 styles including "matrix" and "braille."

### 2.7 Reaction–diffusion (Gray-Scott)

- **What:** Two virtual chemicals feed/kill each other on a grid; iterate `A' = A + (Dᴬ∇²A − AB² + f(1−A))·Δt`, `B' = B + (Dᴮ∇²B + AB² − (k+f)B)·Δt`. Produces coral, lichen, fingerprint, leopard patterns that *grow* ([pmneila's classic WebGL demo](https://pmneila.github.io/jsexp/grayscott/), [Jérémie Piellard's reaction-diffusion](https://piellardj.github.io/reaction-diffusion-webgl/), [amandaghassaei's shader](https://github.com/amandaghassaei/ReactionDiffusionShader), parameter atlas at [mrob.com/pub/comp/xmorphia](https://www.mrob.com/pub/comp/xmorphia/index.html)).
- **Feel:** Matter organizing itself — the most literal "transmutation" of any technique here. Patterns are emergent, never twice the same, unmistakably not a template.
- **Build:** Raw WebGL ping-pong between two framebuffers (needs float or half-float textures — universally supported since ~2014 per the WebGL Gray-Scott implementations above). ~8–20 sim steps/frame at half resolution.
- **Performance:** Bounded (fixed steps × fixed grid). Key trick: RD **converges** — you can run it toward a stable state and stop, meaning the background can *finish* animating.
- **A11y:** The best 2.2.2 story in the taxonomy: growth-to-stillness within ~4–5 s per user-triggered event is compliant *by construction* (auto-start clause requires >5 s of parallel motion — [W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)). Reduced motion: pre-run the sim invisibly and present the converged still.

### 2.8 Generative sacred geometry / L-systems / cymatics

- **What:** Rule-driven construction of geometric figures. Standout for this brand: **Chladni/cymatic patterns** — standing-wave nodal lines `sin(mπx)·sin(nπy) ± sin(nπx)·sin(mπy) ≈ 0`; integer mode numbers (m,n) each produce a distinct rune-like figure ([CymaVis](https://cymavis.com/), [Shadertoy Chladni emulator](https://www.shadertoy.com/view/3tsSDr), [interactive Chladni simulator](https://pettaboy.github.io/cymaticssimulator_chladni)). L-systems and algorithmic-art context: [Dan MacKinlay's generative-art notebook](https://danmackinlay.name/notebook/generative_art.html), [Samila generator paper](https://arxiv.org/pdf/2504.04298).
- **Feel:** "Hidden order made visible" — the mystical-mathematical register the alchemy brand already occupies; particles settling onto nodal lines look like iron filings obeying an invisible sigil.
- **Build:** Canvas 2D: N particles random-walk downhill on `|chladni(p)|` (settle onto nodal lines in ~2–3 s); or fragment shader: luminous line where `|chladni(p)| < ε`. Trivial math, no noise library needed.
- **Performance:** Cheap either way; the particle version is bounded by count.
- **A11y:** Discrete "re-tune → settle → still" episodes (each <5 s, triggerable by click/scroll) sidestep continuous animation entirely; each rest state is a finished figure.

### 2.9 Ink-/fluid-in-water diffusion

- **What:** Full Navier-Stokes GPU solve (advection/divergence/pressure ping-pong shaders) — the famous [Pavel Dobryakov WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) ([live](https://paveldogreat.github.io/WebGL-Fluid-Simulation)); or cheaper: a dye field advected by curl noise (no pressure solve) — [Tom Larkworthy's "Ink in water"](https://observablehq.com/@tomlarkworthy/ink).
- **Feel:** Luxurious, tactile; pointer strokes leave living ink.
- **Build:** Real fluid = ~6 shader passes/frame + double-buffered FBOs; substantial engineering first-party. Curl-advected dye = one advection pass, much simpler, 80 % of the look.
- **Performance:** Full sim is the heaviest option here (multiple fullscreen passes; battery cost on mobile is real). Half-res sim buffers mandatory.
- **A11y:** Pointer-driven splats are user-initiated (good), but the dissipating dye keeps moving >5 s after input — still needs pause. Reduced motion: static ink-blot still.
- **Caveat:** Dobryakov's demo has been embedded on thousands of sites since 2019 — as a *whole-hero* effect it is now its own cliché tier.

### 2.10 Animated gradient mesh (Stripe-style)

- **What:** Vertex-displaced mesh with per-vertex color blending — Stripe's hero, reverse-engineered widely ([bram.us how-to](https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect/), [minigl gist (~10 kB, ~800 lines)](https://gist.github.com/jordienr/64bcf75f8b08641f205bd6a1a0d4ce1d), [kevinhufnagl.com](https://kevinhufnagl.com/how-to-stripe-website-gradient-effect/)). Note Stripe's own perf discipline: a scroll observer disables the effect when off-screen.
- **Feel:** Corporate-premium… which is exactly the problem. It's Stripe's brand, endlessly cloned.
- **Verdict:** Study its engineering (tiny first-party GL wrapper, off-screen pause); do not copy its look. Cliché tell #3.

### 2.11 Starfields done WELL (depth, warp, story)

- **What:** What separates a good starfield: (a) fragment-shader stars from hashed coordinates, multiple parallax layers ([john-smith.me parallax starfield](https://www.john-smith.me/parallax-starfield-and-texture-mask-effect-in-webgl.html), [rocket-boots/webgl-starfield](https://github.com/rocket-boots/webgl-starfield)); (b) *narrative* — the stars belong to a place, as in Igloo Inc's frozen-landscape scroll journey ([case study](https://www.awwwards.com/igloo-inc-case-study.html)).
- **A11y warning:** warp/zoom starfields are large-scale radial motion — exactly the high vestibular-risk category ([web.dev motion guidance](https://web.dev/learn/accessibility/motion), [Smashing](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/)). Given the owner's verdict and the constraint list, **retire the starfield** rather than rehabilitate it.

### 2.12 Cursor-reactive distortion / repulsion / displacement

- **What:** A persistent low-res "flowmap" texture accumulates pointer velocity with decay; the main shader samples it to displace UVs / bend the field locally ([Codrops "Mouse Flowmap Deformation"](https://tympanus.net/codrops/2019/09/25/mouse-flowmap-deformation-with-ogl/), [Interactive WebGL Hover Effects](https://tympanus.net/codrops/2020/04/14/interactive-webgl-hover-effects/)).
- **Feel:** The background is a *substance* you disturb — categorically different from cursor-line-linking because the response is material (warp, wake, ripple), not diagrammatic (lines).
- **Build:** One extra small FBO (e.g. 128²) + additive splat + decay ≈ 40 lines of GLSL. Canvas-2D equivalent: keep a small grid of displacement vectors, splat + decay in JS.
- **A11y:** Interaction-triggered motion falls under **2.3.3 Animation from Interactions** (allow disabling non-essential interaction motion — [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)); wire it to the same motion toggle. Decay must be short so nothing keeps moving >5 s after input.

### 2.13 Film grain / chromatic aberration overlays

- **What:** Post-process finish: luminance-adaptive noise grain ([mattdesl/glsl-film-grain](https://github.com/mattdesl/glsl-film-grain), [maximmcnair.com film-grain writeup](https://maximmcnair.com/p/webgl-film-grain), [fxhash "All about that grain"](https://www.fxhash.xyz/article/all-about-that-grain)); RGB-split sampling for aberration at edges.
- **Feel:** Removes the "vector-clean" digital look; makes flat gradients feel photographed. Grain alone upgrades a static fallback dramatically.
- **A11y:** Animated grain flicker is motion — keep grain **static** (single hashed frame) under reduced motion; static grain is also the cheapest way to make the no-JS still feel premium.
- **Warning:** aberration at >2 px on text-adjacent areas harms legibility; apply only below/behind a text scrim.

---

## 3. What award-winning sites actually do

Patterns extracted from Awwwards SOTD/SOTY case studies and Codrops case studies (galleries for further mining: [awwwards WebGL](https://www.awwwards.com/websites/webgl/), [godly.website](https://godly.website/), [land-book.com](https://land-book.com/)):

1. **The background enacts the site's one idea.** Igloo Inc (Awwwards **Site of the Year 2024**): procedurally *grown* ice crystals, frost dissolves, portfolio pieces encased in ice — the company is named Igloo ([case study](https://www.awwwards.com/igloo-inc-case-study.html), [technical writeup](https://www.webgpu.com/showcase/igloo-inc-procedural-crystals/)). UntilLabs: mission is "preserving the possibility of life," so a real photograph becomes 60,000 particles moving under fBm + curl noise — "make the experience feel alive" is the stated design goal, and concept drives execution rather than ornament ([Codrops case study, Dec 2025](https://tympanus.net/codrops/2025/12/10/simulating-life-in-the-browser-creating-a-living-particle-system-for-the-untillabs-website/)).
2. **One signature material, not many effects.** Award heroes commit to a single "substance" (ice, ink, dust, dither) and push its fidelity. The Awwwards shader editorial's featured work (Adidas Climazone, Converse Counterclimate, CAMPER FW16) uses effects *tied to the campaign subject* — heat distortion for climate gear, etc. ([awwwards.com](https://www.awwwards.com/the-rise-of-shaders-filters-and-effects-in-web-projects.html)).
3. **Interaction as material response, not UI garnish.** Pointer input disturbs the substance (wake, melt, ripple) rather than spawning decoration. UntilLabs' particles reorganize; Igloo's frost dissolves on transition.
4. **Engineering discipline is part of the craft.** Data baked into textures instead of JSON (UntilLabs: 20 MB → 604 KB); UI text rendered via SDF atlas swaps to avoid relayout (Igloo); Stripe disabling the shader off-viewport. Performance restraint is *itself* a pattern of the winners.
5. **Restraint in the text zone.** Featured heroes keep the effect's contrast/motion away from the headline area or scrim it — the effect frames the message, never competes with it.

**Bespoke vs decorative, distilled:** a decorative background could be swapped onto any other site unchanged; a bespoke one would be *nonsense* on any other site. Test every concept in §4 against that sentence.

---

## 4. On-brand ideation — six concepts for "Code Alchemist"

Shared foundations for all six (details in §5/§6): pause/play control in hero corner; `prefers-reduced-motion` → premium static substitute (never a blank); no-JS fallback = pre-rendered still of the same scene; `visibilitychange` + IntersectionObserver stop the rAF loop; deterministic seed so the fallback still matches the live scene.

### Concept A — "Solve et Coagula" (particle transmutation cycle) ★ flagship candidate

- **Concept & feeling:** The motto, literally enacted. A few thousand gold-and-pastel motes endlessly cycle between two states: **solve** — the assembled figure dissolves into curl-noise turbulence; **coagula** — the cloud condenses onto a target figure (alchemical circle, a rune, or the sigil glyphs the site already owns). The background *is* the brand's thesis: matter dissolved and re-formed, chaos ↔ order. Nothing about it could live on another site.
- **Technique (first-party, Canvas 2D or WebGL points):**
  - Rasterize the target figure once to an offscreen canvas; `getImageData` → sample N target points where alpha > 0 (this is the UntilLabs "data as geometry" move, done with your own SVG sigils instead of a photo).
  - Each particle: `pos += mix(curlNoise(pos, t), (target − pos) * k, phase)` where `phase ∈ [0,1]` eases between solve and coagula. 2-D curl noise from value noise via central differences:
    ```js
    // v = perpendicular gradient of noise => divergence-free swirl
    const e = 0.5;
    const dx = noise(x, y + e) - noise(x, y - e);
    const dy = noise(x + e, y) - noise(x - e, y);
    vx =  dx * S;  vy = -dy * S;   // rotate gradient 90°
    ```
  - 1,500–2,500 particles with alpha-fade trails is comfortably 60 fps in Canvas 2D ([Arasin's curl-dots is plain Canvas](https://chrisarasin.com/curl-noise-dots/)); WebGL GL_POINTS if you ever want 50k.
- **Interaction:** Pointer is the **alchemist's hand**: a gentle curl vortex follows it during *solve* (stirring the dissolved matter); during *coagula* particles near the pointer settle faster, as if attention crystallizes them. **Idle** (no input 30 s): hold the coagulated figure, breathing via opacity only. **Click** = trigger one full solve→coagula cycle toward the *next* figure in a small set (fire/water/air/earth/quintessence — the site's existing element glyphs). Scroll fades the canvas out under the fold.
- **A11y story:** Auto-play mode runs continuously → the pause control covers 2.2.2 ([W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)). A stronger variant: default to **episodic mode** — page load runs exactly one dissolve→condense (≤4.5 s) then rests; every further cycle is click-triggered; auto-start motion never exceeds 5 s, so 2.2.2's auto-start clause is satisfied by construction and the pause button becomes belt-and-braces. Reduced motion: skip straight to the coagulated figure as a static long-exposure render (pre-run trails offscreen), pointer effects off (2.3.3).
- **Why it beats the constellation:** the constellation's particles are random and its lines are noise; here every particle has *purpose and destination* — it's the difference between static and story.

### Concept B — "Prima Materia" (domain-warped aurum field, dither-finished) ★ co-flagship

- **Concept & feeling:** The hero is a slab of **prima materia** — dark violet philosophical smoke (the palette's #211C30→#312A45 as nigredo) shot through with slowly-moving veins of gold (#e6a553, the aurum). Finished with a subtle Bayer-dither quantization so the smoke has the *grain of a 16-bit-era sky* — the Final Fantasy signifier, done as texture rather than pastiche.
- **Technique (raw WebGL fragment shader, ~200 lines total):**
  ```glsl
  // IQ domain warp; q & r drive color for free
  vec2 q = vec2(fbm(p), fbm(p + vec2(5.2,1.3)));
  vec2 r = vec2(fbm(p + 4.0*q + 0.02*t), fbm(p + 4.0*q + vec2(8.3,2.8)));
  float f = fbm(p + 4.0*r);
  vec3 col = mix(NIGREDO, VIOLET, smoothstep(.2,.7,f));
  col = mix(col, AURUM, smoothstep(.68,.86, f * dot(q,q)));   // rare gold veins
  col = floor(col * L + Bayer8(gl_FragCoord.xy)) / L;          // dither finish, L≈6 levels
  ```
  Time scale tiny (`0.02*t`): the field should evolve like weather, not boil. Sources: [IQ warp](https://iquilezles.org/articles/warp/), [Codrops Bayer guide](https://tympanus.net/codrops/2025/07/30/interactive-webgl-backgrounds-a-quick-guide-to-bayer-dithering/) (their measured cost: <0.2 ms at 4K).
- **Interaction:** Pointer = **philosopher's stone**: a small influence field (accumulated in a 128² flowmap with decay, per [Codrops flowmap](https://tympanus.net/codrops/2019/09/25/mouse-flowmap-deformation-with-ogl/)) locally raises the gold threshold — matter *transmutes to gold where touched*, then decays back to lead over ~3 s. Click: a slow gold bloom ripple (Bayer-threshold wave, as in the Codrops click-ripple). No displacement of the field itself near text.
- **A11y story:** Base evolution is pure color-field change (lowest vestibular category), but it's continuous → pause control required and provided; pause freezes `t` (the frozen frame is indistinguishable from an art print). Reduced motion: `t` frozen at the curated seed, pointer transmutation becomes a simple opacity glow or is dropped; dither grain static. No-JS: export the exact seed frame as AVIF/WebP `background-image` — pixel-identical still.
- **Why it beats the constellation:** it replaces a diagram with a *material*; the FF-era grain and gold-vein story are unclonable by a template, and it is the cheapest living background in this list.

### Concept C — "The Great Work grows" (reaction–diffusion gold lichen)

- **Concept & feeling:** Transmutation as *growth*. From the sigil's seed points, a Gray-Scott reaction-diffusion pattern grows across the dark field like gold lichen/coral — organic, slightly uncanny, never the same twice. It visibly *becomes*, then rests.
- **Technique:** Raw WebGL ping-pong FBO pair (half-float), Gray-Scott update (§2.7 equations), f/k chosen from the coral/mitosis region of the [Pearson parameter atlas](https://www.mrob.com/pub/comp/xmorphia/index.html); seed B-chemical from the rasterized sigil. 10–15 steps/frame at half resolution for ~4 s until visually converged, then stop stepping. Color: map B concentration through nigredo→violet→gold ramp. Reference implementations: [pmneila](https://pmneila.github.io/jsexp/grayscott/), [piellardj](https://piellardj.github.io/reaction-diffusion-webgl/).
- **Interaction:** Pointer hover = local feed-rate perturbation → the lichen *reaches toward* the cursor and blooms (then re-converges ≤4 s). Click = drop a reagent seed. Idle = perfect stillness (it's a grown artifact, not a video).
- **A11y story:** The strongest by construction — motion happens in **finite growth episodes ≤5 s**, each auto-started only once at load; everything else is user-triggered. Pause control still shipped (stops mid-growth). Reduced motion: run the growth *invisibly* at load (or precompute), reveal the converged pattern with a single opacity fade.
- **Why it beats the constellation:** emergence is the opposite of template — RD output cannot be faked by a config file, and "watch matter organize itself" is the brand's thesis rendered as chemistry.

### Concept D — "Chladni Sigils" (cymatic resonance figures)

- **Concept & feeling:** Invisible resonance organizes dust into rune-geometry. Fine gold particles settle onto the nodal lines of standing waves — every mode number pair (m,n) is a different "sigil," discovered rather than drawn. Deeply alchemical (vibration → form; the *unseen order*), and adjacent to the site's existing sacred-geometry circle.
- **Technique (Canvas 2D, no noise lib needed):** particles gradient-descend on `|C(p)|` where `C(p) = sin(mπx)sin(nπy) + sin(nπx)sin(mπy)` ([CymaVis](https://cymavis.com/) documents the classical equation; toy references: [Shadertoy Chladni](https://www.shadertoy.com/view/3tsSDr), [pettaboy simulator](https://pettaboy.github.io/cymaticssimulator_chladni)). Settle time ~2–3 s; add per-particle jitter ∝ `|C|` so lines shimmer faintly at rest (opacity-level motion).
- **Interaction:** Scroll or click **re-tunes** the plate to the next (m,n) — dust migrates to the new figure in one ≤4 s episode. Pointer emits a tiny local vibration that briefly scatters nearby dust (it re-settles). Could tune (m,n) from pointer position quantized to integers — "find the resonances."
- **A11y story:** Same episodic structure as C — finite settle episodes, rest states are still figures; auto-start = one settle at load (<5 s). Reduced motion: show the settled figure immediately, no scatter response.
- **Why it beats the constellation:** the geometry is *earned* from physics rather than randomly linked, and mode-switching gives the pointer/scroll a discoverable, game-like delight (very RPG: "you found resonance VII").

### Concept E — "Runic Ashfall" (rune-mode rendering of a living field)

- **Concept & feeling:** The lower atmosphere of the hero is rendered in **text-mode — but the glyph set is the site's runes**, not ASCII. A slow domain-warped field's luminance chooses which rune (or blank) each cell shows and at what gold intensity: code-as-matter, an engineer's terminal possessed by alchemy.
- **Technique:** Coarse grid (≈72×40 cells). Canvas 2D: precompute each rune sprite once to offscreen canvases, then blit per cell by field luminance (bounded by cell count, cheap); or WebGL cell shader with a self-made rune atlas texture (the [Efecto](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/) / [Codrops OGL ASCII](https://tympanus.net/codrops/2024/11/13/creating-an-ascii-shader-using-ogl/) architecture). Field = 3-octave fBm, very slow t.
- **Interaction:** Pointer brightens/sharpens glyphs in a small radius (revealing "legible" runes in the noise — a decode moment); click briefly cascades a column, FF-battle-intro style. Idle: near-still, single-cell twinkles (opacity only).
- **A11y story:** `aria-hidden="true"` + `pointer-events: none` mandatory (§2.6). Continuous cell changes → pause control; reduced motion → static rune field frame (excellent still — it reads as an inscription).
- **Why it beats the constellation:** it's the only concept that fuses the *engineer* and *alchemist* identities in one image, and text-mode is currently a distinctive award-scene aesthetic ([Efecto](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/)) that templates haven't commodified with runes.

### Concept F — "Quicksilver" (metaball mercury under the circle)

- **Concept & feeling:** A pool of slow liquid metal — 8–10 metaballs in violet-black with gold rim-light — merging and splitting beneath the hero content: mercury, the alchemist's element, forever dividing and rejoining (solve/coagula again, as fluid).
- **Technique:** Fragment shader field `Σ rᵢ²/|p−cᵢ|²` with smooth-min blending, thresholded with a soft edge + fresnel-ish gold rim (`smoothstep` band at the threshold). Ball centers on slow Lissajous paths. ([Jamie Wong](https://jamie-wong.com/2016/07/06/metaballs-and-webgl/), [Codrops WebGL2 metaballs](https://tympanus.net/codrops/2021/01/19/drawing-2d-metaballs-with-webgl2/).)
- **Interaction:** Pointer is a repulsor — the mercury *shies away* then re-merges (material response, cf. §2.12); click splits the nearest blob in two (they slowly re-coagulate).
- **A11y story:** Slow local drift; pause freezes positions (a still of merged mercury is handsome). Reduced motion: static merged pool, gold rim breathing via opacity only or fully static.
- **Why it beats the constellation:** a single tangible substance with real interior logic vs. scattered dots; the weakest of the six on distinctiveness (gooey blobs have UI-kit presence) — rank it last unless combined with B's dither finish.

---

## 5. Reduced-motion & pause patterns in the wild

**The normative baseline.** SC 2.2.2: auto-starting motion lasting >5 s presented in parallel with other content requires a mechanism to pause, stop, or hide it ([W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)). The mechanism must not trap focus (hover-to-pause alone fails). Whether `prefers-reduced-motion` alone can be that "mechanism" is an **open dispute in the WCAG working group itself** ([w3c/wcag#4319](https://github.com/w3c/wcag/issues/4319), [w3c/wcag#3766](https://github.com/w3c/wcag/issues/3766)) — the "platform-level mechanism" argument exists but has no settled consensus. This project's stance (real on-page control regardless) is the defensible conservative reading, and matches practitioner guidance: designers should include visible pause buttons so the control is discoverable ([designsystemproblems.com](https://designsystemproblems.com/accessibility-compliance/animation-pause-controls/), [BOIA](https://www.boia.org/blog/does-wcag-pause-stop-hide-apply-to-simple-animations)).

**Real control patterns:**
- **Header/global motion toggle:** the Animal Crossing: New Horizons site ships a motion on/off toggle in its header; Netlify's "1 Million Devs" site shipped a custom animation toggle — both cited as model implementations by CSS-Tricks ([css-tricks.com](https://css-tricks.com/accessible-web-animation-the-wcag-on-animation-explained/)).
- **Per-figure play/stop buttons:** the "Dark Side of the Grid" article gives every animated figure its own play/stop control styled to the design ([via CSS-Tricks](https://css-tricks.com/accessible-web-animation-the-wcag-on-animation-explained/)).
- **Background-media pause in a design system:** Western Washington University's pattern library bakes a pause button into its banner background-video component ([marcom.wwu.edu](https://marcom.wwu.edu/accessibility/guide/pause-stop-hide-animation)).
- **Toggle mechanics:** `<button aria-pressed>` toggling a root class + persisting to `localStorage`, *initialized from* `matchMedia('(prefers-reduced-motion: reduce)')` so OS preference is the default and the toggle can override in both directions ([Pope Tech](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/), [web.dev motion](https://web.dev/learn/accessibility/motion), [a11y with Lindsey](https://www.a11ywithlindsey.com/blog/reducing-motion-improve-accessibility/)). Craft CMS's writeup covers defaulting such toggles sensibly ([craftcms.com](https://craftcms.com/blog/designing-for-reduced-motion)).
- **Substitute, don't delete:** where motion carries meaning, reduced-motion should swap in an equivalent (fade instead of movement, static frame instead of nothing) — explicit in [Pope Tech](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) and the 2.3.3 guidance ([W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

**Recommended control for this hero** (fits the brand): a small **hourglass/alembic icon button** in the hero's corner — `aria-pressed`, labeled "Pause background" / "Resume background," ≥24×24 px target, visible on a scrim chip so it meets contrast on the animated field. It gates the rAF loop; state persists in `localStorage`; initial state = `prefers-reduced-motion` query. Also stop on `visibilitychange` and when the hero exits the viewport (IntersectionObserver) — the Stripe off-screen-disable pattern ([bram.us](https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect/)).

```js
const q = matchMedia('(prefers-reduced-motion: reduce)');
let running = !q.matches && localStorage.getItem('hero-motion') !== 'off';
function frame(t){ if (!running || document.hidden) return; step(t); requestAnimationFrame(frame); }
btn.addEventListener('click', () => {
  running = !running; btn.setAttribute('aria-pressed', String(!running));
  localStorage.setItem('hero-motion', running ? 'on' : 'off');
  if (running) requestAnimationFrame(frame); else renderPremiumStill();
});
q.addEventListener('change', e => { if (e.matches) { running = false; renderPremiumStill(); } });
```

**No-JS fallback:** the canvas sits inside a hero whose CSS background is a pre-rendered AVIF/WebP still of the *same scene at the same seed* (plus a pure-CSS layered-gradient approximation beneath it for the no-image case). With deterministic seeding this also keeps the site's baseline-determinism invariant intact.

**Text legibility:** keep peak gold luminance out of the headline zone (mask the field's brightness with a rounded-rect falloff behind the text block, or a #211C30 scrim at 60–75 %); verify 4.5:1 for body/subtitle per [WCAG 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) against the *brightest attainable* background pixel, not the average.

---

## 6. Constraint compliance matrix (all six concepts)

| Constraint | A Solve/Coagula | B Prima Materia | C Reaction-Diffusion | D Chladni | E Runic Ashfall | F Quicksilver |
|---|---|---|---|---|---|---|
| First-party only | Canvas2D ✓ | raw WebGL ✓ | raw WebGL (needs half-float FBO) ✓ | Canvas2D ✓ | either ✓ | raw WebGL ✓ |
| 2.2.2 story | episodic ≤5 s or pause ✓✓ | pause + freeze-t ✓ | episodic by construction ✓✓✓ | episodic ✓✓✓ | pause ✓ | pause ✓ |
| Reduced-motion substitute | static long-exposure figure | frozen seed frame | pre-converged pattern | settled figure | static rune field | merged still |
| No-JS still | pre-rendered figure | pixel-identical AVIF | pre-rendered pattern | pre-rendered figure | pre-rendered inscription | pre-rendered pool |
| Perf bound | O(N particles) | fixed/pixel, <1 ms-class | fixed steps, converges & stops | O(N particles) | O(cells) | fixed/pixel |
| Vestibular risk | low (local swirl) | lowest (color-only) | lowest (growth) | low (settle) | lowest (cell twinkle) | low (slow drift) |
| Cliché distance | max | high | max | max | high | medium |

---

## 7. Do-not-do list

- **No proximity-line linking, in any reskin.** Gold lines instead of white lines is still particles.js.
- **No warp/zoom/parallax starfield rehab** — high vestibular risk + the exact aesthetic being escaped.
- **No Stripe-style gradient mesh as the main idea** — it is another brand's signature and a UI-kit commodity.
- **No full Navier-Stokes fluid as the whole hero** — heaviest option, battery-hostile on mobile, and the Dobryakov demo is its own cliché tier now; if ink is wanted, curl-advected dye gives 80 % for 20 % of the cost.
- **No relying on `prefers-reduced-motion` alone for 2.2.2** — unsettled even inside the WCAG WG ([#4319](https://github.com/w3c/wcag/issues/4319)); ship the control.
- **No animated grain/flicker under reduced motion; no >5 s post-input decay** (2.2.2 re-binds once motion outlives the interaction).
- **No fake text reaching the accessibility tree** (Concept E: `aria-hidden`, `pointer-events:none`).
- **No gold veining/dither sparkle directly under the headline** — scrim or luminance-mask the text zone; AA against brightest pixel.
- **No unbounded particle counts / DPR-naive buffers** — cap by viewport × DPR, halve on low-core devices, stop when hidden/off-screen.

---

## 8. Source index

**Cliché/homogenization:** [particles.js](https://particles.js.org/) · [cssscript on particles.js ubiquity](https://www.cssscript.com/canvas-particle-animation/) · [speckyboy particle round-up](https://speckyboy.com/particle-animation-code-snippets/) · [Wheels Up Collective "Beige Internet"](https://www.wheelsupcollective.com/post/we-dont-want-a-beige-internet) · [Design Shack background trends 2025](https://designshack.net/articles/trends/background-design-trends/) · [Grainient packs](https://grainient.supply/collections/hero-gradients) · [Aceternity gradient hero block](https://ui.aceternity.com/blocks/hero-sections/modern-hero-with-gradients)
**Algorithms:** [IQ domain warping](https://iquilezles.org/articles/warp/) · [IQ voronoi edges](https://iquilezles.org/articles/voronoilines/) · [IQ cellular ffx](https://iquilezles.org/articles/cellularffx/) · [Book of Shaders ch.12](https://thebookofshaders.com/12/) · [Emil Dziewanowski curl noise](https://emildziewanowski.com/curl-noise/) · [Chris Arasin curl dots (Canvas2D)](https://chrisarasin.com/curl-noise-dots/) · [Sighack Perlin fields](https://sighack.com/post/getting-creative-with-perlin-noise-fields/) · [varun.ca noise](https://varun.ca/noise/) · [clicktorelease flow-field lines](https://www.clicktorelease.com/code/generative-lines-flow-fields/) · [Jamie Wong metaballs](https://jamie-wong.com/2016/07/06/metaballs-and-webgl/) · [Codrops 2D metaballs WebGL2](https://tympanus.net/codrops/2021/01/19/drawing-2d-metaballs-with-webgl2/) · [pmneila Gray-Scott](https://pmneila.github.io/jsexp/grayscott/) · [piellardj reaction-diffusion](https://piellardj.github.io/reaction-diffusion-webgl/) · [xmorphia parameter atlas](https://www.mrob.com/pub/comp/xmorphia/index.html) · [CymaVis cymatics](https://cymavis.com/) · [Shadertoy Chladni](https://www.shadertoy.com/view/3tsSDr) · [Shadertoy Auroras](https://www.shadertoy.com/view/XtGGRt) · [Shadertoy domain-warped fBm](https://www.shadertoy.com/view/wttXz8)
**Technique guides:** [Codrops Bayer dithering backgrounds](https://tympanus.net/codrops/2025/07/30/interactive-webgl-backgrounds-a-quick-guide-to-bayer-dithering/) · [Maxime Heckel dithering/retro shading](https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/) · [Codrops real-time dithering shader](https://tympanus.net/codrops/2025/06/04/building-a-real-time-dithering-shader/) · [Codrops Efecto ASCII/dither/CRT](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/) · [Codrops ASCII shader OGL](https://tympanus.net/codrops/2024/11/13/creating-an-ascii-shader-using-ogl/) · [Codrops mouse flowmap deformation](https://tympanus.net/codrops/2019/09/25/mouse-flowmap-deformation-with-ogl/) · [Codrops interactive hover effects](https://tympanus.net/codrops/2020/04/14/interactive-webgl-hover-effects/) · [mattdesl glsl-film-grain](https://github.com/mattdesl/glsl-film-grain) · [maximmcnair film grain](https://maximmcnair.com/p/webgl-film-grain) · [fxhash grain article](https://www.fxhash.xyz/article/all-about-that-grain) · [bram.us Stripe gradient how-to](https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect/) · [minigl gist](https://gist.github.com/jordienr/64bcf75f8b08641f205bd6a1a0d4ce1d) · [PavelDoGreat fluid sim](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) · [Larkworthy ink](https://observablehq.com/@tomlarkworthy/ink) · [john-smith.me parallax starfield](https://www.john-smith.me/parallax-starfield-and-texture-mask-effect-in-webgl.html) · [rocket-boots webgl-starfield](https://github.com/rocket-boots/webgl-starfield)
**Award-scene case studies:** [Igloo Inc SOTD/SOTY](https://www.awwwards.com/sites/igloo-inc) · [Igloo Inc case study](https://www.awwwards.com/igloo-inc-case-study.html) · [Igloo crystal-growth writeup](https://www.webgpu.com/showcase/igloo-inc-procedural-crystals/) · [UntilLabs living particles (Codrops)](https://tympanus.net/codrops/2025/12/10/simulating-life-in-the-browser-creating-a-living-particle-system-for-the-untillabs-website/) · [Awwwards shaders editorial](https://www.awwwards.com/the-rise-of-shaders-filters-and-effects-in-web-projects.html) · [Awwwards WebGL gallery](https://www.awwwards.com/websites/webgl/) · [godly.website](https://godly.website/) · [land-book.com](https://land-book.com/)
**Accessibility:** [W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html) · [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) · [W3C Understanding 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) · [w3c/wcag#4319](https://github.com/w3c/wcag/issues/4319) · [w3c/wcag#3766](https://github.com/w3c/wcag/issues/3766) · [CSS-Tricks WCAG animation explained](https://css-tricks.com/accessible-web-animation-the-wcag-on-animation-explained/) · [Pope Tech accessible animation](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) · [web.dev motion](https://web.dev/learn/accessibility/motion) · [Smashing reduced-motion design](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/) · [WWU pause pattern](https://marcom.wwu.edu/accessibility/guide/pause-stop-hide-animation) · [Craft CMS reduced motion](https://craftcms.com/blog/designing-for-reduced-motion) · [a11y with Lindsey](https://www.a11ywithlindsey.com/blog/reducing-motion-improve-accessibility/) · [Design System Problems pause controls](https://designsystemproblems.com/accessibility-compliance/animation-pause-controls/)
