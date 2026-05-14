# Golf Departure Expo Starter

A simple Expo app for Android and iOS that calculates departure times for golf course drives using drive times imported from a spreadsheet.

## Features

- sample course list
- import course data from CSV
- enter desired arrival time and buffer minutes
- compute recommended departure time

## Spreadsheet / CSV format

The app expects a CSV with these column headers:

- `Course Name`
- `Address`
- `DriveTimeMinutes`

Example:

```
Course Name,Address,DriveTimeMinutes
Pine Creek Golf Club,123 Main St,35
Valley Ridge Golf Course,456 Elm Ave,42
```

## Run locally

1. Open a terminal in this folder.
2. Install dependencies:

```bash
npm install
```

3. Start Expo:

```bash
npm start
```

4. Use an Android or iOS device / emulator to open the app.
