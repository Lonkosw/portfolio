# Gestures & drag

State-driven motion goes from A to B on a discrete trigger (a menu opens, a toast enters). Gesture-driven motion is a different regime: it is *continuous*, it tracks the finger the whole way, it inherits the user's velocity, and it can be grabbed and reversed at any instant. Getting it right is what separates a drawer that feels physical from one that feels like a slideshow.

The through-line: **an interface feels alive when motion starts from the current on-screen value, inherits the user's velocity, projects momentum forward, and can be caught and redirected mid-flight.** Springs are the tool that makes all of this natural, because they are interruptible and velocity-aware by construction. Duration-and-easing tokens ([motion.md](motion.md)) describe motion by *time*; a dragged sheet has no fixed timeline, it settles when its energy dissipates.

This file is the technique layer for anything the user physically manipulates: sheets, drawers, swipe-to-dismiss, drag-to-reorder, pull-to-refresh, sliders. The compositor reasoning (`transform`-only, off the main thread) lives in [performance.md](performance.md); the reduced-motion policy in [accessibility.md](accessibility.md).

---

## Respond on the input, not on the result

Latency is where "physical" dies. The moment feedback lags the finger, the illusion of direct manipulation "falls off a cliff."

- **Acknowledge on `pointerdown`, not on release.** Highlight the grabbed element the instant it is pressed. Waiting for `click` / touch-up to show feedback feels dead. (The press-vs-release *commit* rule still holds for destructive actions, see [interaction-states.md](interaction-states.md); this is about the visual acknowledgement, which is always immediate.)
- **Feedback is continuous *during* the gesture, not just at the end.** For a drag, a slider, or a drawer, update the UI 1:1 with the pointer the entire way through. Never animate only when the gesture completes.
- **Audit every artificial delay** on the input path: debounces, transition waits, the legacy ~300ms tap delay. Anything non-essential between the finger and the pixels is a regression.

---

## Track 1:1 and respect the grab offset

> Touch and content move together.

When the user drags something, it must stay glued to the finger, and it must respect the offset from *where they grabbed it*. Snapping the element's center to the cursor on grab breaks the illusion in the first frame.

- **Use Pointer Events with `setPointerCapture`** so tracking continues even when the pointer leaves the element's bounds (a fast drag outruns the box).
- **Keep a short position and velocity history** (the last few `pointermove` events with timestamps), not just the current point. You need the velocity *at release*, and one frame's delta is too noisy.
- **Animate `transform`, never `top`/`left`.** The drag runs every frame; it must stay on the compositor ([performance.md](performance.md)).

```js
let startY, grabOffset, history = [];

el.addEventListener('pointerdown', (e) => {
  el.setPointerCapture(e.pointerId);
  const rect = el.getBoundingClientRect();
  grabOffset = e.clientY - rect.top;          // respect where they grabbed, not the center
  startY = e.clientY;
  history = [{ y: e.clientY, t: e.timeStamp }];
});

el.addEventListener('pointermove', (e) => {
  const dy = e.clientY - startY;
  el.style.transform = `translateY(${dy}px)`; // 1:1, on the compositor
  history.push({ y: e.clientY, t: e.timeStamp });
  if (history.length > 5) history.shift();     // keep a short window for release velocity
});
```

---

## Interruptibility: the property that matters most

> The thought and the gesture happen in parallel.

A user must be able to grab a moving element mid-flight and send it somewhere new without waiting for the animation to finish. A closing sheet the user catches should follow the finger again, not finish closing and then reopen.

- **Never lock out input during a transition.** No "animating" flag that swallows pointer events.
- **Animate from the *presentation* value, not the target.** On interrupt, read the element's live on-screen transform and start the new motion from *there*. Starting from the logical/target value causes a visible jump.
- **Prefer springs over CSS transitions and `@keyframes` for gesture-driven motion.** Transitions retarget between two *values* but cannot smoothly absorb a live velocity; keyframes restart from zero. A spring animates from the current value *and* the current velocity by default, which is exactly what interruption needs. (For non-gesture state changes, transitions are still the right default, see [motion.md](motion.md).)
- **Blend velocity on reversal, do not hard-cut it.** Swapping one animation for another at a reversal creates a velocity discontinuity, a "brick wall." Use a spring library that carries velocity through a re-target.
- **Decompose 2D motion into independent X and Y springs.** A single spring driven by 2D distance desyncs the moment X and Y have different velocities (a diagonal flick). Spring each axis on its own.

---

## Velocity handoff: the seam between drag and animation

When the gesture ends, the settle animation must **continue at the finger's exact velocity**, so there is no visible seam between dragging and animating. This is the single detail that most separates "fluid" from merely "fine."

Pass the pointer's release velocity as the spring's initial velocity. Compute it from the history window, not the last frame:

