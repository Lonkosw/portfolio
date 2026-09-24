# Plan template

Every plan written by finesse [audit mode](SKILL.md#audit-mode-survey-and-plan) follows this shape. The executor may be a cheaper model, or a future session, with zero context from the audit and no taste of its own. The plan must therefore contain *everything*, exactly: no "use the easing we discussed", no "match the other cards", no value left to judgement. Inline the exact token, the exact curve, the exact file path and current code.

```markdown
# NNN: <short imperative title>

- **Status**: TODO
- **Commit**: <output of `git rev-parse --short HEAD` when this plan was written>
- **Severity**: HIGH | MEDIUM | LOW
- **Area**: Motion | States | Surfaces | Typography | Layout & color | Performance | Accessibility | Gestures
- **Scope**: <n files, rough size>

## Problem

What is wrong, where, and why it matters to how the product *feels*. Cite every
location as `path/to/file.tsx:123` and paste the current code verbatim so the
executor never has to guess what it is replacing:

​```css
/* src/components/dropdown.css:14 (current) */
.dropdown { transition: all 400ms ease-in; transform-origin: center; }
​```

## Target

The exact end state, every value spelled out (tokens, curves, durations, radii,
spring configs, media queries). Never "use a nicer easing" or "tighten it up":

​```css
/* target */
.dropdown {
  transition: transform var(--duration-base) var(--ease-out),
              opacity   var(--duration-base) var(--ease-out);
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
}
​```

## Conventions to follow

How this codebase already does it, with one exemplar the executor should copy
(token names, file placement, prop patterns). Extend the repo's system, never
invent a parallel one:

- Motion tokens live in `src/styles/tokens.css`; add curves there, do not inline cubic-beziers at the call site.
- <one existing file:line that already does this correctly, to imitate>

## Steps

1. <one concrete edit per step: the file, what changes, the resulting code.>
2. …

## Boundaries

- Do NOT touch <files / components out of scope>.
- Do NOT change markup or structure unless a step explicitly says so; this is a <motion / surface / type> pass.
- Do NOT add a dependency (no new animation library); use what is in `package.json`.
- Never remove the focus outline, never introduce a colored accent stripe, never emit an em dash in UI copy.
- If a step does not match the code you find (the repo drifted since the commit stamp), STOP and report rather than improvising.

## Verification

- **Mechanical**: <exact commands: typecheck, lint, build, with the expected outcome>.
- **Feel check** (not optional, motion can be mechanically correct and still feel wrong): run the UI, trigger <the interaction>, and confirm:
  - <observable, e.g. "the dropdown scales from its trigger corner, not from center">
  - <e.g. "spamming the toggle never restarts the animation from zero">
  - In DevTools, slow playback to 10% (Animations panel) and confirm <the coordinated properties stay in sync, the origin is right>.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm the travel is dropped but the opacity feedback remains.
  - For gestures, test on a real touch device, not just the simulator.
- **Done when**: <machine- or eye-checkable completion criteria>.
```

## Notes for the plan author

- **One plan per finding.** Two findings that share every file and the exact same fix pattern (one easing-token swap across five components) may merge into one plan; otherwise keep them separate so they can be selected and executed independently.
- **Pull every value from the [reference files](SKILL.md#reference-files)**, never approximate from memory. A plan that says "around 200ms" has already failed the executor.
- **The feel check is the point of the whole format.** A diff that typechecks tells you nothing about whether the motion lands; give the executor (and the human reviewing the executor's diff) concrete things to watch for in slow motion. See the [feel check](SKILL.md#feel-check) in SKILL.md.
- After writing plans, create or update `plans/README.md`: a table of plans (number, title, severity, status), the recommended execution order, and any dependencies between them.
