Here's your ready-to-paste Figma prompt for both charts:

---

> Add an **analytics section** to the existing dark navy parking management dashboard. This section contains 5 charts. All colors match the existing system exactly.
>
> **Global rules for all charts**
> - Background: `#0A1628` page, `#0F2044` card surface
> - Card border: `1px solid #1E3A6E`, border radius: 12px, padding: 20px
> - Card section label: 11px, uppercase, `#475569`, letter-spacing 0.07em
> - No gradients, no shadows, flat fills only
> - Font: IBM Plex Sans — labels 11px, values 13px, large numbers 24px weight 500
> - All axes and grid lines: `#1E3A6E`, 1px
> - Tooltip style: `#0F2044` background, `1px solid #1E3A6E` border, 12px radius, white text
>
> ---
>
> **Chart 1 — Entry frequency bar chart (hourly)**
> Type: vertical bar chart, full width card
> Title label: "Fréquence d'entrées par heure"
> Badge top-right: "Aujourd'hui" pill — `rgba(59,130,246,0.12)` bg, `#60A5FA` text
>
> X axis: hours from 06h to 22h (17 bars total)
> Y axis: number of vehicles (0 to 40), grid lines at every 10
>
> Bar colors:
> - Off-peak hours (06h–08h, 20h–22h): `rgba(30,58,110,0.8)` fill, `#1E3A6E` border
> - Normal hours: `rgba(59,130,246,0.5)` fill, `#3B82F6` top border
> - Peak hours (08h, 12h, 17h–18h): `#3B82F6` solid fill — these are the tallest bars
> - The single highest bar (18h): `#60A5FA` fill with a `#FBBF24` top accent stripe 3px tall
>
> Below the chart, add a peak info row:
> "Heure de pointe: 18h00 — 38 véhicules" — amber pill `rgba(251,191,36,0.12)` bg, `#FBBF24` text, with a small warning triangle icon
>
> Bar width: even spacing with 4px gap between bars
> Bar radius: 3px top corners only
> Hover state: bar opacity drops to 70%, tooltip appears showing exact count
>
> ---
>
> **Chart 2 — Access authorization donut chart**
> Type: donut / ring chart
> Card width: 50% of the analytics row (sits next to Chart 3)
> Title label: "Taux d'autorisation d'accès"
>
> Donut specs:
> - Outer radius: 80px, inner radius: 52px (thick ring)
> - Gap between segments: 3px white space
> - Segment 1 — Autorisés: 74% — color `#10B981`
> - Segment 2 — Refusés: 18% — color `#EF4444`
> - Segment 3 — Blacklistés: 8% — color `#F59E0B`
>
> Center of donut (inside the hole):
> - Large number: "74%" — 26px, weight 500, `#34D399`
> - Small label below: "autorisés" — 11px, `#475569`
>
> Right of donut, vertical legend with 3 rows. Each row:
> - Colored dot 10px matching segment color
> - Label: "Autorisés / Refusés / Blacklistés" — 12px `#94A3B8`
> - Value: "74% · 312 véhicules" — 13px weight 500 `#E2E8F0`
>
> Hover on each segment: segment lifts outward 6px, tooltip shows label + count + percentage
>
> ---
>
> **Chart 3 — Average parking duration bar chart**
> Type: horizontal bar chart
> Card width: 50% (sits next to Chart 2)
> Title label: "Durée moyenne de stationnement"
>
> 5 rows, each a horizontal bar:
> - Moins de 30 min: 22% — `rgba(59,130,246,0.6)`
> - 30 min – 1h: 35% — `#3B82F6` (longest bar)
> - 1h – 2h: 28% — `rgba(59,130,246,0.6)`
> - 2h – 4h: 10% — `rgba(30,58,110,0.8)`
> - Plus de 4h: 5% — `rgba(30,58,110,0.6)`
>
> Bar height: 10px, border radius 5px (fully rounded ends)
> Track background: `#1E3A6E`
> Label left: duration range, 12px `#94A3B8`
> Label right: percentage, 12px weight 500 `#60A5FA`
> Gap between rows: 14px
>
> ---
>
> **Chart 4 — Weekly heatmap**
> Type: 7×17 grid heatmap (days × hours)
> Full width card
> Title label: "Carte de chaleur hebdomadaire — occupation par heure"
> Badge: "7 derniers jours" pill — green
>
> Rows: Lun / Mar / Mer / Jeu / Ven / Sam / Dim
> Columns: 06h to 22h
>
> Cell size: equal width, 28px tall, 4px gap, border-radius 4px
> Cell color scale (5 levels based on traffic intensity):
> - Level 0 (0–5 vehicles): `#0F2044` — almost invisible
> - Level 1 (6–12): `rgba(59,130,246,0.15)`
> - Level 2 (13–20): `rgba(59,130,246,0.35)`
> - Level 3 (21–30): `rgba(59,130,246,0.65)`
> - Level 4 (31+): `#3B82F6` solid — hottest cells
>
> Hottest cells (Ven 18h, Jeu 18h, Mer 17h): use `#60A5FA` with a 1px `#7DD3FC` border
> Weekend rows (Sam, Dim): generally cooler colors (level 0–2 only)
> Hover: cell scales up 1.1x, tooltip shows "Mer 17h — 34 véhicules"
>
> Color legend below the grid: horizontal gradient strip from `#0F2044` to `#60A5FA`, labeled "Faible" on left and "Élevé" on right, 11px `#475569`
>
> ---
>
> **Chart 5 — Live KPI mini cards row**
> 4 cards in a row above all charts, full width
> Each card: `#0F2044` bg, `1px solid #1E3A6E` border, 12px radius, padding 16px
>
> Card 1 — Entrées aujourd'hui:
> - Value: "147" — 28px weight 500 `#60A5FA`
> - Label: "entrées aujourd'hui" — 11px `#475569`
> - Trend: "+12% vs hier" — 11px `#34D399` with up arrow icon
>
> Card 2 — Taux d'autorisation:
> - Value: "74%" — 28px weight 500 `#34D399`
> - Label: "véhicules autorisés" — 11px `#475569`
> - Trend: "-3% vs hier" — 11px `#F87171` with down arrow
>
> Card 3 — Heure de pointe:
> - Value: "18h00" — 28px weight 500 `#FBBF24`
> - Label: "heure la plus chargée" — 11px `#475569`
> - Trend: "38 véhicules" — 11px `#94A3B8`
>
> Card 4 — Durée moyenne:
> - Value: "47 min" — 28px weight 500 `#E2E8F0`
> - Label: "durée de stationnement" — 11px `#475569`
> - Trend: "+5 min vs hier" — 11px `#F87171` with up arrow
>
> ---
>
> **Layout order top to bottom:**
> 1. KPI mini cards row (Chart 5) — 4 columns
> 2. Bar chart — entry frequency (Chart 1) — full width
> 3. Two-column row: Donut chart (Chart 2) left + Duration bars (Chart 3) right
> 4. Heatmap (Chart 4) — full width
>
> **Design rules**
> - No gradients anywhere
> - No drop shadows
> - All interactive hover states must be designed as separate component states in Figma
> - Donut animation on load: ring draws clockwise from 0° over 1.2 seconds
> - Bar chart animation on load: bars grow upward from 0 height over 0.8 seconds staggered by 40ms per bar
> - Heatmap animation on load: cells fade in row by row with 60ms stagger

---

Paste this directly into Figma AI or hand it to your designer — every chart, color, size, and interaction state is fully specified.