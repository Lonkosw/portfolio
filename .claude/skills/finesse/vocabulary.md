# Vocabulary

A naming layer. Most people can *describe* the motion or effect they want ("the springy thing when a popover opens", "that iOS scroll that resists and snaps back") but not name it, and an unnamed effect is hard to ask for. This file turns a loose description into the precise term, so the next prompt can say "origin-aware scale-in", not "make it grow from the button, you know the thing."

It is the bridge to the rest of finesse: once you have the term, the technique lives in the file that owns it (motion, gestures, surfaces, and so on).

## How to use it

- **Read for the sensation, not the keyword.** People say what they *see* or *feel* ("slides off", "draws itself in", "bouncy"), not the technical label. Map the feeling to an entry below.
- **Lead with the single best match,** then, if two terms genuinely compete (crossfade vs morph, pop-in vs bounce), name the runner-up and the one-line difference so the asker can pick.
- **A naming question wants a name, not an essay.** Return the term and its one-line definition. Expand only if asked.
- **Stay honest about the edges.** If nothing fits exactly, say so and give the closest term as an approximation, or describe the effect using these words ("that is a *stagger* of *scale-in* entrances"). Do not invent a term that isn't real.

Format:

```
**Stagger** · animate several items one after another with a small delay between each, so they cascade in instead of appearing at once.
```

---

## Entrances and exits

- **Fade in / fade out** · an element appears or leaves purely by changing opacity.
- **Slide in** · an element enters by translating in from an edge (left, right, top, bottom).
- **Scale in** · an element grows from slightly smaller to full size as it appears, usually paired with a fade.
- **Pop in** · a scale-in with a touch of overshoot, so it bounces lightly into place.
- **Reveal** · content uncovered gradually, typically by animating a clip-path or mask rather than moving the element.
- **Enter / exit** · the animation an element plays as it is added to or removed from the screen. Exits are the neglected half.

## Sequencing and timing

- **Keyframes** · named points in an animation (0%, 50%, 100%) that the browser interpolates between. One-shot, not interruptible.
- **Interpolation (tween)** · generating the in-between frames from a start and end value so motion is continuous.
- **Stagger** · animate items one after another with a small delay, creating a cascade.
- **Orchestration** · timing several animations deliberately so they read as one coordinated motion.
- **Delay** · time before an animation starts. **Duration** · how long it runs.
- **Fill mode** · whether an element holds its first or last frame before an animation starts or after it ends (`forwards`, `backwards`, `both`).

## Transforms and origin

- **Translate / scale / rotate / skew** · move, resize, spin, or shear an element. The cheap, compositor-only transforms.
- **Transform origin** · the anchor point a scale or rotation grows or spins from. Default is center.
- **Origin-aware animation** · an element animates *out of its trigger* (a popover growing from the button that opened it) instead of from its own center. See [motion.md](motion.md).
- **3D tilt / flip** · rotating in 3D space (`rotateX`/`rotateY` with `preserve-3d`) to add depth or reveal a back face.
- **Perspective** · how strong a 3D effect reads; a lower value exaggerates depth.

## Transitions between states

- **Crossfade** · one element fades out as another fades in, in the same spot.
- **Morph** · one shape smoothly becomes another (a Dynamic-Island-style transform).
- **Shared-element transition** · an element travels and transforms from one position into another, like a thumbnail expanding into a detail view.
- **Layout animation** · when an element's size or position changes, it animates to the new spot instead of snapping (FLIP or the View Transitions API do this for you, see [performance.md](performance.md)).
- **Continuity transition** · a change that keeps the user oriented by visually connecting before and after.
- **Direction-aware transition** · content slides one way going forward and the opposite way going back, so navigation has a sense of direction.
- **Accordion / collapse** · a section smoothly expands and collapses its height to show or hide content.

## Scroll

- **Scroll reveal** · elements fade or slide into place as they enter the viewport.
- **Scroll-driven animation** · an animation whose progress is tied directly to scroll position (`animation-timeline`), no scroll listener.
- **Parallax** · foreground and background move at different speeds while scrolling, implying depth.
- **View transition** · the browser morphs between two states or routes, connecting shared elements.

