import api from './api';

function gradeColor(grade: string): string {
  if (grade?.startsWith('A')) return '#059669';
  if (grade?.startsWith('B')) return '#2563eb';
  if (grade?.startsWith('C')) return '#d97706';
  return '#dc2626';
}

function gradeClass(grade: string): string {
  if (grade?.startsWith('A')) return 'grade-a';
  if (grade?.startsWith('B')) return 'grade-b';
  if (grade?.startsWith('C')) return 'grade-c';
  return 'grade-f';
}

export async function downloadReportCard(
  studentId: string,
  termId: string,
  studentName: string,
) {
  // Step 1: generate the report card
  const res = await api.post('/reports/report-cards/generate', {
    studentId,
    termId,
  });

  const { reportCard } = res.data;
  const grades: any[] = res.data.grades ?? [];
  const student = res.data.student;
  const term = reportCard?.term;

  // Step 2: also fetch the full student profile for richer data
  let fullProfile: any = null;
  try {
    const profileRes = await api.get(`/users/students/${studentId}`);
    fullProfile = profileRes.data;
  } catch {
    // non-fatal — fallback to what we have from the generate endpoint
  }

  const coreGrades = grades.filter(g => g.subject?.type === 'CORE');
  const electiveGrades = grades.filter(g => g.subject?.type === 'ELECTIVE');
  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Report Card — ${studentName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      padding: 48px;
      color: #0f172a;
      background: white;
      font-size: 13px;
      line-height: 1.5;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 4px solid #0f172a;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .header-left { display: flex; align-items: center; gap: 20px; }
    .school-logo {
      width: 72px; height: 72px;
      background: #0f172a;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 28px; font-weight: 900;
      flex-shrink: 0;
    }
    .school-name {
      font-size: 20px; font-weight: 900;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #0f172a; line-height: 1.1;
    }
    .report-subtitle {
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.12em;
      color: #64748b; margin-top: 6px;
    }
    .school-address {
      font-size: 10px; color: #94a3b8; margin-top: 4px;
    }
    .header-right { text-align: right; }
    .qr-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      display: inline-block;
    }
    .qr-placeholder {
      width: 52px; height: 52px;
      background: #e2e8f0;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #94a3b8;
    }
    .qr-label {
      font-size: 8px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #94a3b8; margin-top: 6px; text-align: center;
    }

    /* ── BIO ── */
    .bio-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 16px; margin-bottom: 28px;
      background: #f8fafc;
      padding: 20px; border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .bio-item label {
      font-size: 9px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.15em;
      color: #94a3b8; display: block; margin-bottom: 2px;
    }
    .bio-item span {
      font-size: 13px; font-weight: 700; color: #0f172a;
    }
    .bio-item .verified {
      font-size: 11px; font-weight: 800;
      color: #059669; text-transform: uppercase; letter-spacing: 0.1em;
    }

    /* ── SUMMARY CARDS ── */
    .summary-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 14px; margin-bottom: 28px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .summary-card .val {
      font-size: 30px; font-weight: 900;
      color: #0f172a; font-style: italic;
      line-height: 1;
    }
    .summary-card .lbl {
      font-size: 9px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.12em;
      color: #94a3b8; margin-top: 4px;
    }

    /* ── SECTION HEADER ── */
    .section-header {
      display: flex; align-items: center; gap: 12px;
      background: #0f172a; color: white;
      padding: 10px 18px; border-radius: 10px;
      margin-bottom: 16px;
    }
    .section-header h2 {
      font-size: 11px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.15em;
    }

    /* ── TABLE ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    thead tr th {
      background: #1e293b; color: white;
      padding: 10px 14px;
      font-size: 9px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.12em;
    }
    .type-badge {
      display: inline-block;
      font-size: 8px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      padding: 1px 5px; border-radius: 4px; margin-top: 2px;
    }
    .type-core { background: #d1fae5; color: #065f46; }
    .type-elective { background: #e0e7ff; color: #3730a3; }
    tbody tr td {
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
    }
    tbody tr:nth-child(even) td { background: #f8fafc; }
    .grade-val {
      font-weight: 900; font-style: italic; font-size: 14px;
    }
    .grade-a { color: #059669; }
    .grade-b { color: #2563eb; }
    .grade-c { color: #d97706; }
    .grade-f { color: #dc2626; }
    tfoot tr td {
      background: #f1f5f9;
      font-weight: 800; font-size: 12px;
      padding: 10px 14px;
      border-top: 2px solid #cbd5e1;
    }

    /* ── OBSERVATIONS ── */
    .obs-list { margin-bottom: 28px; }
    .obs-item {
      border-left: 4px solid #f59e0b;
      background: #fffbeb;
      padding: 10px 14px;
      margin-bottom: 8px;
      border-radius: 0 8px 8px 0;
    }
    .obs-meta {
      font-size: 9px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #92400e; margin-bottom: 4px;
    }
    .obs-text {
      font-size: 11px; font-weight: 600;
      color: #44403c; font-style: italic;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 32px;
    }
    .footer-disclaimer {
      font-size: 9px; font-weight: 500;
      color: #94a3b8; line-height: 1.6;
      font-style: italic; max-width: 320px;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .signatures {
      display: flex; gap: 48px;
    }
    .sig-block { text-align: center; min-width: 140px; }
    .sig-line {
      border-top: 1px solid #0f172a;
      padding-top: 6px;
      font-size: 9px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #64748b;
    }
    .sig-sub {
      font-size: 9px; color: #94a3b8; margin-top: 2px;
    }
    .hash-box {
      margin-top: 16px;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .hash-label {
      font-size: 8px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.1em;
      color: #94a3b8; margin-bottom: 3px;
    }
    .hash-val {
      font-size: 8px; font-family: monospace;
      color: #64748b; word-break: break-all;
    }

    @media print {
      body { padding: 24px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <div class="school-logo">M</div>
      <div>
        <div class="school-name">Mando Senior High Technical School</div>
        <div class="report-subtitle">Official Terminal Report Card</div>
        <div class="school-address">PMB 14, Central Region, Ghana &middot; audit.mando-shts.edu.gh</div>
      </div>
    </div>
    <div class="header-right">
      <div class="qr-box">
        <div class="qr-placeholder">QR</div>
        <div class="qr-label">Scan to Verify</div>
      </div>
    </div>
  </div>

  <!-- BIO -->
  <div class="bio-grid">
    <div class="bio-item">
      <label>Student Name</label>
      <span>${(student?.firstName ?? '') + ' ' + (student?.lastName ?? '')}</span>
    </div>
    <div class="bio-item">
      <label>Index Number</label>
      <span>${student?.indexNumber ?? '—'}</span>
    </div>
    <div class="bio-item">
      <label>Class</label>
      <span>${(student?.currentClass?.level?.replace('FORM_', 'Form ') ?? '') + ' ' + (student?.currentClass?.name ?? '')}</span>
    </div>
    <div class="bio-item">
      <label>Academic Year &amp; Term</label>
      <span>${term?.academicYear?.label ?? '—'} &middot; Term ${term?.termNumber?.replace('TERM_', '') ?? '—'}</span>
    </div>
    <div class="bio-item">
      <label>Department</label>
      <span>${student?.department?.name ?? fullProfile?.department?.name ?? '—'}</span>
    </div>
    <div class="bio-item">
      <label>Document Status</label>
      <span class="verified">&#10003; Official / Verified</span>
    </div>
  </div>

  <!-- SUMMARY -->
  <div class="summary-row">
    <div class="summary-card">
      <div class="val">${reportCard?.averageScore?.toFixed(1) ?? '—'}%</div>
      <div class="lbl">Average Score</div>
    </div>
    <div class="summary-card">
      <div class="val">${reportCard?.classPosition ?? '—'}</div>
      <div class="lbl">Class Position</div>
    </div>
    <div class="summary-card">
      <div class="val">${reportCard?.classSize ?? '—'}</div>
      <div class="lbl">Class Size</div>
    </div>
  </div>

  <!-- GRADES TABLE -->
  <div class="section-header">
    <h2>Academic Performance — Subject Breakdown</h2>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Subject</th>
        <th style="text-align:center">Type</th>
        <th style="text-align:center">Class (30)</th>
        <th style="text-align:center">Exam (70)</th>
        <th style="text-align:center">Total</th>
        <th style="text-align:center">Grade</th>
        <th style="text-align:left">Remark</th>
      </tr>
    </thead>
    <tbody>
      ${grades.map((g: any) => `
        <tr>
          <td><strong>${g.subject?.name ?? '—'}</strong></td>
          <td style="text-align:center">
            <span class="type-badge ${g.subject?.type === 'CORE' ? 'type-core' : 'type-elective'}">
              ${g.subject?.type ?? '—'}
            </span>
          </td>
          <td style="text-align:center">${g.classScore?.toFixed(1) ?? '—'}</td>
          <td style="text-align:center">${g.examScore?.toFixed(1) ?? '—'}</td>
          <td style="text-align:center"><strong>${g.totalScore?.toFixed(1) ?? '—'}</strong></td>
          <td style="text-align:center">
            <span class="grade-val ${gradeClass(g.grade ?? '')}">
              ${g.grade ?? '—'}
            </span>
          </td>
          <td style="font-style:italic;color:#64748b;font-size:11px">${g.remark ?? '—'}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4">Term Average</td>
        <td style="text-align:center;font-style:italic;font-size:15px">
          ${reportCard?.averageScore?.toFixed(1) ?? '—'}%
        </td>
        <td colspan="2" style="color:#64748b;font-size:11px">
          Position ${reportCard?.classPosition ?? '—'} of ${reportCard?.classSize ?? '—'}
        </td>
      </tr>
    </tfoot>
  </table>

  <!-- OBSERVATIONS (if any) -->
  ${grades.some((g: any) => g.hasObservation && g.observationText) ? `
    <div class="section-header" style="background:#78350f">
      <h2>Teacher Observations</h2>
    </div>
    <div class="obs-list">
      ${grades
        .filter((g: any) => g.hasObservation && g.observationText)
        .map((g: any) => `
          <div class="obs-item">
            <div class="obs-meta">${g.subject?.name ?? '—'}</div>
            <div class="obs-text">"${g.observationText}"</div>
          </div>
        `).join('')}
    </div>
  ` : ''}

  <!-- HASH -->
  ${reportCard?.systemHash ? `
    <div class="hash-box">
      <div class="hash-label">Document Verification Hash</div>
      <div class="hash-val">${reportCard.systemHash}</div>
    </div>
  ` : ''}

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-disclaimer">
      This document is generated by the MAAIS Academic Audit Suite.
      Valid only when verified via the system QR portal.
      Generated on ${generatedDate}.
      Alterations constitute academic fraud.
    </div>
    <div class="signatures">
      <div class="sig-block">
        <div style="height:36px"></div>
        <div class="sig-line">Class Teacher</div>
        <div class="sig-sub">Signature &amp; Date</div>
      </div>
      <div class="sig-block">
        <div style="height:36px"></div>
        <div class="sig-line">Headmaster</div>
        <div class="sig-sub">Mando SHTS · ${new Date().getFullYear()}</div>
      </div>
    </div>
  </div>

</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  }
}