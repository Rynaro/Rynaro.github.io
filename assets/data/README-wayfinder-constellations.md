# Wayfinder constellation catalog

This deliberately small J2000 catalog powers the Wayfinder's six constellation figures. It contains only stars used by a rendered figure; every figure explicitly lists its members so membership can be mechanically checked. Right ascension and declination are decimal degrees, and magnitudes are apparent visual magnitudes. Values were manually transcribed and rounded from the publicly available **Hipparcos Main Catalogue** (ESA 1997), as served by [NASA/ADC catalog I/239](https://heasarc.gsfc.nasa.gov/W3Browse/all/hipparcos.html). Line segments are an original, intentionally simplified selection rather than official boundaries.

The browser derives Greenwich mean sidereal time from current UTC and converts each member star's equatorial position to local altitude/azimuth. It draws only the parts of these constellation figures currently above the geometric horizon. This decorative chart omits precession, nutation, refraction, and proper motion; it is not an observing instrument.

No network astronomy or location service is used. The catalog ships with the site. The default observer is São Paulo (`-23.5505, -46.6333`); browser geolocation is requested only after **Use my location** is pressed. Coordinates remain in memory for the page session and are neither stored nor transmitted by this code.
