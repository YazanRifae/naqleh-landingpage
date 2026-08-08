# Must be filled before this page goes live

`LANDING-PAGE-CONTENT.md` §6 marks a set of figures as placeholders or open policy
decisions, and §5 lists claims that must never appear. **Publishing a wrong number is
a commercial commitment you then have to honour**, so this build states the *mechanism*
everywhere and the *number* nowhere.

Nothing below is currently on the page. Each row is a deliberate omission, not an oversight.

---

## 1. Figures deliberately absent from the copy

| Item | Status in the scope | Where it would go |
|---|---|---|
| Liability cap amount | Set before launch; must be published and accepted at booking | §3.8 card "سقف تعويض معلن" / "A published liability cap" |
| Cancellation tier percentages | Placeholder (25% / 50%) | §3.8 card "رسم الإلغاء…" — currently describes tiers with no figures |
| Return leg fee | Placeholder (~75% of base) | §3.6 additional charges chip |
| Storage rate per day | To be set | §3.6 chip + §3.9 holding-point card |
| Abandonment period at the holding point | **Open policy decision** — must be stated plainly, never buried | §3.9 holding-point card |
| Delivery re-attempt limit | Placeholder (2 attempts) | §3.9 re-attempt card ("within the limit") |
| Free waiting time | Placeholder (15 min) | not currently referenced |
| Active city list | Must match live operational coverage | §3.11 Coverage — page shows **only** the stated founding route, Damascus ⇄ Aleppo |
| Support phone / hours | Not in the scope docs — get from operations | footer "تواصل معنا" / "Talk to us" |
| Driver share % / payout figures | Do not publish until operations confirms | §3.12 — page describes visibility, no numbers |

## 2. Fleet capacities — flagged on the page, still need recalibration

§3.4 says capacities are **indicative and must be recalibrated against the real fleet
before launch**. They are published (the spec asks for them) but carry a visible caveat
pill above the cards:

> السعات أدناه إرشادية، وتُعاد معايرتها مقابل الأسطول الفعلي قبل الإطلاق.
> The capacities below are indicative and are recalibrated against the real fleet before launch.

Source of truth: `src/content.js` → `CONTENT.ar.fleet` / `CONTENT.en.fleet`, plus
`FLEET_KG` (numeric, drives the capacity bars — update both together).

## 3. Prohibited-goods list

§6: *must be finalised against local regulation before launch.* Currently reproduces
§3.5 verbatim. Legal review needed before publishing.

## 4. Wiring still to do (not content — plumbing)

| Thing | Current state | Needs |
|---|---|---|
| CTA destinations | Every CTA points at `#book` (the footer block) | Real signup / app-store / order-flow URLs |
| Canonical domain | `https://naqla.sy` hardcoded in `build.js` (`SITE`) | Confirm the real domain; it drives `canonical` + `hreflang` |
| Contact channel | none | phone / WhatsApp / form behind "Talk to us" |

## 5. Claims blocked on purpose (§5)

Verified absent from both language builds. Do not let these creep back in:

- "Cash on delivery" / collecting the value of goods — **COD was removed by decision**
- "A vehicle dedicated to your shipment" — a vehicle may carry several orders
- "Live GPS tracking the whole way" — live position is **final approach only**
- "Guaranteed delivery in X hours" — promise an arrival **window**, never a duration
- "Multi-stop routes" — one pickup → one drop-off in V1
- "Partial delivery" — all or nothing
- "Insured shipments" / "full-value insurance" — say **liability cap**, not insurance
- "Scheduled routes / daily departures" — out of V1
- "Download the app to receive your delivery" — there is **no receiver app**

## 6. Arabic sign-off

§4: *The Arabic build must be walked end to end by a native speaker before launch — not
translated and shipped.* The copy here is taken from the spec's own Arabic column rather
than machine-translated, and RTL was built structurally (logical CSS properties, mirrored
film layout, no letter-spacing on Arabic text). It still needs a native read-through for
tone before launch.
