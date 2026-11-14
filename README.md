# AgriTourism Philippines — Desktop App

Kotlin **Compose for Desktop** + **SQLite3** port of the original React/Electron app.
Same screens and flows: opening catalog, login/sign-up (Tourist / Farmer / Admin), dashboards,
farm tours & fruit-picking reservations, marketplace with stock limits, 4-step checkout,
delivery tracking, bookings (tickets, receipts, reschedule, cancel, delete, gate check-in,
guide assignment), farmer orders & produce catalog, farmer stories, notifications with
1-day attendance confirmation, and an admin SQL studio.

## Run

Requires JDK 17+.

```bash
./gradlew run                 # launch the app
./gradlew packageDistributionForCurrentOS   # build an installer (msi/exe/dmg/deb)
```

## Data

- SQLite file: `~/.agritourism/agritourism.db` (override with `AGRITOURISM_DB=/path/file.db`).
- First launch seeds it from `src/main/resources/seed.json` (farmers, tours, orchards,
  products, bookings, orders, reviews, notifications, cart, favorites, users).
- Delete the `.db` file to reset to the original sample data.
- Admins can inspect/query tables in **View → SQL Database Studio**.

## Images

All bundled images live in `src/main/resources`:
`farmers/*.png` (farmer & user avatars), `fruit_picking/*.jpg` (orchard photos),
`icons/*.png` (window/app icons), `mockups/*` (design references — **View → Design Mockups Gallery**).
Remote Unsplash photos are cached in `~/.agritourism/image-cache`.

## Layout

```
src/main/kotlin/ph/agritourism/
  Main.kt               window + native menu bar (File/Catalog/View/Account)
  data/Database.kt      SQLite schema, seeding, DAO queries
  model/Models.kt       data classes
  ui/AppState.kt        app state + all actions (ported from App.tsx)
  ui/Shell.kt           header, sidebar dock, page router, notifications drawer, toast
  ui/screens/*          pages
  ui/dialogs/Overlays.kt modals (tour/fruit booking, tickets, receipts, dossiers…)
  util/Printing.kt      print / save-as / printable tickets & receipts
```
