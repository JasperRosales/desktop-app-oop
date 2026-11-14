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
./gradlew releaseArtifacts    # installer(s) + seeded database in build/release
```

## Releases

Every push to `main` runs `.github/workflows/windows-release.yml`, which tests the app,
builds the Windows installer plus the seeded database, and publishes a new GitHub release
with an automatically incremented `vX.Y.Z` tag. Bump the base `version` in
`build.gradle.kts` (for example to `1.2.0`) when you want a minor or major release;
otherwise the patch number is bumped automatically. Releases can also be triggered
manually from the **Actions** tab.

### Code signing

Windows SmartScreen warns about new unsigned executables ("isn't commonly downloaded").
Releases are set up to be signed for free through [SignPath Foundation](https://signpath.org/)
once the project is approved. Until `SIGNPATH_API_TOKEN` is configured, the workflow still
publishes unsigned builds together with SHA-256 checksums.

To enable signing:

1. Apply at <https://signpath.org/apply> and link this repository.
2. Install the [SignPath GitHub App](https://github.com/apps/signpath) for the repository.
3. In SignPath, create an **Open Source Code Signing** project with an artifact configuration
   named `installer` using [`.signpath/artifact-configuration.xml`](.signpath/artifact-configuration.xml).
4. Add the repository secret `SIGNPATH_API_TOKEN`.
5. Add repository variables `SIGNPATH_ORGANIZATION_ID`, `SIGNPATH_PROJECT_SLUG`, and
   `SIGNPATH_SIGNING_POLICY_SLUG`.

The workflow signs the installer, verifies the Authenticode signature, and only then publishes
the release. If Windows still shows a SmartScreen warning, check the SHA-256 hash against
`SHA256SUMS.txt` before choosing **More info → Run anyway**.

## Data

- SQLite file: `~/.agritourism/agritourism.db` (override with `AGRITOURISM_DB=/path/file.db`).
- First launch seeds it from `src/main/resources/seed.json` (farmers, tours, orchards,
  products, bookings, orders, reviews, notifications, cart, favorites, users).
- Delete the `.db` file to reset to the original sample data.
- Admins can inspect/query tables in **View → SQL Database Studio**.
- Release builds also attach a pre-seeded `agritourism.db` to the GitHub release. Point
  `AGRITOURISM_DB` at that file to run the app against it.

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

## License

MIT — see [LICENSE](LICENSE).
