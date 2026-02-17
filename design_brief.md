# Design Brief: Gewohnheitstracker

## 1. App Analysis

### What This App Does
The Gewohnheitstracker (Habit Tracker) is a personal productivity app that helps users build and maintain positive habits. Users can define habits with target frequencies (daily, weekly, monthly), log their tracking entries with status and ratings, and perform daily check-ins to see which habits they completed. It's a simple but powerful tool for personal development and self-improvement.

### Who Uses This
People focused on self-improvement - whether building fitness routines, improving nutrition, boosting productivity, or developing better social habits. They check the app daily (usually morning or evening) to log completed habits and see their progress. They want quick insight into "Am I on track?" and easy logging without friction.

### The ONE Thing Users Care About Most
**"How well am I doing with my habits today/this week?"** - Users want to immediately see their completion rate and whether they're staying consistent. The streak or completion percentage is their primary motivation driver.

### Primary Actions (IMPORTANT!)
1. **Tracking eintragen** (Log a tracking entry) → Primary Action Button - the #1 action users perform multiple times daily
2. **Neue Gewohnheit anlegen** (Create new habit) - done occasionally when setting up or adjusting habits
3. **Täglicher Check-in** (Daily check-in) - alternative way to mark multiple habits at once

---

## 2. What Makes This Design Distinctive

### Visual Identity
This dashboard uses a **warm, encouraging aesthetic** with cream-toned backgrounds and a deep teal accent that feels calming yet motivating. Unlike harsh productivity apps, this design feels like a supportive companion rather than a demanding taskmaster. The warmth of the color palette creates psychological safety for users building new habits - failure feels less punishing.