```js
function releaseVelocity(history) {           // px per ms
  const a = history[0], b = history[history.length - 1];
  return (b.y - a.y) / Math.max(b.t - a.t, 1);
}
```

Some spring APIs want an *absolute* velocity (Motion / framer-motion take px/s directly via the `velocity` option); others want it *relative*, normalized by the remaining distance to the target:

```
relativeVelocity = gestureVelocity / (targetValue - currentValue)
```

Example: element at `y = 50`, target `y = 150` (100px to go), finger moving 50px/s, so the relative initial velocity is `50 / 100 = 0.5`. Hand the raw value to APIs that accept absolute px/s.

---

## Momentum projection: animate to where the gesture is going

> Take a small input and make a big output.

Do not snap to the nearest boundary from the *release point*. Use velocity to **project** the resting position (exactly like native scroll deceleration), then snap to the target nearest that projected point. This is what makes a flick feel like it *throws* the element, and it is how good bottom-sheets and carousels decide whether a short-but-fast flick advances.

Use the exponential-decay projection, **not** the physics-textbook `v² / (2·decel)`:

```js
// decelerationRate ~0.998 for a natural scroll feel; ~0.99 for snappier
function project(initialVelocity /* px/s */, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

const projected = currentPosition + project(releaseVelocityPxPerSec);
const target = nearestSnapPoint(projected);      // choose the snap target from the projection
animateSpringTo(target, { velocity: releaseVelocityPxPerSec });  // then hand off velocity
```

---

## Rubber-banding: soft boundaries, never a hard stop

At an edge (a drawer dragged past fully-open, a list overscrolled), resist *progressively* instead of stopping dead. A hard stop reads as "frozen / broken"; rising resistance reads as "responsive, but there is nothing more here." Real things slow before they stop.

```js
// The further past the boundary, the less the element follows.
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
// Apply to the portion of the drag that is past the bound; track 1:1 within bounds.
```

The same idea, stated as a rule: **friction over hard stops.** Allow the over-drag with increasing resistance rather than an invisible wall.

---

## Thresholds, dismissal, and multi-touch

- **Movement threshold (hysteresis).** Require a small movement (~10px) before committing to a drag direction, so a tap or a jittery finger does not start a drag. Track 1:1 only after the threshold is crossed.
- **Dismiss on velocity, not distance alone.** A quick flick should dismiss even if it is short. Compute `velocity = Math.abs(distance) / elapsedMs`; dismiss when `velocity > ~0.11` *or* the distance passes a threshold. Requiring a long drag makes a flick feel ignored.
- **Decide reverse-vs-commit by the velocity *sign* at release,** not by the position. A sheet dragged halfway down but released with upward velocity should snap back up.
- **Multi-touch protection.** Once a drag begins, ignore additional touch points. Without this, a second finger landing mid-drag jumps the element to the new position.

```js
function onPointerDown(e) {
  if (isDragging) return;   // ignore a second finger mid-drag
  isDragging = true;
  // ...begin tracking
}
```

---

## Reduced motion and reachability

- **Keep the gesture responsive; soften the settle.** Under `prefers-reduced-motion: reduce`, drop a bouncy spring to a plain opacity fade or an instant set. The overshoot is exactly the vestibular trigger reduced-motion users are protecting against, so **never** a high-bounce spring under reduce. The 1:1 tracking itself is fine; it is the elastic settle you replace. See [accessibility.md](accessibility.md).
- **A gesture is never the only path.** Swipe-to-dismiss needs a visible close control; drag-to-reorder needs a keyboard affordance. Touch, keyboard, and screen-reader users must all reach the action ([interaction-states.md](interaction-states.md)).
- **Honor the platform.** On the web, respect native scroll and pull-to-refresh rather than hijacking them; only capture the gestures you actually own.

---

## Framework reality

The **tracking** half (Pointer Events, `setPointerCapture`, a 1:1 `transform`, the velocity history) is plain platform code with zero dependencies, and it belongs in vanilla. The **settle** half (a velocity-aware, interruptible spring) is the one place a small library earns its weight, because CSS transitions cannot absorb a live release velocity and hand-rolling a correct interruptible spring is real work. Reach for the motion library already in `package.json`; if there is none and the interaction is genuinely gesture-driven, a compact spring built on the Web Animations API is the lighter option before adding a full runtime ([performance.md](performance.md), tool ladder).

---

*Cross-references: [motion.md](motion.md) (springs, interruptibility, the token scale) · [performance.md](performance.md) (compositor-only transforms, the tool ladder) · [interaction-states.md](interaction-states.md) (press-vs-release commit, keyboard parity) · [accessibility.md](accessibility.md) (reduced-motion substitution, reachability).*
