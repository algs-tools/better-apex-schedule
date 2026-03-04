/**
 * ALGS Year 6 Schedule - Main Application
 *
 * Features:
 * - Automatic timezone detection + manual override
 * - Schedule rendering grouped by local date
 * - Countdown timers for upcoming matches
 * - Region and event filters
 * - Dark/light theme with OS preference detection
 * - .ics calendar file generation
 */

(function () {
  'use strict';

  // --- State ---
  const state = {
    season: null,
    teams: {},
    schedules: [],
    activeRegion: 'all',
    activeEvent: 'all',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme: null,
  };

  const REGION_NAMES = {
    americas: 'Americas',
    emea: 'EMEA',
    'apac-north': 'APAC North',
    'apac-south': 'APAC South',
  };

  // --- Timezone ---

  function getCommonTimezones() {
    return [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu',
      'America/Sao_Paulo',
      'America/Mexico_City',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Moscow',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Bangkok',
      'Asia/Singapore',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Asia/Seoul',
      'Australia/Sydney',
      'Australia/Perth',
      'Pacific/Auckland',
      'UTC',
    ];
  }

  function initTimezone() {
    const saved = localStorage.getItem('algs-timezone');
    if (saved) {
      state.timezone = saved;
    }

    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById('detected-tz').textContent = detected;
    document.getElementById('footer-tz').textContent = state.timezone;

    const select = document.getElementById('timezone-select');
    const timezones = getCommonTimezones();

    // Ensure detected and saved timezones are in the list
    if (!timezones.includes(detected)) timezones.unshift(detected);
    if (saved && !timezones.includes(saved)) timezones.unshift(saved);

    timezones.forEach(function (tz) {
      const opt = document.createElement('option');
      opt.value = tz;
      opt.textContent = tz.replace(/_/g, ' ');
      if (tz === state.timezone) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', function () {
      state.timezone = this.value;
      localStorage.setItem('algs-timezone', this.value);
      document.getElementById('footer-tz').textContent = this.value;
      render();
    });
  }

  // --- Theme ---

  function initTheme() {
    const saved = localStorage.getItem('algs-theme');
    if (saved) {
      state.theme = saved;
      document.documentElement.setAttribute('data-theme', saved);
    }
    updateThemeIcon();

    document.getElementById('theme-toggle').addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const isDark =
        current === 'dark' ||
        (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('algs-theme', next);
      state.theme = next;
      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    var btn = document.getElementById('theme-toggle');
    var current = document.documentElement.getAttribute('data-theme');
    var isDark =
      current === 'dark' ||
      (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
    btn.querySelector('.theme-icon').textContent = isDark ? '\u263D' : '\u2600';
  }

  // --- Data Loading ---

  async function loadData() {
    showLoadingState();

    try {
      var results = await Promise.all([
        fetch('data/season.json').then(function (r) { return r.json(); }),
        fetch('data/teams/americas.json').then(function (r) { return r.json(); }),
        fetch('data/teams/emea.json').then(function (r) { return r.json(); }),
        fetch('data/teams/apac-north.json').then(function (r) { return r.json(); }),
        fetch('data/teams/apac-south.json').then(function (r) { return r.json(); }),
        fetch('data/schedule/split1-pro-league.json').then(function (r) { return r.json(); }),
        fetch('data/schedule/online-opens.json').then(function (r) { return r.json(); }),
      ]);

      state.season = results[0];
      state.teams.americas = results[1];
      state.teams.emea = results[2];
      state.teams['apac-north'] = results[3];
      state.teams['apac-south'] = results[4];

      // Merge all schedule matches
      state.schedules = [];
      for (var i = 5; i < results.length; i++) {
        if (results[i] && results[i].matches) {
          state.schedules = state.schedules.concat(results[i].matches);
        }
      }

      render();
    } catch (err) {
      console.error('Failed to load data:', err);
      document.getElementById('schedule-container').innerHTML =
        '<div class="empty-state">Failed to load schedule data. Try refreshing.</div>';
    }
  }

  function showLoadingState() {
    var container = document.getElementById('schedule-container');
    var html = '';
    for (var i = 0; i < 5; i++) {
      html += '<div class="skeleton"></div>';
    }
    container.innerHTML = html;
  }

  // --- Rendering ---

  function render() {
    renderTimeline();
    renderSchedule();
    renderTeams();
  }

  function renderTimeline() {
    var container = document.getElementById('event-timeline');
    if (!state.season) return;

    var now = new Date();
    var html = '';

    state.season.events.forEach(function (evt) {
      var start = new Date(evt.start_date + 'T00:00:00');
      var end = new Date(evt.end_date + 'T23:59:59');
      var isPast = end < now;
      var isCurrent = start <= now && end >= now;

      var typeClass = evt.type;
      var countdown = '';

      if (!isPast) {
        var diff = start - now;
        if (diff > 0) {
          var days = Math.floor(diff / 86400000);
          if (days > 0) {
            countdown = 'Starts in ' + days + ' day' + (days !== 1 ? 's' : '');
          } else {
            var hours = Math.floor(diff / 3600000);
            countdown = 'Starts in ' + hours + ' hour' + (hours !== 1 ? 's' : '');
          }
        } else if (isCurrent) {
          countdown = 'Happening now';
        }
      }

      html += '<div class="timeline-card' + (isCurrent ? ' current' : '') + '">';
      html += '<div class="event-type ' + typeClass + '">' + evt.type.replace('-', ' ') + '</div>';
      html += '<div class="event-name">' + escapeHtml(evt.name) + '</div>';
      html +=
        '<div class="event-dates">' +
        formatDateRange(evt.start_date, evt.end_date) +
        '</div>';
      if (evt.location) {
        html += '<div class="event-location">' + escapeHtml(evt.location);
        if (evt.venue) html += ' &middot; ' + escapeHtml(evt.venue);
        html += '</div>';
      }
      if (evt.prize_pool) {
        html += '<div class="event-prize">' + escapeHtml(evt.prize_pool) + '</div>';
      }
      if (countdown) {
        html += '<div class="event-countdown">' + countdown + '</div>';
      }
      html += '</div>';
    });

    container.innerHTML = html;
  }

  function renderSchedule() {
    var container = document.getElementById('schedule-container');
    var matches = getFilteredMatches();

    if (matches.length === 0) {
      container.innerHTML = '<div class="empty-state">No matches found for the selected filters.</div>';
      return;
    }

    // Convert to local dates and sort
    var matchesWithLocal = matches.map(function (m) {
      var utcDate = parseMatchUTC(m);
      return { match: m, utcDate: utcDate, localDate: utcDate };
    });

    matchesWithLocal.sort(function (a, b) {
      return a.utcDate - b.utcDate;
    });

    // Group by local date
    var groups = {};
    matchesWithLocal.forEach(function (item) {
      var key = formatLocalDate(item.utcDate);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    var now = new Date();
    var html = '';

    Object.keys(groups).forEach(function (dateKey) {
      html += '<div class="date-group">';
      html += '<div class="date-header">' + dateKey + '</div>';

      groups[dateKey].forEach(function (item) {
        var m = item.match;
        var localTime = formatLocalTime(item.utcDate);
        var regionClass = m.region;
        var regionName = REGION_NAMES[m.region] || m.region;
        var teamsStr = getTeamsForMatch(m);

        var countdown = '';
        if (m.status === 'upcoming') {
          var diff = item.utcDate - now;
          if (diff > 0) {
            var days = Math.floor(diff / 86400000);
            var hours = Math.floor((diff % 86400000) / 3600000);
            if (days > 0) {
              countdown = 'in ' + days + 'd ' + hours + 'h';
            } else if (hours > 0) {
              var mins = Math.floor((diff % 3600000) / 60000);
              countdown = 'in ' + hours + 'h ' + mins + 'm';
            } else {
              var mins2 = Math.floor(diff / 60000);
              countdown = 'in ' + mins2 + 'm';
            }
          }
        }

        html += '<div class="match-card">';
        html += '<div class="match-time">';
        html +=
          '<div class="time' + (m.time_confirmed ? '' : ' estimated') + '">' +
          localTime +
          '</div>';
        html +=
          '<div class="time-label">' +
          (m.time_confirmed ? 'Confirmed' : 'Estimated') +
          '</div>';
        html += '</div>';

        html += '<div class="match-info">';
        html += '<div class="match-description">' + escapeHtml(m.description) + '</div>';
        html +=
          '<div class="match-event">' +
          escapeHtml(formatEventName(m.event)) +
          (m.round ? ' &middot; Round ' + m.round : '') +
          '</div>';
        if (teamsStr) {
          html += '<div class="match-teams">' + escapeHtml(teamsStr) + '</div>';
        }
        html += '</div>';

        html += '<div class="match-meta">';
        html += '<span class="region-badge ' + regionClass + '">' + regionName + '</span>';
        html +=
          '<span class="status-badge ' +
          m.status +
          '">' +
          m.status +
          '</span>';
        if (countdown) {
          html += '<span class="match-countdown">' + countdown + '</span>';
        }
        html += '</div>';

        html += '</div>';
      });

      html += '</div>';
    });

    container.innerHTML = html;
  }

  function renderTeams() {
    var container = document.getElementById('teams-container');
    var regions =
      state.activeRegion === 'all'
        ? Object.keys(state.teams)
        : [state.activeRegion];

    var html = '';

    regions.forEach(function (regionKey) {
      var data = state.teams[regionKey];
      if (!data) return;

      html += '<div class="region-card">';
      html +=
        '<h3><span class="region-badge ' +
        regionKey +
        '">' +
        data.region_name +
        '</span></h3>';

      Object.keys(data.groups).forEach(function (groupName) {
        html += '<div class="group-section">';
        html += '<h4>Group ' + groupName + '</h4>';
        html += '<ul class="team-list">';

        data.groups[groupName].forEach(function (team) {
          html += '<li>';
          html += escapeHtml(team.name);
          html += ' <span class="team-tag">' + escapeHtml(team.tag) + '</span>';
          if (team.seed === 'qualifier') {
            html += ' <span class="team-qualifier">Q</span>';
          }
          html += '</li>';
        });

        html += '</ul>';
        html += '</div>';
      });

      html += '</div>';
    });

    container.innerHTML = html || '<div class="empty-state">No team data available.</div>';
  }

  // --- Filtering ---

  function getFilteredMatches() {
    return state.schedules.filter(function (m) {
      if (state.activeRegion !== 'all' && m.region !== state.activeRegion) return false;
      if (state.activeEvent !== 'all' && m.event !== state.activeEvent) return false;
      return true;
    });
  }

  function initFilters() {
    document.querySelectorAll('.filter-btn[data-region]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn[data-region]').forEach(function (b) {
          b.classList.remove('active');
        });
        this.classList.add('active');
        state.activeRegion = this.dataset.region;
        render();
      });
    });

    document.querySelectorAll('.filter-btn[data-event]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn[data-event]').forEach(function (b) {
          b.classList.remove('active');
        });
        this.classList.add('active');
        state.activeEvent = this.dataset.event;
        render();
      });
    });
  }

  // --- Calendar (.ics) ---

  function initCalendar() {
    document.querySelectorAll('.cal-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var region = this.dataset.calRegion;
        downloadICS(region);
      });
    });
  }

  function downloadICS(region) {
    var matches = state.schedules.filter(function (m) {
      return region === 'all' || m.region === region;
    });

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ALGS Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:ALGS Year 6' + (region !== 'all' ? ' - ' + (REGION_NAMES[region] || region) : ''),
    ];

    matches.forEach(function (m) {
      var utc = parseMatchUTC(m);
      var endUtc = new Date(utc.getTime() + 4 * 3600000); // ~4 hour match series
      var regionName = REGION_NAMES[m.region] || m.region;

      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + m.id + '@algs-schedule');
      lines.push('DTSTART:' + toICSDate(utc));
      lines.push('DTEND:' + toICSDate(endUtc));
      lines.push('SUMMARY:ALGS ' + regionName + ' - ' + m.description);
      lines.push(
        'DESCRIPTION:' +
          formatEventName(m.event) +
          (m.round ? ' Round ' + m.round : '') +
          '\\n' +
          (m.time_confirmed ? 'Confirmed time' : 'Estimated time')
      );
      if (m.stream_url) {
        lines.push('URL:' + m.stream_url);
      }
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'algs-y6-' + region + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function toICSDate(date) {
    return (
      date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      'Z'
    );
  }

  // --- Helpers ---

  function parseMatchUTC(match) {
    if (match.time_utc) {
      var parts = match.time_utc.split(':');
      return new Date(match.date + 'T' + pad(parseInt(parts[0], 10)) + ':' + pad(parseInt(parts[1], 10)) + ':00Z');
    }
    return new Date(match.date + 'T12:00:00Z');
  }

  function formatLocalDate(utcDate) {
    return utcDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: state.timezone,
    });
  }

  function formatLocalTime(utcDate) {
    return utcDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: state.timezone,
      hour12: true,
    });
  }

  function formatDateRange(startStr, endStr) {
    var start = new Date(startStr + 'T00:00:00');
    var end = new Date(endStr + 'T00:00:00');

    var startFmt = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

    var sameMonth = start.getUTCMonth() === end.getUTCMonth();
    var endFmt = sameMonth
      ? end.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })
      : end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

    var year = end.getUTCFullYear();
    return startFmt + ' \u2013 ' + endFmt + ', ' + year;
  }

  function formatEventName(eventId) {
    var map = {
      'online-opens': 'Online Opens',
      'split1-pro-league': 'Split 1 Pro League',
      'split1-playoffs': 'Split 1 Playoffs',
      'split2-pro-league': 'Split 2 Pro League',
      'split2-playoffs': 'Split 2 Playoffs',
      'last-chance-qualifier': 'Last Chance Qualifier',
      championship: 'Championship',
    };
    return map[eventId] || eventId;
  }

  function getTeamsForMatch(match) {
    if (!match.groups || match.groups.length === 0) return '';
    var teamData = state.teams[match.region];
    if (!teamData) return '';

    var teams = [];
    match.groups.forEach(function (g) {
      if (teamData.groups[g]) {
        teamData.groups[g].forEach(function (t) {
          teams.push(t.tag);
        });
      }
    });

    if (teams.length === 0) return '';
    if (teams.length > 10) return teams.slice(0, 10).join(', ') + '...';
    return teams.join(', ');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  // --- Countdown Timer ---

  function startCountdownUpdates() {
    setInterval(function () {
      renderSchedule();
    }, 60000);
  }

  // --- Init ---

  function init() {
    initTheme();
    initTimezone();
    initFilters();
    initCalendar();
    loadData();
    startCountdownUpdates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