## Feedback and interaction

- **Hover effect** · a visual change when the cursor is over an element (gated so it does not stick on touch).
- **Press / tap feedback** · a subtle scale-down on press, so the control feels physical.
- **Hold to confirm** · a progress fill that completes while the user holds, deliberate by design.
- **Drag** · moving an element by grabbing it, often carrying momentum on release. See [gestures.md](gestures.md).
- **Drag to reorder** · dragging items in a list while the others shift to make room.
- **Swipe to dismiss** · dragging an element off-screen to close it (a drawer, a toast).
- **Rubber-banding** · resistance and snap-back when you drag past a boundary (the iOS overscroll feel). See [gestures.md](gestures.md).
- **Ripple** · a circle expanding from the point of a tap, confirming the press.
- **Shake / wiggle** · a quick side-to-side jitter signalling a rejected input.

## Easing

- **Easing** · the rate at which an animation speeds up or slows down.
- **Ease-out** · starts fast, ends slow. The default for entrances and anything responding to the user.
- **Ease-in** · starts slow, ends fast. Avoid on UI except for exits; it reads as sluggish.
- **Ease-in-out** · slow, fast, slow. For elements already on screen moving from A to B.
- **Linear** · constant speed. Only for continuous loops (spinners, marquees).
- **Cubic-bezier** · a custom easing curve. The authored curves in the token scale beat the weak built-in keywords.
- **Asymmetric easing** · different acceleration and deceleration; feels more alive than a symmetric curve.

## Springs

- **Spring** · motion driven by physics (response and bounce, or mass/stiffness/damping) rather than a fixed duration. See [motion.md](motion.md) and [gestures.md](gestures.md).
- **Response** · roughly how quickly a spring reaches its target. **Bounce / damping** · how much it overshoots before settling.
- **Momentum** · motion that carries velocity, especially after a drag or an interruption.
- **Velocity handoff** · passing a gesture's release velocity into the settle animation so there is no seam.
- **Interruptible animation** · one that can be caught and redirected mid-flight instead of finishing first.

## Looping and ambient motion

- **Marquee** · content scrolling continuously in a loop.
- **Pulse** · a gentle repeating scale or opacity change to draw attention.
- **Float** · a slow, continuous up-and-down drift that makes a static element feel alive.
- **Orbit** · an element circling another in a continuous path.
- **Idle animation** · subtle motion while an element sits waiting to be used.

## Polish and effects

- **Blur** · a filter that softens an element or masks a jump between two states in a crossfade.
- **Clip-path** · clipping an element to a shape for reveals, wipes, and before/after sliders. See [motion.md](motion.md).
- **Mask** · revealing parts of an element with a shape or gradient, like clip-path but with soft, fadeable edges.
- **Before / after slider** · a draggable divider wiping between two overlaid images.
- **Line drawing** · an SVG path animating as if drawn by an invisible pen.
- **Number ticker** · digits rolling or counting up to a value (pair with `tabular-nums`, see [typography.md](typography.md)).
- **Skeleton / shimmer** · a layout-shaped placeholder with a moving sheen shown while content loads. See [interaction-states.md](interaction-states.md).
- **Typewriter** · text appearing one character at a time.

## Principles

- **Purposeful animation** · motion serves a function (orient, give feedback, show a relationship), never pure decoration.
- **Spatial consistency** · animating so an element keeps its identity and position across states, so the user never loses track of where things went.
- **Perceived performance** · the right animation makes an interface feel faster even when it is not.
- **Frequency of use** · the more often a user sees an animation, the shorter and subtler it must be.
- **Anticipation / follow-through** · a small wind-up before a move, or a settle after it, borrowed from classical animation to add weight.
- **Reduced motion** · honoring the user's `prefers-reduced-motion` setting by substituting gentler motion, not deleting meaning. See [accessibility.md](accessibility.md).

---

*For the technique behind any term here, follow the cross-reference to the file that owns it. This page only gives you the word to ask for.*
