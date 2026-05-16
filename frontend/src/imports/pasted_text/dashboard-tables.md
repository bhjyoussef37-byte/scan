Here's your ready-to-paste Figma prompt for both tables:

---

> Add **two data tables** to the main dashboard page of the dark navy parking management system. Both tables sit in full-width cards, stacked vertically, below the stat cards section. They display live database content from the `authorized` and `history` tables.
>
> **Global table rules**
> - Card background: `#0F2044`, border: `1px solid #1E3A6E`, border-radius: 12px, padding: 20px
> - Table background: transparent (inherits card)
> - Header row background: `#060D1A`, height: 36px
> - Header text: 11px, uppercase, letter-spacing 0.07em, color `#475569`, font IBM Plex Sans
> - Body row height: 44px
> - Row separator: `1px solid #1E3A6E`
> - Alternating row tint: even rows get `rgba(255,255,255,0.02)` overlay — very subtle
> - Hover state on any row: background becomes `rgba(59,130,246,0.06)`, left border `2px solid #3B82F6` appears
> - All body text: 13px, `#E2E8F0`, font IBM Plex Sans
> - Plate/matricule values: always IBM Plex Mono, 13px, `#7DD3FC`
> - Numbers and IDs: IBM Plex Mono, `#94A3B8`
> - Table must be `width: 100%`, columns use fixed widths defined below
> - No horizontal scroll — all columns fit within the card width
>
> ---
>
> **Table 1 — Authorized vehicles (`authorized`)**
>
> Card header row (above the table):
> - Left: label "Véhicules autorisés" — 13px weight 500 `#E2E8F0`, with a green dot `#10B981` 8px pulsing before it
> - Right side: two elements side by side:
>   - Search input — `#060D1A` bg, `1px solid #1E3A6E` border, 8px radius, 32px tall, 200px wide, placeholder "Rechercher une plaque..." in `#334155`, IBM Plex Mono 12px
>   - Add button — `#1D4ED8` bg, `#E0F2FE` text, 8px radius, 32px tall, label "+ Ajouter" 12px weight 500, with a `+` icon left
>
> Table columns (4 columns):
>
> Column 1 — ID
> - Header: "ID"
> - Width: 60px
> - Content: auto-increment integer, IBM Plex Mono, `#334155`, 12px
>
> Column 2 — Matricule
> - Header: "Matricule"
> - Width: flex (takes remaining space)
> - Content: plate string (e.g. "12345أ6"), IBM Plex Mono 13px `#7DD3FC`
> - Show a small license plate frame icon left of the text: 14px, `#1E3A6E`
>
> Column 3 — Statut
> - Header: "Statut"
> - Width: 120px
> - Content: always a green pill badge — `rgba(16,185,129,0.12)` bg, `rgba(16,185,129,0.25)` border, `#34D399` text, "Autorisé", 10px weight 500, border-radius 20px, padding 3px 10px
>
> Column 4 — Actions
> - Header: "Actions"
> - Width: 100px, right-aligned
> - Content: two icon buttons side by side with 8px gap:
>   - Edit icon button: `rgba(59,130,246,0.1)` bg, `#60A5FA` icon, 28px square, 6px radius
>   - Delete icon button: `rgba(239,68,68,0.1)` bg, `#F87171` icon (trash), 28px square, 6px radius
>   - Both buttons: border `1px solid transparent`, hover state adds matching color border
>
> Empty state (when table has no rows):
> - Centered in the table body, 80px tall area
> - Icon: car outline SVG, 24px, `#1E3A6E`
> - Text: "Aucun véhicule autorisé" — 13px `#334155`
>
> Footer row below table:
> - Left: "3 véhicules enregistrés" — 11px `#475569`
> - Right: pagination controls — Previous / 1 / 2 / 3 / Next — 11px `#475569`, active page: `#3B82F6` bg pill
>
> Sample data to show in design (3 rows):
> - Row 1: ID 1 · "12345أ6" · Autorisé
> - Row 2: ID 2 · "MA-5678-B" · Autorisé
> - Row 3: ID 3 · "16D-9922" · Autorisé
>
> ---
>
> **Table 2 — Detection history (`history`)**
>
> Card header row (above the table):
> - Left: label "Historique des détections" — 13px weight 500 `#E2E8F0`, with a blue dot `#3B82F6` 8px before it
> - Right side: three elements side by side with 8px gap:
>   - Filter dropdown — "Tous les statuts" — same style as search input, 140px wide, dropdown arrow right
>   - Date input — same style, 150px wide, placeholder "Date..."
>   - Export button — `rgba(16,185,129,0.1)` bg, `#34D399` text, `1px solid rgba(16,185,129,0.25)` border, 8px radius, 32px tall, label "↓ Exporter CSV" 12px
>
> Table columns (7 columns):
>
> Column 1 — ID
> - Header: "ID"
> - Width: 55px
> - Content: integer, IBM Plex Mono 12px `#334155`
>
> Column 2 — Horodatage
> - Header: "Horodatage"
> - Width: 155px
> - Content: datetime string "2025-01-15 08:42:11" — IBM Plex Mono 12px `#94A3B8`
> - Show a small clock icon 12px `#334155` left of the text
>
> Column 3 — Matricule
> - Header: "Matricule"
> - Width: flex
> - Content: full plate string — IBM Plex Mono 13px `#7DD3FC`
>
> Column 4 — Numéros
> - Header: "Numéros"
> - Width: 90px
> - Content: numeric part only — IBM Plex Mono 12px `#94A3B8`
>
> Column 5 — Lettres
> - Header: "Lettres"
> - Width: 80px
> - Content: character part only — IBM Plex Mono 12px `#94A3B8`
>
> Column 6 — Statut
> - Header: "Statut"
> - Width: 120px
> - Two possible badge styles:
>   - Authorized: `rgba(16,185,129,0.12)` bg · `rgba(16,185,129,0.25)` border · `#34D399` text · label "Autorisé"
>   - Denied: `rgba(239,68,68,0.10)` bg · `rgba(239,68,68,0.25)` border · `#F87171` text · label "Refusé"
> - Badge: 10px weight 500, border-radius 20px, padding 3px 10px
> - Each badge has a matching 6px dot left of the text — green or red
>
> Column 7 — Confiance
> - Header: "Confiance"
> - Width: 110px
> - Content: a mini horizontal progress bar + percentage label
>   - Bar track: `#1E3A6E`, height 5px, border-radius 3px, width 60px
>   - Bar fill color changes by value:
>     - 85–100%: `#10B981` (high confidence)
>     - 60–84%: `#F59E0B` (medium)
>     - 0–59%: `#EF4444` (low)
>   - Percentage text right of bar: 11px weight 500, same color as bar fill
>
> Empty state:
> - Centered, 80px tall
> - Icon: history/clock outline SVG, 24px, `#1E3A6E`
> - Text: "Aucune détection enregistrée" — 13px `#334155`
>
> Footer row below table:
> - Left: "Affichage 1–10 sur 247 résultats" — 11px `#475569`
> - Right: pagination — Previous / 1 / 2 / 3 / ... / 25 / Next — same style as Table 1
>
> Sample data to show in design (5 rows):
> - Row 1: ID 1 · 2025-01-15 08:42 · "12345أ6" · 12345 · أ6 · Autorisé · 97%
> - Row 2: ID 2 · 2025-01-15 08:51 · "MA-5678-B" · 5678 · MAB · Autorisé · 91%
> - Row 3: ID 3 · 2025-01-15 09:03 · "XX-0000-Z" · 0000 · XXZ · Refusé · 78%
> - Row 4: ID 4 · 2025-01-15 09:17 · "16D-9922" · 9922 · 16D · Autorisé · 95%
> - Row 5: ID 5 · 2025-01-15 09:34 · "AB-1111-C" · 1111 · ABC · Refusé · 54%
>
> ---
>
> **Spacing between the two tables**
> - 16px vertical gap between Table 1 card and Table 2 card
> - Both cards are full width of the main content area
> - Table 2 is taller due to more columns — its card expands to fit all rows naturally

---

Every column, badge, color, and interaction state is fully specified — paste directly into Figma AI or hand off to your designer.