### Layout Strategy
The layout uses an **asymmetric hero-first approach**:
- The hero element (today's completion rate as a radial progress ring) dominates the top section, taking ~40% of mobile viewport
- This creates immediate visual feedback on progress
- Secondary KPIs (streak count, total completions, average rating) are displayed as compact inline metrics below the hero
- Recent activity and habit list sit below, letting users drill down
- The asymmetry (large hero vs. smaller supporting elements) creates visual tension and guides the eye naturally

### Unique Element
The **radial progress ring** for today's completion rate uses a thick 6px stroke with rounded caps and a subtle drop shadow. The ring fills with the teal accent color as habits are completed. At 100%, the ring pulses gently once as a celebration. This gamification element makes completing all daily habits feel rewarding.

---

## 3. Theme & Colors

### Font
- **Family:** Space Grotesk
- **URL:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap`
- **Why this font:** Space Grotesk is a modern geometric sans-serif that feels contemporary and data-focused without being cold. Its slightly quirky letterforms add personality while remaining highly readable for numbers and data display.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 30% 97%)` | `--background` |
| Main text | `hsl(200 15% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(200 15% 15%)` | `--card-foreground` |
| Borders | `hsl(40 20% 88%)` | `--border` |
| Primary action (teal) | `hsl(174 62% 35%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(174 62% 35%)` | `--accent` |
| Muted background | `hsl(40 20% 94%)` | `--muted` |
| Muted text | `hsl(200 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(152 60% 40%)` | (component use) |
| Error/negative | `hsl(0 70% 55%)` | `--destructive` |

### Why These Colors
The warm cream background (`hsl(40 30% 97%)`) creates an inviting, paper-like feel that's easier on the eyes than pure white. The deep teal primary (`hsl(174 62% 35%)`) is sophisticated yet approachable - it conveys growth, health, and progress without the typical "productivity app blue." The contrast between warm background and cool accent creates visual interest.

### Background Treatment
The page uses a warm off-white/cream background. Cards are pure white, creating subtle depth without heavy shadows. This layered approach makes the interface feel clean but not flat.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Mobile uses a single-column vertical flow with the hero progress ring dominating the first screen. The layout creates clear visual hierarchy through size variation - the hero takes 40% of viewport height, while secondary metrics are compact and horizontal.

### What Users See (Top to Bottom)

**Header:**
- App title "Gewohnheitstracker" in medium weight (font-weight: 500)
- Settings icon (gear) on the right, subtle gray
- Clean white header bar with subtle bottom border

**Hero Section (The FIRST thing users see):**
- **What:** Today's completion rate as a large radial progress ring
- **Size:** Takes ~40% of viewport height, centered
- **Content:**
  - Large radial progress ring (160px diameter, 6px stroke)
  - Inside the ring: percentage number (48px bold) + "heute erledigt" label below
  - Ring color: teal primary when progressing, green when 100%
- **Why this is the hero:** Users need instant visual feedback on "Am I on track today?" The progress ring gamifies the experience and provides motivation.

**Section 2: Quick Stats Row**
- Horizontal row of 3 compact stats (not cards, just inline text with icons):
  - Streak: flame icon + "7 Tage"
  - Diese Woche: checkmark icon + "23/35" (completed/total)
  - Durchschnitt: star icon + "4.2" (average rating)
- Small text (14px), muted foreground color
- Separated by vertical dividers
- This keeps key metrics visible without taking much space

**Section 3: Heute zu erledigen (Today's Habits)**
- Section title with count badge: "Heute zu erledigen" + "(5)"
- List of today's pending habits as compact cards:
  - Habit name (medium weight)
  - Category badge (e.g., "Fitness", "Gesundheit") - small, muted
  - Tap to mark complete or open quick-log dialog
- Completed habits show with checkmark and strike-through, move to bottom of list
- This is the actionable core - users tap habits to log them

**Section 4: Letzte Einträge (Recent Activity)**
- Section title: "Letzte Einträge"
- Compact list of recent tracking entries:
  - Habit name + status badge ("Erledigt" green, "Teilweise" yellow, "Übersprungen" red)
  - Timestamp: "vor 2 Stunden"
- Max 5 entries visible, "Alle anzeigen" link to see more
- Provides activity feed for sense of progress

**Bottom Navigation / Action:**
- Fixed bottom action button: "Tracking eintragen" (primary teal, full width minus padding)
- Thumb-friendly position in bottom zone
- Opens dialog to log a new tracking entry

### Mobile-Specific Adaptations
- Hero progress ring is smaller (160px vs 200px on desktop)
- Stats row is horizontal and compact
- Habit list items are full-width with larger touch targets (min 48px height)
- Recent activity shows fewer items (5 vs 10)
- Bottom action button is fixed for easy thumb access

### Touch Targets
- All tappable elements minimum 44px height
- Habit list items have generous padding (16px vertical)
- Primary action button is 48px tall

### Interactive Elements
- Tap habit in "Heute zu erledigen" → Quick dialog to log status (Erledigt/Teilweise/Übersprungen) and optional rating
- Tap recent entry → Detail sheet showing full entry info
- Progress ring tap → Shows breakdown of today's habits

---

## 5. Desktop Layout

### Overall Structure
Desktop uses a **two-column asymmetric layout** with a 2:1 ratio:
- **Left column (66%):** Hero section + Charts + Recent activity
- **Right column (34%):** Habits list with CRUD + Stats

The eye flows: Hero (top-left) → Stats (top-right) → Chart (middle-left) → Habits list (right)

### Section Layout

**Top Area:**
- Header spans full width: Title left, primary action button right ("+ Tracking eintragen")
- Below header: Two-column grid begins

**Left Column (Main content):**
1. **Hero Card** - Large card with:
   - Radial progress ring (200px diameter, centered)
   - "Heute: X% erledigt" below ring
   - Quick stats row (streak, week progress, avg rating) below
2. **Wochenverlauf Chart** - Bar chart showing daily completion rates for last 7 days
3. **Letzte Einträge** - Table view of recent tracking entries (10 rows)

**Right Column (Supporting):**
1. **Meine Gewohnheiten** - Full habits list with:
   - Each habit shows: name, category badge, frequency, toggle for active/inactive
   - Edit/Delete actions on hover
   - "Neue Gewohnheit" button at top
2. **Kategorie-Übersicht** - Small breakdown by category (donut chart or simple list with bars)

### What Appears on Hover
- Habit list items: Edit (pencil) and Delete (trash) icons appear on right
- Table rows: Full row background highlight
- Charts: Tooltip with exact values

### Clickable/Interactive Areas
- Click habit in right panel → Opens edit dialog (pre-filled form)
- Click tracking entry in table → Opens detail dialog
- Click chart bar → Filters recent entries to that day

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Heute erledigt
- **Data source:** Tracking-Einträge app, filtered to today
- **Calculation:** Count of entries with status="erledigt" for today's habits ÷ total active habits × 100
- **Display:** Large radial progress ring (200px desktop, 160px mobile) with percentage inside. 48px bold number, "heute erledigt" label below in muted text.
- **Context shown:** Ring visually fills as percentage increases. At 100%, ring is green and shows celebration state.
- **Why this is the hero:** Daily completion rate is THE metric that matters for habit building. It provides instant feedback and motivation.

### Secondary KPIs

**Streak (Tage in Folge)**
- Source: Calculate from Tracking-Einträge
- Calculation: Consecutive days where at least one habit was completed
- Format: Number + "Tage"
- Display: Inline with flame icon

**Diese Woche**
- Source: Tracking-Einträge
- Calculation: Count entries with status="erledigt" this week / total expected entries this week
- Format: "X/Y" (completed/total)
- Display: Inline with checkmark icon

**Durchschnittsbewertung**
- Source: Tracking-Einträge.bewertung
- Calculation: Average of all rating values (1-5)
- Format: Number with 1 decimal
- Display: Inline with star icon

### Chart

- **Type:** Bar chart - shows daily patterns clearly, better than line for discrete days
- **Title:** Wochenverlauf
- **What question it answers:** "How consistent have I been this week?" - shows daily completion rates
- **Data source:** Tracking-Einträge, grouped by date (last 7 days)
- **X-axis:** Day of week (Mo, Di, Mi, Do, Fr, Sa, So)
- **Y-axis:** Completion count or percentage
- **Mobile simplification:** Same chart but smaller, fewer labels, touch to see values

### Lists/Tables

**Heute zu erledigen (Mobile primary list)**
- Purpose: Shows today's habits for quick logging
- Source: Gewohnheiten (filtered by frequency matching today, aktiv=true)
- Fields shown: gewohnheit_name, kategorie (as badge)
- Mobile style: Full-width cards with tap target
- Desktop style: Not shown separately (integrated into right panel)
- Sort: Incomplete first, then completed
- Limit: All active habits for today

**Letzte Einträge (Recent Activity)**
- Purpose: Activity feed showing progress over time
- Source: Tracking-Einträge (joined with Gewohnheiten for names)
- Fields shown: Habit name (from linked Gewohnheit), status (as badge), datum_uhrzeit (relative time), bewertung (optional stars)
- Mobile style: Compact list cards
- Desktop style: Table with columns
- Sort: By datum_uhrzeit descending (newest first)
- Limit: 5 on mobile, 10 on desktop

**Meine Gewohnheiten (Desktop right panel)**
- Purpose: Full habit management
- Source: Gewohnheiten
- Fields shown: gewohnheit_name, kategorie (badge), ziel_haeufigkeit, aktiv (toggle)
- Mobile style: Full-page view (navigate from menu)
- Desktop style: Card list in right panel with hover actions
- Sort: By gewohnheit_name alphabetically
- Limit: All

### Primary Action Button (REQUIRED!)

- **Label:** "Tracking eintragen" (mobile) / "+ Tracking eintragen" (desktop header)
- **Action:** add_record
- **Target app:** Tracking-Einträge
- **What data:**
  - gewohnheit: Select from active Gewohnheiten (applookup)
  - datum_uhrzeit: Date-time picker, defaults to now
  - status: Radio buttons (Erledigt / Teilweise erledigt / Übersprungen)
  - bewertung: Optional star rating 1-5
  - notizen: Optional textarea
- **Mobile position:** bottom_fixed (sticky bottom button)
- **Desktop position:** header (top right)
- **Why this action:** Logging habit completion is THE core action users perform multiple times daily. It must be one tap away.

### CRUD Operations Per App (REQUIRED!)

**Gewohnheiten CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Neue Gewohnheit" button in Gewohnheiten section (desktop right panel) or from hamburger menu (mobile)
  - **Form fields:**
    - gewohnheit_name (text input, required)
    - beschreibung (textarea, optional)
    - kategorie (select from lookup_data: Gesundheit, Fitness, Ernährung, Produktivität, Persönliche Entwicklung, Soziales, Finanzen, Sonstiges)
    - ziel_haeufigkeit (select: Täglich, Mehrmals pro Woche, Wöchentlich, Monatlich)
    - startdatum (date picker, defaults to today)
    - aktiv (checkbox, defaults to true)
  - **Form style:** Dialog/Modal
  - **Required fields:** gewohnheit_name, ziel_haeufigkeit
  - **Default values:** startdatum = today, aktiv = true

- **Read (Anzeigen):**
  - **List view:** Card list in desktop right panel, full list view on mobile
  - **Detail view:** Click habit → Dialog showing all fields
  - **Fields shown in list:** gewohnheit_name, kategorie (badge), ziel_haeufigkeit
  - **Fields shown in detail:** All fields including beschreibung, startdatum
  - **Sort:** Alphabetically by name
  - **Filter/Search:** Filter by kategorie dropdown, search by name

- **Update (Bearbeiten):**
  - **Trigger:** Click edit icon (pencil) on hover (desktop) or swipe/long-press (mobile)
  - **Edit style:** Same dialog as Create, pre-filled with current values
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Click delete icon (trash) on hover (desktop) or swipe left (mobile)
  - **Confirmation:** Required - AlertDialog
  - **Confirmation text:** "Möchtest du die Gewohnheit '{gewohnheit_name}' wirklich löschen? Alle zugehörigen Tracking-Einträge bleiben erhalten."

**Tracking-Einträge CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** Primary action button "Tracking eintragen" (bottom fixed on mobile, header on desktop)
  - **Form fields:**
    - gewohnheit (select from active Gewohnheiten, required) - applookup
    - datum_uhrzeit (datetime picker, defaults to now)
    - status (radio: Erledigt, Teilweise erledigt, Übersprungen)
    - bewertung (star rating 1-5, optional)
    - notizen (textarea, optional)
  - **Form style:** Dialog/Modal
  - **Required fields:** gewohnheit, datum_uhrzeit, status
  - **Default values:** datum_uhrzeit = now, status = "erledigt"

- **Read (Anzeigen):**
  - **List view:** Recent entries list (mobile) / Table (desktop)
  - **Detail view:** Click entry → Dialog showing all fields + linked habit name
  - **Fields shown in list:** Habit name (resolved from applookup), status (badge), datum_uhrzeit (relative), bewertung (stars if present)
  - **Fields shown in detail:** All fields
  - **Sort:** By datum_uhrzeit descending
  - **Filter/Search:** Filter by status, filter by date range

- **Update (Bearbeiten):**
  - **Trigger:** Click entry → Detail dialog → Edit button / or edit icon on hover
  - **Edit style:** Same dialog as Create, pre-filled
  - **Editable fields:** All except gewohnheit (locked after creation)

- **Delete (Löschen):**
  - **Trigger:** Delete icon in detail view or swipe left
  - **Confirmation:** Required - AlertDialog
  - **Confirmation text:** "Möchtest du diesen Tracking-Eintrag vom {datum_uhrzeit} wirklich löschen?"

**Täglicher Check-in CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "Check-in starten" button (secondary action, available from menu or as option)
  - **Form fields:**
    - checkin_datum (date picker, defaults to today)
    - erledigte_gewohnheiten (multi-select checkboxes of active habits)
    - tagesnotizen (textarea, optional)
  - **Form style:** Full-page or large dialog (to show all habits as checklist)
  - **Required fields:** checkin_datum
  - **Default values:** checkin_datum = today

- **Read (Anzeigen):**
  - **List view:** Calendar view or list by date (accessible from menu)
  - **Detail view:** Click date → Shows which habits were checked, notes
  - **Fields shown in list:** checkin_datum, count of erledigte_gewohnheiten
  - **Fields shown in detail:** All fields, habits shown as checklist
  - **Sort:** By checkin_datum descending
  - **Filter/Search:** Date range picker

- **Update (Bearbeiten):**
  - **Trigger:** Click check-in entry → Edit button
  - **Edit style:** Same as Create, pre-filled
  - **Editable fields:** All fields

- **Delete (Löschen):**
  - **Trigger:** Delete icon in detail view
  - **Confirmation:** Required - AlertDialog
  - **Confirmation text:** "Möchtest du den Check-in vom {checkin_datum} wirklich löschen?"

---

## 7. Visual Details

### Border Radius
Rounded (8px) - `--radius: 0.5rem` - friendly and modern without being too playful

### Shadows
Subtle - Cards use `shadow-sm` (small shadow) for gentle depth. On hover, cards elevate to `shadow-md`.

### Spacing
Normal - 16px base unit. Cards have 16px padding, 24px gaps between major sections.

### Animations
- **Page load:** Fade in with slight upward movement (200ms ease-out)
- **Hover effects:** Cards lift slightly (translateY -2px) with shadow increase
- **Tap feedback:** Scale down briefly (0.98) on touch
- **Progress ring:** Animates smoothly when percentage changes (CSS transition 500ms)
- **100% celebration:** Ring pulses once with scale animation when hitting 100%

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --radius: 0.5rem;
  --background: hsl(40 30% 97%);
  --foreground: hsl(200 15% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(200 15% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(200 15% 15%);
  --primary: hsl(174 62% 35%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 20% 94%);
  --secondary-foreground: hsl(200 15% 25%);
  --muted: hsl(40 20% 94%);
  --muted-foreground: hsl(200 10% 45%);
  --accent: hsl(174 62% 35%);
  --accent-foreground: hsl(0 0% 100%);
  --destructive: hsl(0 70% 55%);
  --border: hsl(40 20% 88%);
  --input: hsl(40 20% 88%);
  --ring: hsl(174 62% 35%);
  --chart-1: hsl(174 62% 35%);
  --chart-2: hsl(152 60% 40%);
  --chart-3: hsl(40 60% 55%);
  --chart-4: hsl(200 15% 65%);
  --chart-5: hsl(0 70% 55%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Space Grotesk)
- [ ] Font-family set to 'Space Grotesk', sans-serif
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4
- [ ] Desktop layout matches Section 5
- [ ] Hero element (progress ring) is prominent as described
- [ ] Colors create the warm, encouraging mood described in Section 2
- [ ] CRUD patterns are consistent across all three apps
- [ ] Delete confirmations are in place for all delete operations
- [ ] Primary action button is fixed at bottom on mobile
- [ ] Tracking-Einträge form uses applookup for gewohnheit field
- [ ] Dates formatted correctly for API (YYYY-MM-DDTHH:MM for datetimeminute)
- [ ] extractRecordId used for all applookup field handling
