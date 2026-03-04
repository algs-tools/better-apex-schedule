# Better ALGS Schedule

A clean GitHub Pages site showing the ALGS Year 6 (2026-2027) schedule with **automatic timezone conversion**.

**Live site:** https://mattwwarren.github.io/better-apex-schedule/

## Why?

The official ALGS schedule on algs.ea.com is hard to use:
- No timezone conversion
- Schedule buried in complex navigation
- Group matchups shown without team names
- No at-a-glance season view

This site fixes all of that.

## Features

- **Automatic timezone detection** - shows times in your local timezone
- **Manual timezone override** - pick any timezone, persisted in localStorage
- **Estimated vs confirmed times** - estimated times shown in italic, confirmed in bold
- **Season overview** - all events at a glance with countdowns
- **Region filters** - Americas, EMEA, APAC North, APAC South
- **Event filters** - Online Opens, Pro League, Playoffs, Championship
- **Team rosters** - 30 teams per region, organized by group
- **Dark/light mode** - auto-detects OS preference, with manual toggle
- **Calendar export** - download .ics files per region for your calendar app
- **Mobile responsive** - works on phone, tablet, desktop
- **No build step** - vanilla HTML/CSS/JS, loads data from JSON files

## Data

Schedule and team data lives in `data/`:
- `data/season.json` - season structure and events
- `data/teams/` - team rosters per region
- `data/schedule/` - match schedules per event

Times are stored in UTC. The frontend converts to the user's local timezone.

## Updating Data

Use Claude Code skills to update data:

```bash
/update-schedule    # Pull latest schedule from Liquipedia
/add-split          # Add a new split's data
/update-results     # Pull completed match results
```

## Tech

- Vanilla HTML/CSS/JS (no framework, no build step)
- GitHub Pages hosting
- JSON data files loaded via `fetch()`
- `Intl.DateTimeFormat` for timezone conversion
- CSS custom properties for theming
- `.ics` generation for calendar integration

## Data Sources

- [Liquipedia ALGS](https://liquipedia.net/apexlegends/Apex_Legends_Global_Series) - teams, groups, results
- [algs.ea.com](https://algs.ea.com) - official dates and event structure
- Manual curation for estimated start times

Not affiliated with EA or Respawn Entertainment.
