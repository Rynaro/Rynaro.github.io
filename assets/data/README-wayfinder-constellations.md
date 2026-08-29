# Wayfinder constellation catalog

This bundled catalog contains 18 simplified constellation figures: seven northern, four equatorial, and seven southern. Every star belongs to exactly one figure and every member participates in that figure's line topology. The line segments are an original, deliberately sparse visual interpretation; they are not IAU boundaries.

## Astrometric source and extraction

`hip`, J2000 right ascension/declination, and Johnson V magnitude come from the **Hipparcos Main Catalogue** (ESA 1997), NASA HEASARC table `hipparcos`, which HEASARC documents as derived from CDS catalog I/239 `hip_main.dat`. The selected records were retrieved on 2026-08-29 through `https://heasarc.gsfc.nasa.gov/xamin/vo/tap/sync` with the ADQL projection `SELECT hip_number,ra,dec,vmag FROM hipparcos WHERE hip_number IN (...)`.

The raw VOTable response used for transcription had SHA-256 `c0b7943a53957fa6ba14b350a18b2489c005dedab8cecfd1bb1dd0d2008d7be9`. Values in the shipped JSON are rounded to four decimal places for coordinates and two for V magnitude. Field definitions and catalog provenance are documented by [NASA HEASARC](https://heasarc.gsfc.nasa.gov/w3browse/star-catalog/hipparcos.html) and the [ESA Hipparcos catalogue guide](https://www.cosmos.esa.int/web/hipparcos/catalogues).

Figure members are normally V ≤ 3.50, with no more than one topology-essential member per figure through V = 4.00. The sole set-wide exception is **Epsilon Piscis Austrini, HIP 111954, V = 4.18**: Piscis Austrinus has no second member at V ≤ 4.00, so it is retained to make a real two-star figure rather than inventing a point or misassigning a neighboring star.

`labelPriority` is a three-tier editorial rank: `1` for landmark figures, `2` for the supporting sky, and `3` for lower-priority labels. Geometry and visibility still determine whether any ranked label can be placed safely.

## Rendering scope

The browser derives sidereal time from current UTC and projects the selected J2000 equatorial coordinates for the active observer. Desktop renders all eligible members, up to seven collision-checked labels, and a faint algorithmic Milky Way great-circle wash. Tablet keeps all figures but limits members to V ≤ 3.50, uses up to four labels, and reduces the wash. Compact charts rank at most six visible figures, cap the visible selection at 28 stars with V ≤ 2.75, omit labels, and keep only a faint wash. Stars and lines fade toward the geometric horizon.

The chart omits precession, nutation, refraction, proper motion, planets, the Moon, weather, and obstruction data; it is decorative rather than an observing instrument. No network astronomy or location service runs in the visitor's browser. The default observer is São Paulo (`-23.5505, -46.6333`); geolocation is requested only after **Use my location** is pressed, remains in memory for the page session, and is neither stored nor transmitted by site code.
