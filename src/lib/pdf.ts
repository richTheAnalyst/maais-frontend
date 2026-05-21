import api from './api';

export async function downloadReportCard(studentId: string, termId: string, studentName: string) {
  // Generate the report card first (or get existing)
  const res = await api.post('/reports/report-cards/generate', { studentId, termId });
  const { reportCard } = res.data;

  // Build a printable HTML and trigger browser print/save
  const grades = res.data.grades ?? [];
  const student = res.data.student;
  const term = reportCard.term;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Card - ${studentName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #0f172a; background: white; }
        .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #064e3b; padding-bottom: 20px; }
        .school-name { font-size: 22px; font-weight: 900; color: #064e3b; text-transform: uppercase; letter-spacing: 0.15em; }
        .report-title { font-size: 14px; font-weight: 700; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; }
        .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; background: #f8fafc; padding: 20px; border-radius: 12px; }
        .info-item label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; display: block; margin-bottom: 2px; }
        .info-item span { font-size: 14px; font-weight: 700; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
        th { background: #0f172a; color: white; padding: 10px 16px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; }
        td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .grade { font-weight: 900; font-style: italic; font-size: 14px; }
        .grade-a { color: #059669; } .grade-b { color: #2563eb; } .grade-c { color: #d97706; } .grade-f { color: #dc2626; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .summary-card { background: #f8fafc; padding: 16px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; }
        .summary-card .value { font-size: 28px; font-weight: 900; color: #0f172a; font-style: italic; }
        .summary-card .label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-top: 4px; }
        .footer { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .signature-line { border-top: 1px solid #0f172a; padding-top: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
        .qr-section { text-align: center; padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
        .qr-section p { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px; }
        .hash { font-size: 9px; font-family: monospace; color: #94a3b8; word-break: break-all; margin-top: 4px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">Mando Senior High Technical School</div>
        <div class="report-title">
          Terminal Report Card — ${term?.academicYear?.label ?? ''} · ${term?.termNumber?.replace('_', ' ') ?? ''}
        </div>
      </div>

      <div class="student-info">
        <div class="info-item">
          <label>Student Name</label>
          <span>${student?.firstName ?? ''} ${student?.lastName ?? ''}</span>
        </div>
        <div class="info-item">
          <label>Index Number</label>
          <span>${student?.indexNumber ?? ''}</span>
        </div>
        <div class="info-item">
          <label>Class</label>
          <span>${student?.currentClass?.level?.replace('FORM_', 'Form ') ?? ''} ${student?.currentClass?.name ?? ''}</span>
        </div>
        <div class="info-item">
          <label>Academic Year</label>
          <span>${term?.academicYear?.label ?? ''}</span>
        </div>
      </div>

      <div class="summary">
        <div class="summary-card">
          <div class="value">${reportCard.averageScore?.toFixed(1) ?? '—'}%</div>
          <div class="label">Average Score</div>
        </div>
        <div class="summary-card">
          <div class="value">${reportCard.classPosition ?? '—'}</div>
          <div class="label">Class Position</div>
        </div>
        <div class="summary-card">
          <div class="value">${reportCard.classSize ?? '—'}</div>
          <div class="label">Class Size</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th style="text-align:center">Class Score (30)</th>
            <th style="text-align:center">Exam Score (70)</th>
            <th style="text-align:center">Total</th>
            <th style="text-align:center">Grade</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          ${grades.map((g: any) => {
            const gradeClass = g.grade?.startsWith('A') ? 'grade-a' :
                               g.grade?.startsWith('B') ? 'grade-b' :
                               g.grade?.startsWith('C') ? 'grade-c' : 'grade-f';
            return `
            <tr>
              <td><strong>${g.subject?.name ?? '—'}</strong></td>
              <td style="text-align:center">${g.classScore ?? '—'}</td>
              <td style="text-align:center">${g.examScore ?? '—'}</td>
              <td style="text-align:center"><strong>${g.totalScore?.toFixed(1) ?? '—'}</strong></td>
              <td style="text-align:center"><span class="grade ${gradeClass}">${g.grade ?? '—'}</span></td>
              <td style="font-style:italic;color:#64748b;font-size:11px">${g.remark ?? '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        <div>
          <div class="signature-line">Class Teacher's Signature</div>
          <div style="margin-top:32px" class="signature-line">Headmaster's Signature</div>
        </div>
        <div class="qr-section">
          <p>Document Verification</p>
          <div class="hash">${reportCard.systemHash ?? ''}</div>
          <p style="margin-top:8px">Scan QR on printed copy to verify authenticity</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open in new window and trigger print (saves as PDF)
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}