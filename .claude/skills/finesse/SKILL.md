---
name: finesse
description: Design-engineering craft for making interfaces feel polished, fast, and physical. Use when building or reviewing UI components, implementing animations or transitions, tuning motion/easing/duration, adding hover/active/focus states, loading/empty/error states, micro-interactions, shadows, borders, radius, typography, or spacing. Triggers on UI polish and "feel" work: "make it feel better", "feels off", "feels janky", "make it pop", "too fast"/"too slow", animation timing, stagger, spring, interruptible animation, prefers-reduced-motion, focus ring, optical alignment, tabular numbers, skeleton/loading state, optimistic UI, drag/swipe/sheet gestures and momentum, translucent/glass materials, or auditing and planning motion fixes across a whole codebase.
---

# Finesse

Design-engineering craft for interfaces that feel polished, fast, and physical.

Great interfaces are rarely one big thing. They are an accumulation of small, individually invisible details that compound: *felt, not seen*. This skill encodes those details as concrete, committed defaults so the work is consistent instead of vibes. The numbers here are opinionated starting points; commit to them, then trust your eyes: a value is right when it *feels* right.

## How to use this skill

- **When building UI**, apply these principles by default: you don't need to be asked. Reach for the motion tokens below instead of inventing one-off durations.
- **When reviewing or "making something feel better"**, default to flagging: approval is earned. Run the [escalation triggers](#escalation-triggers-flag-on-sight), return the [review output contract](#review-output-contract) (every change, grouped, before/after, never a subset), close with a [verdict](#the-verdict), and confirm feel with the [feel check](#feel-check).
- **When auditing a whole codebase** (not a single diff), use [audit mode](#audit-mode-survey-and-plan): survey the surface, rank findings by leverage, and write self-contained [plans](PLAN-TEMPLATE.md) a cheaper model can execute without touching your source.
- **Load a reference file** (linked throughout) when you need the long-form rationale, the good-vs-bad code, or the decision tables. `SKILL.md` alone has every number you need to *act*.
- **Framework-agnostic first.** Examples lead with vanilla CSS / the Web Animations API. Tailwind and Motion (`motion`/`framer-motion`) variants follow. Don't add an animation dependency that isn't already in `package.json`: check first.

## The first rule: motion serves a purpose

If you can't name what an animation communicates (causality, status, spatial continuity, or deliberate delight), cut it. **The best animation is often no animation.**

- **Never animate high-frequency or keyboard-initiated actions.** Opening a menu you open 100×/day, deleting a list item, tabbing through fields: these must feel instant. Animation there is a tax, not a delight.
- **Motion's jobs:** show cause and effect, give feedback, preserve the user's spatial map (where did this come from, where did it go), and, sparingly, add character.

## Motion tokens (the shared contract)

Every animation in the product should pull from one small scale. Inconsistent, hand-picked durations are the single biggest tell of an amateur interface. Define these once at `:root` and reference them everywhere.

```css
:root {
  /* Duration: most UI lives in 150–300ms. Scale UP with travel distance / surface size. */
  --duration-instant: 0ms;     /* keyboard + high-frequency actions: no animation */
  --duration-fast:    150ms;   /* micro: hover, press, color, icon tint/recolor */
  --duration-base:    200ms;   /* standard: toggles, small reveals, tabs */
  --duration-slow:    300ms;   /* modals, drawers, popovers, larger surfaces */
  --duration-slower:  450ms;   /* full-screen / large-travel transitions */

  /* Easing: chosen by DIRECTION of travel. Custom curves beat the weak built-in keywords. */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);      /* small in-place state changes (default) */
  --ease-out:      cubic-bezier(0.05, 0.7, 0.1, 1); /* ENTERING / decelerating: settles into place */
  --ease-in:       cubic-bezier(0.3, 0, 0.8, 0.15); /* EXITING / accelerating: leaves decisively */
  --ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);    /* moving ACROSS screen / morphing in place */
  --ease-ios:      cubic-bezier(0.32, 0.72, 0, 1);  /* drawers / sheets / sliding panels */
  /* linear is ONLY for continuous loops: spinners, marquees, progress. Never for discrete UI. */
}
```

**Three rules that make the tokens work:**

1. **Exit faster than enter**: roughly one tier down (a 300ms enter → ~200ms exit). Things should leave more quickly and quietly than they arrive.
2. **Duration scales with distance and size.** A tooltip is `--duration-fast`; a full-screen route transition is `--duration-slower`. Same easing family, longer time.
3. **Direction picks the easing.** Entering → `--ease-out`. Leaving → `--ease-in`. Repositioning something already on screen → `--ease-in-out`.

**Springs** (for gesture-driven or physical motion). Specify *response* and *bounce*, not a fixed duration: "nothing in the real world changes instantly." Keep bounce low for functional UI.
- Functional (icon swap, toggle): `{ type: "spring", duration: 0.3, bounce: 0 }`
- Physical (sheets, playful): `{ type: "spring", duration: 0.5, bounce: 0.2 }`
- Avoid springs where precision matters more than feel.

**Distances:** enter from `translateY(8–12px)`, never from far away. **Never animate from `scale(0)`**: it looks like it teleports in; start from ~`0.9`. Press feedback is `scale(0.96)`: never below `0.95` (feels exaggerated).

→ Full motion guidance, enter/exit recipes, interruptibility, origin-awareness, and modern primitives: **[motion.md](motion.md)**

## Core principles

**Motion** → [motion.md](motion.md)
1. Purpose over decoration; don't animate high-frequency/keyboard actions.
2. Animate **only `transform`, `opacity`, `filter`**: never layout properties. Never `transition: all`.
3. Use the **token scale**; exit faster than enter; duration scales with size.
4. **Easing by direction:** `--ease-out` enter, `--ease-in` exit, `--ease-in-out` on-screen movement.
5. **Make animations interruptible**: CSS *transitions* (not keyframes) for stateful UI; they retarget mid-flight. Keyframes only for one-shot staged sequences.
6. **Origin-aware:** set `transform-origin` so things grow from their trigger (a dropdown opens from its button).
7. Press feedback `scale(0.96)`; stagger groups ~`100ms`, words ~`80ms`.

**Gestures** → [gestures.md](gestures.md)
- Drag, swipe, sheets, drag-to-reorder: track the finger **1:1**, hand off the release velocity into the settle spring, stay interruptible (animate from the live value), and **rubber-band** at edges instead of hard-stopping.

**States & feedback** → [interaction-states.md](interaction-states.md)
8. Every interactive element needs **hover, active, and `:focus-visible`**: but gate hover behind `@media (hover: hover)` so it doesn't stick on touch.
9. **Feedback is immediate and trigger-local:** an inline checkmark on "copied," not a toast across the screen. Toggles take effect instantly; disable submit buttons after submit.
10. **Design the unhappy paths:** loading (skeletons, with a ~150–300ms show-delay and ~300–500ms minimum visible time to avoid flicker), empty, error, disabled.
11. **Optimistic UI:** render the result immediately, reconcile/roll back on the server response. Responsiveness must never depend on network latency.

**Surfaces & depth** → [surfaces.md](surfaces.md)
12. **Concentric radius:** `outer = inner + padding`. Mismatched nested radii are the most common "off" tell.
13. **Shadows for elevation, not dividers.** Light comes from above; layer shadows and tint them with the surface hue: never pure black. Use real borders for dividers, table cells, and input outlines.
14. **Optical > mathematical alignment:** icon-side button padding is ~2px less than the text side; nudge play triangles ~2px right; fix asymmetric glyphs in the SVG.
15. **Hit area ≥ 44×44px** (≥40 acceptable); extend small controls with a pseudo-element. Never overlap two hit areas.
- **Translucent materials** (glass chrome via `backdrop-filter`): material weight encodes hierarchy, never stack two light glass layers, and solidify under `prefers-reduced-transparency`.

**Typography** → [typography.md](typography.md)
16. **Hierarchy via weight and color, not size alone.** Three text colors (primary/secondary/tertiary); never pure black. Body & inputs **≥16px** (inputs <16px trigger iOS zoom).
17. **`tabular-nums`** for any number that changes in place (timers, prices, counters) to stop layout shift. **`text-wrap: balance`** on headings, **`pretty`** on body. Antialias once at the root. Never change font-weight on hover (layout shift).

**Layout & color** → [layout-and-color.md](layout-and-color.md)
18. **Spacing signals grouping:** more space between groups, less within. Use a constrained scale on a 4/8px base. Align everything to something. No dead zones between list items: extend padding, not gaps.
19. **Near-black/near-white, saturated neutrals, functional color scales.** Prefer fewer borders (use spacing, background, shadow). Color carries meaning (red danger, green success) but never *alone*.

**Performance** → [performance.md](performance.md)
20. **`transform`/`opacity`/`filter` run on the GPU compositor; everything else costs layout/paint and drops frames.** Target 60fps. `will-change` only just-in-time and sparingly. Tool ladder: CSS → Web Animations API → JS library.

**Accessibility (never optional)** → [accessibility.md](accessibility.md)
21. **Respect `prefers-reduced-motion` for every animation.** Reduced motion ≠ no motion: *substitute* a fade or instant change, don't just delete meaning. Opt motion in via `(prefers-reduced-motion: no-preference)`. Never convey information by motion or color alone. Focus rings via `box-shadow` (respects radius). Semantics before ARIA; `aria-label` on icon-only controls.

## Modern primitives worth reaching for

Before hand-rolling, check whether a platform primitive does it better (degrade gracefully):
- **View Transitions API** (`document.startViewTransition`, `view-transition-name`): shared-element and route transitions, the cases people used to fake with FLIP.
- **`@starting-style` + `transition-behavior: allow-discrete`**: CSS-native enter animations for popovers/dialogs/`display:none`, no JS.
- **Scroll-driven animations** (`animation-timeline: scroll()/view()`): scroll progress without scroll listeners.
- **`interpolate-size: allow-keywords`**: animate to/from `height: auto`.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| `transition: all` | Name the exact properties: `transition: transform 150ms, opacity 150ms` |
| Animating `width`/`height`/`top`/`margin` | Animate `transform`/`opacity`; use FLIP or View Transitions for layout changes |
| Same duration for enter and exit | Exit ~one tier faster than enter |
| `linear` easing on UI | `--ease-out` to enter, `--ease-in` to exit |
| Keyframes for hover/toggle/open | CSS transitions: they interrupt and retarget mid-flight |
| Animating from `scale(0)` / `opacity` only | Start from ~`scale(0.9)` + small `translateY`; combine transform + opacity |
| No `prefers-reduced-motion` | Wrap motion; substitute a fade or instant change |
| Removing the focus outline for looks | Replace with a `:focus-visible` `box-shadow` ring |
| Hover state stuck on mobile | Gate with `@media (hover: hover)` |
| Numbers jumping width as they change | `font-variant-numeric: tabular-nums` |
| Mismatched nested corner radii | `outer = inner + padding` |
| Spinner during a 120ms fetch | Optimistic update; or show-delay the loader 150–300ms |
| Fixed desktop-only grid that shatters at other widths | Fluid by default (`auto-fit`/`minmax` + a breakpoint floor): design for the stated context, degrade gracefully outside it |
| Colored left/top accent bar on a card or alert | Tinted background + semantic glyph + words carry severity; the stripe is a generated-UI tell (only the active-tab underline earns an accent edge) |
| Cards in one row with ragged heights | Rows share a height: keep `align-items: stretch` and flex the card body |
| Em dashes in UI copy ("Signups: Apr") | Middot in labels ("Signups · Apr"), colon for key-value pairs; no em dashes anywhere in the interface |
| Marketing-slop microcopy ("Unleash your workflow", "Oops!", emoji in headings) | Buttons name the action ("Save changes"); errors state cause + recovery; one word per referent; no emoji or exclamation standing in for a voice |
| Chart story only reachable via hover, or no hover at all | Story lands with zero interaction (direct labels, threshold bands, annotations); points still reward hover with a tooltip, gated |

## Review output contract

When reviewing code or "making it feel better," return findings as **before/after tables grouped by area** (Motion, States, Surfaces, Typography, Layout/Color, Performance, Accessibility). For each change: the file/element, the before, the after, and one line of why. **Report every change you'd make, not a subset: omit only the empty groups.** Lead with a one-line summary of the highest-impact fix.

## Review checklist

- [ ] Motion pulls from the token scale; no one-off durations
- [ ] Only `transform`/`opacity`/`filter` animated; no `transition: all`
- [ ] Enter uses `--ease-out`, exit uses `--ease-in` and is faster
- [ ] Stateful animations are interruptible (transitions, not keyframes)
- [ ] `transform-origin` set so motion grows from its source
- [ ] Press feedback (`scale(0.96)`), gated hover, visible `:focus-visible` ring
- [ ] Loading/empty/error/disabled states exist; loaders are flicker-guarded
- [ ] Optimistic updates where an action would otherwise wait on the network
- [ ] Concentric radii; shadows for elevation (tinted, layered), borders for dividers
- [ ] Optical alignment on icons/buttons; hit areas ≥ 40–44px
- [ ] Hierarchy via weight + color; `tabular-nums`; body/inputs ≥16px; balanced headings
- [ ] Spacing groups related items; everything aligned; constrained scale
- [ ] `prefers-reduced-motion` honored with substitutions, not deletions
- [ ] Information never conveyed by motion or color alone
- [ ] UI copy reads human: buttons name the action, errors state cause + recovery, labels are consistent, no marketing puffery or emoji headings

## Escalation triggers (flag on sight)

The high-severity tells. Any one of these is a finding, not a maybe:

- `transition: all`, or animating a layout property (`width`/`height`/`top`/`left`/`margin`/`padding`).
- `ease-in` or a weak built-in easing on anything entering or on a general state change; `linear` on discrete UI.
- Any animation on a keyboard-initiated or 100+/day action.
- A UI transition over ~300ms with no stated reason, or the same duration for enter and exit.
- `scale(0)`, or an opacity-only entrance with no `translate`.
- `transform-origin: center` or unset on a trigger-anchored popover/dropdown/tooltip (modals stay centered, that is exempt).
- Keyframes on toasts, toggles, or anything triggered rapidly or reversibly.
- Framer Motion `x`/`y`/`scale` shorthands on motion that runs while the page is busy; a CSS variable on a parent driving child transforms.
- Missing `prefers-reduced-motion`; ungated `:hover` motion; a focus outline removed with no replacement.
- A colored accent stripe on a card or alert; an em dash in UI copy.

## Remedial hierarchy (prefer earlier moves)

When you propose a fix, prefer the earliest move that solves it:

1. **Delete** the animation (high-frequency, no purpose, keyboard-triggered).
2. **Reduce** it (shorter, smaller travel, fewer animated properties).
3. **Fix the easing** (`ease-in` → `--ease-out`/custom curve; weak keyword → an authored curve).
4. **Fix origin and physicality** (`transform-origin`; `scale(0)` → `scale(0.9)` + opacity).
5. **Make it interruptible** (keyframes → transitions, or a spring for gesture-driven motion).
6. **Move it to the GPU** (layout props → `transform`/`opacity`; shorthand → full transform string).
7. **Asymmetric timing** (slow the deliberate phase, snap the system response).
8. **Polish** (blur to mask a crossfade, stagger a group, `@starting-style` for entry).
9. **Accessibility and cohesion** (reduced-motion + hover gating; match the product's personality).

## The verdict

Close every review with an explicit decision:

- **Block** if there is any feel-breaking regression: `ease-in`/sluggish easing on UI, `scale(0)`, animation on a keyboard or high-frequency action, a non-GPU animation with an easy GPU fix, or a removed focus ring.
- **Approve** only when none of those are present, durations and easing are in bounds, stateful motion is interruptible, and reduced-motion is honored. Approval is earned, not the default. "The motion here is already right" is a valid result.

## Feel check

Motion can be mechanically correct and still feel wrong; verify feel, not just code, before calling it done:

- **Slow-mo.** Play it at ~10% (DevTools Animations panel) and watch for coordinated properties drifting out of sync, an easing that stalls, or a wrong `transform-origin`.
- **Frame-by-frame.** Step through a crossfade or icon swap; two states double-exposed means it needs blur or a tuned curve.
- **Real device for gestures.** Test drags, swipes, and sheets on actual touch hardware ([gestures.md](gestures.md)), not just a desktop pointer.
- **Fresh eyes.** Review the motion the next day. Imperfections invisible while building surface later.

## Audit mode: survey and plan

For a whole codebase rather than a single diff, run finesse as an audit: spend the capable model's judgement on understanding the motion and deciding what is worth fixing, and hand execution to any agent, including cheaper models. It plans; it does not patch.

1. **Recon.** Map the surface first: framework, motion libraries (Motion, GSAP, plain CSS, WAAPI), component libraries (Radix, Base UI, shadcn/ui), where motion and tokens live, the product's personality, and a **frequency map** (what is hit 100+/day vs occasionally vs rarely). Frequency drives severity.
2. **Audit in parallel** against finesse's areas: Motion, Gestures, States, Surfaces, Typography, Layout & color, Performance, Accessibility. For anything past a small repo, fan out read-only subagents, one per area (or per app region), each returning findings only (`file:line` + evidence, no fixes).
3. **Vet and rank.** Re-read the cited code for every finding yourself; reject anything by-design or exempt (`transform-origin: center` on a modal is correct). Present the survivors as one table ordered by **leverage** (impact over effort), with a severity per row.
4. **Plan, do not patch.** Never edit source in this mode. For each selected finding write a self-contained plan into `plans/NNN-*.md` using [PLAN-TEMPLATE.md](PLAN-TEMPLATE.md), stamped with the commit, with a repo-conventions section and a mandatory [feel check](#feel-check). Then write `plans/README.md`: order, dependencies, status. Any agent can execute a plan afterward with zero context.

Severity: **HIGH** = feel-breaking (wrong easing on UI, animation on keyboard/high-frequency actions, dropped frames, `scale(0)`); **MEDIUM** = noticeably off (wrong origin, non-interruptible dynamic UI, missing reduced-motion); **LOW** = polish (stagger, blur-masked crossfades, token consolidation).

## Model notes

Newer models need fewer rules, not more. Treat this skill as a **calibration layer**: the tokens and thresholds are committed *defaults*, not shackles: when a product's design language genuinely demands different values, change the tokens once at `:root` and say so, rather than scattering one-off exceptions.

- **Claude Opus 4.8** has strong design instincts with one persistent house default: warm cream/off-white backgrounds (~`#F4F1EA`), serif display type (Georgia, Fraunces, Playfair), italic word-accents, and a terracotta/amber accent. That reads beautifully for editorial, hospitality, and portfolio briefs, and feels wrong for dashboards, dev tools, fintech, healthcare, and enterprise UI. Generic nudges ("don't use cream," "make it clean") just swap in a *different* fixed palette. Two fixes that work: **(1)** specify a concrete alternative direction: palette hexes, type family, radius, motion spec; **(2)** propose 3–4 distinct visual directions first (bg hex / accent hex / typeface + one-line rationale), let the user pick, and build only that one.
- **Anti-slop guard (any model):** avoid the generic-AI tells: Inter/Roboto/Arial/system fonts as display type, purple gradients on white or dark, timid evenly-distributed palettes, cookie-cutter hero layouts. Commit to a cohesive, context-specific direction; dominant colors with sharp accents beat evenly-spread ones.
- **Claude Fable 5** follows brief instructions reliably and can over-comply with prescriptive checklists: over-prescription degrades its output. Apply this skill's *judgment*, not just its letter: name what each animation communicates, pull from one token scale, honor reduced motion. If a recipe fights the product's design language, adapt it deliberately and note the deviation.

## Reference files

| File | Read it for |
| --- | --- |
| [motion.md](motion.md) | Duration/easing/spring tokens in depth, enter/exit recipes, interruptibility, origin, stagger, clip-path reveals, 3D transforms, cohesion, when-NOT-to-animate, modern primitives |
| [gestures.md](gestures.md) | Drag/swipe/sheets: 1:1 tracking, velocity handoff, momentum projection, rubber-banding, interruptibility, multi-touch, reduced-motion |
| [interaction-states.md](interaction-states.md) | Hover/active/focus-visible/disabled, loading & skeletons, empty/error states, optimistic UI, menus, tooltips, multimodal feedback |
| [surfaces.md](surfaces.md) | Concentric radius, shadows vs borders & elevation, translucent/glass materials, image outlines, optical alignment, hit areas |
| [typography.md](typography.md) | Text wrapping, smoothing, tabular numbers, hierarchy, measure, line-height, fluid sizing, punctuation and microcopy (UI voice) |
| [layout-and-color.md](layout-and-color.md) | Spacing scale & grouping, alignment, near-black/white, functional color scales, depth/shadow theory |
| [performance.md](performance.md) | Compositor-only animation, `will-change`, FLIP, the tool ladder, perceived speed, 60fps/RAIL |
| [accessibility.md](accessibility.md) | `prefers-reduced-motion` policy, forced-colors, reduced-transparency/contrast, contrast ratios, focus, semantics/ARIA, vestibular safety |
| [vocabulary.md](vocabulary.md) | Reverse glossary: turn a described effect ("the springy popover thing") into the precise term to ask for |
| [PLAN-TEMPLATE.md](PLAN-TEMPLATE.md) | The self-contained plan format [audit mode](#audit-mode-survey-and-plan) writes for a cheaper model to execute |