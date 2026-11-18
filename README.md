# trexito.com

Personal site of TreXito. Static HTML/CSS/JS, no build step, published by GitHub Pages from `main` (custom domain in `CNAME`).

## Current state (Nov 2026): liquid glass

- `index.html`: contact-poster hero, widgets, App Store style project list, Settings style background and links.
- `frikadellen-baf.html`: BAF project notes in the same system, green tint (`body.baf`).
- `styles.css`: glass material (blur, saturation, specular rim, pointer light), ambient aurora, iOS style tab bar.
- `app.js`: Motion springs for reveals, counters, poster depth and the tab bar lens; Lenis inertial scroll; real edge refraction on the tab bar in Chromium (SVG displacement map through `backdrop-filter: url()`), plain blur elsewhere.
- Libraries from jsDelivr, version pinned with SRI: `motion@14.14.0` (UMD), `lenis@1.3.27`. Fonts: Geist and Geist Mono (Google Fonts).
- Reduced motion, reduced transparency and no-JS all fall back to a static, fully visible page.
- `og.png` is rendered from `tools/og.html` at 1200x630 with headless Chromium.

## Privacy rules for this site

- Handle only. No legal name, no city, region, employer or school names that pin a location.
- "42" is fine, "42 <city>" is not. No links whose URL or page shows the legal name (LinkedIn, OpenPowerlifting were removed for that reason).
- Older commits still contain the previous details; only the current tree is clean.

## Facts and sources

| Claim | Source |
| --- | --- |
| Studying at 42 from 2026, IT system technician apprenticeship 2022 to 2026, HTL IT-Medientechnik 2020 to 2021 | Owner |
| Frikadellen BAF: open source Rust SkyBlock automation with AH, Bazaar, web panel and Discord | [Repository](https://github.com/TreXito/frikadellen-baf-121) |
| 37,805 profitable sales, 232.3B realized, biggest flip +2.16B (Ancient Crown of Avarice, 2.6M to 2.22B) | baf-backend `events` table, export Oct 2026 |
| Sky Watch, AzaleaPathfinder | [Skywatch](https://github.com/TreXito/Skywatch), [AzaleaPathfinder](https://github.com/TreXito/AzaleaPathfinder) |

The BAF ban advisory was removed in Nov 2026: the project README no longer carries it (auctionflipper.bz dropped its banner in frikadellenbaf-site PR #7).

## Verify locally

```bash
python3 -m http.server 8811 --bind 127.0.0.1   # then open http://127.0.0.1:8811/
```
