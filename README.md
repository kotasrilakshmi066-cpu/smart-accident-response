# Smart Accident Response System — Final V2

## Run
First time:
`npm install`

Then:
`npm start`

Or in VS Code press F5 and choose **Smart Accident Response - Chrome**.

## Improvements
- Automatically detects browser GPS on page load.
- Hospitals are searched dynamically around the selected location using OpenStreetMap/Overpass, within 10 km by default.
- Demo emergency vehicles are positioned around the selected GPS location so the demo remains useful at any location.
- SOS immediately creates a critical report and finds the nearest emergency resources.
- Ambulance **Live Tracer** draws a route and animates the ambulance marker from its current demo position to the accident.
- Road route uses OSRM when available; a straight-line demo route is used as fallback.

This is a student-project simulation. It does not contact or dispatch real government emergency services.
