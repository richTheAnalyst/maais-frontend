import type { SchoolSettings } from '../views/Timetable';

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday', FRIDAY: 'Friday',
};

interface TimetableEntry {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  classSection: { id: string; name: string; level: string };
  subject: { id: string; name: string; code: string; type?: string; department?: { name: string } };
  teacher: { id: string; firstName: string; lastName: string };
}

interface PrintOptions {
  entries: TimetableEntry[];
  clashes: any[];
  settings: SchoolSettings | null;
  activeTerm: any | null;
  userName?: string;
  userRole?: string;
}

function isEntryClashing(entryId: string, clashes: any[], clashDetectionEnabled: boolean): boolean {
  if (!clashDetectionEnabled) return false;
  return clashes.some(c => c.a?.id === entryId || c.b?.id === entryId);
}

export function printTimetable({
  entries,
  clashes,
  settings,
  activeTerm,
  userName,
  userRole,
}: PrintOptions) {
  const byDay: Record<DayOfWeek, TimetableEntry[]> = {
    MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [], FRIDAY: [],
  };
  entries.forEach(e => {
    if (byDay[e.dayOfWeek]) byDay[e.dayOfWeek].push(e);
  });
  DAYS.forEach(day => byDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime)));

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const viewLabel = userRole === 'TEACHER'
    ? `${userName ?? 'Teacher'} — Personal Schedule`
    : 'School Timetable — All Classes';

  const clashDetection = settings?.clashDetectionEnabled ?? false;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Timetable — Mando SHTS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      padding: 32px;
      color: #0f172a;
      background: white;
      font-size: 12px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .school-name {
      font-size: 18px; font-weight: 900;
      text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a;
    }
    .doc-title {
      font-size: 12px; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;
    }
    .doc-meta { font-size: 10px; color: #94a3b8; margin-top: 3px; }
    .term-badge {
      display: inline-block; background: #0f172a; color: white;
      padding: 4px 12px; border-radius: 6px;
      font-size: 10px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
    }
    .generated { font-size: 9px; color: #94a3b8; margin-top: 6px; text-align: right; }

    .settings-notice {
      display: flex; gap: 10px; flex-wrap: wrap;
      margin-bottom: 20px; padding: 10px 14px;
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
      align-items: center;
    }
    .settings-notice span {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #64748b;
      padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;
    }
    .badge-on { background: #d1fae5; color: #065f46 !important; border-color: #a7f3d0 !important; }
    .badge-off { background: #f1f5f9; color: #94a3b8 !important; }
    .badge-warn { background: #fee2e2; color: #dc2626 !important; border-color: #fecdd3 !important; }

    .stats-row {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 10px; margin-bottom: 24px;
    }
    .stat-card {
      border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 12px; text-align: center;
    }
    .stat-val { font-size: 22px; font-weight: 900; color: #0f172a; }
    .stat-lbl {
      font-size: 9px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #94a3b8; margin-top: 2px;
    }

    .clash-summary {
      margin-bottom: 20px; padding: 12px 16px;
      background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px;
    }
    .clash-summary-title {
      font-size: 10px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #dc2626; margin-bottom: 8px;
    }
    .clash-item {
      font-size: 10px; color: #7f1d1d;
      padding: 3px 0; border-bottom: 1px solid #fecdd3;
    }
    .clash-item:last-child { border-bottom: none; }

    .day-section { margin-bottom: 24px; page-break-inside: avoid; }
    .day-header {
      display: flex; justify-content: space-between; align-items: center;
      background: #0f172a; color: white;
      padding: 8px 16px; border-radius: 8px 8px 0 0;
    }
    .day-name { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; }
    .day-count { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5); }

    table { width: 100%; border-collapse: collapse; }
    thead th {
      background: #f8fafc; padding: 8px 12px;
      font-size: 9px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #64748b; border-bottom: 1px solid #e2e8f0;
    }
    tbody td {
      padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;
    }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) td { background: #fafafa; }
    tr.clash-row td { background: #fff1f2 !important; }

    .clash-badge {
      display: inline-block; background: #fee2e2; color: #dc2626;
      font-size: 8px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.08em; padding: 1px 5px; border-radius: 4px; margin-left: 4px;
    }
    .type-core {
      display: inline-block; background: #d1fae5; color: #065f46;
      font-size: 8px; font-weight: 800; text-transform: uppercase;
      padding: 1px 5px; border-radius: 4px;
    }
    .type-elective {
      display: inline-block; background: #e0e7ff; color: #3730a3;
      font-size: 8px; font-weight: 800; text-transform: uppercase;
      padding: 1px 5px; border-radius: 4px;
    }

    .empty-day {
      padding: 16px; text-align: center;
      font-size: 11px; font-weight: 700; color: #94a3b8;
      font-style: italic; background: #fafafa;
      border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;
    }

    .footer {
      margin-top: 32px; padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-text { font-size: 9px; color: #94a3b8; font-style: italic; }

    @media print {
      body { padding: 18px; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="school-name">Mando Senior High Technical School</div>
      <div class="doc-title">${viewLabel}</div>
      <div class="doc-meta">PMB 14, Central Region, Ghana</div>
    </div>
    <div>
      ${activeTerm ? `
        <div class="term-badge">
          ${activeTerm.academicYear?.label ?? ''} · ${activeTerm.termNumber?.replace('TERM_', 'Term ') ?? ''}
        </div>
      ` : ''}
      <div class="generated">Generated: ${today}</div>
    </div>
  </div>

  <div class="settings-notice">
    <span class="${clashDetection ? 'badge-on' : 'badge-off'}">
      Clash Detection: ${clashDetection ? 'ON' : 'OFF'}
    </span>
    <span class="${settings?.departmentColorsEnabled ? 'badge-on' : 'badge-off'}">
      Dept Colors: ${settings?.departmentColorsEnabled ? 'ON' : 'OFF'}
    </span>
    <span>${entries.length} total sessions</span>
    ${clashes.length > 0 && clashDetection
      ? `<span class="badge-warn">⚠ ${clashes.length} clash${clashes.length > 1 ? 'es' : ''}</span>`
      : ''}
  </div>

  <div class="stats-row">
    ${DAYS.map(day => `
      <div class="stat-card">
        <div class="stat-val">${byDay[day].length}</div>
        <div class="stat-lbl">${DAY_LABELS[day]}</div>
      </div>
    `).join('')}
  </div>

  ${clashDetection && clashes.length > 0 ? `
    <div class="clash-summary">
      <div class="clash-summary-title">⚠ Scheduling Clashes Detected (${clashes.length})</div>
      ${clashes.map((c: any) => `
        <div class="clash-item">
          ${c.a?.dayOfWeek ?? ''} ${c.a?.startTime ?? ''}–${c.a?.endTime ?? ''} —
          <strong>${c.a?.subject?.name ?? ''}</strong> (${c.a?.classSection?.name ?? ''})
          conflicts with
          <strong>${c.b?.subject?.name ?? ''}</strong> (${c.b?.classSection?.name ?? ''})
          · ${c.a?.teacher?.firstName ?? ''} ${c.a?.teacher?.lastName ?? ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${DAYS.map(day => {
    const dayEntries = byDay[day];
    return `
      <div class="day-section">
        <div class="day-header">
          <span class="day-name">${DAY_LABELS[day]}</span>
          <span class="day-count">${dayEntries.length} session${dayEntries.length !== 1 ? 's' : ''}</span>
        </div>
        ${dayEntries.length === 0 ? `
          <div class="empty-day">No sessions scheduled</div>
        ` : `
          <table>
            <thead>
              <tr>
                <th style="width:80px">Time</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Teacher</th>
                <th style="width:70px">Room</th>
                <th style="width:60px">Type</th>
              </tr>
            </thead>
            <tbody>
              ${dayEntries.map(entry => {
                const clash = isEntryClashing(entry.id, clashes, clashDetection);
                return `
                  <tr class="${clash ? 'clash-row' : ''}">
                    <td>
                      <strong>${entry.startTime}</strong><br/>
                      <span style="color:#94a3b8;font-size:10px">${entry.endTime}</span>
                    </td>
                    <td>
                      <strong>${entry.subject?.name ?? '—'}</strong>
                      <span style="color:#94a3b8;font-size:10px;margin-left:4px">${entry.subject?.code ?? ''}</span>
                      ${clash ? '<span class="clash-badge">CLASH</span>' : ''}
                      ${entry.subject?.department?.name
                        ? `<br/><span style="color:#94a3b8;font-size:10px">${entry.subject.department.name}</span>`
                        : ''}
                    </td>
                    <td>
                      ${entry.classSection?.level?.replace('FORM_', 'Form ') ?? ''}
                      ${entry.classSection?.name ?? '—'}
                    </td>
                    <td>${entry.teacher?.firstName ?? ''} ${entry.teacher?.lastName ?? ''}</td>
                    <td style="color:${entry.room ? '#0f172a' : '#94a3b8'}">
                      ${entry.room ?? '—'}
                    </td>
                    <td>
                      <span class="${entry.subject?.type === 'CORE' ? 'type-core' : 'type-elective'}">
                        ${entry.subject?.type ?? '—'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  }).join('')}

  <div class="footer">
    <div class="footer-text">
      MAAIS Academic Audit Suite · Mando SHTS · ${today}
    </div>
    <div class="footer-text" style="text-align:right">
      ${entries.length} sessions across ${DAYS.filter(d => byDay[d].length > 0).length} active days
      ${clashes.length > 0 && clashDetection ? ` · ${clashes.length} clash${clashes.length > 1 ? 'es' : ''} flagged` : ''}
    </div>
  </div>

</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}