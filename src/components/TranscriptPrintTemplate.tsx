import React from 'react';
import { QrCode, ShieldCheck, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';

// ─── Types matching your real backend schema ──────────────────────────────────

interface GradeEntry {
  id: string;
  subjectId: string;
  subject: { name: string; code: string; type: string };
  termId: string;
  term: { termNumber: string; academicYear: { label: string } };
  classScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remark: string;
}

interface ReportCard {
  id: string;
  averageScore: number;
  classPosition: number;
  classSize: number;
  termId: string;
  systemHash?: string;
  term: { termNumber: string; academicYear: { label: string } };
}

interface StudentProfile {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  dateOfBirth?: string;
  currentClass?: { name: string; level: string };
  department?: { name: string };
  grades: GradeEntry[];
  reportCards: ReportCard[];
  promotions?: {
    id: string;
    fromClass: string;
    toClass?: string;
    status: string;
    academicYear?: { label: string };
  }[];
}

interface Props {
  data: StudentProfile | null;
  verifyUrl?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function termLabel(termNumber: string, yearLabel: string) {
  return `${yearLabel} · Term ${termNumber.replace('TERM_', '')}`;
}

function gradeColor(grade: string) {
  if (grade?.startsWith('A')) return '#065F46';
  if (grade?.startsWith('B')) return '#1d4ed8';
  if (grade?.startsWith('C')) return '#92400e';
  return '#991b1b';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TranscriptPrintTemplate = React.forwardRef<HTMLDivElement, Props>(
  ({ data, verifyUrl }, ref) => {
    if (!data) return null;

    // Sort report cards chronologically
    const sortedRCs = [...(data.reportCards ?? [])].sort((a, b) =>
      a.term.academicYear.label.localeCompare(b.term.academicYear.label)
    );

    // Group grades by termId for easy lookup
    const gradesByTerm = new Map<string, GradeEntry[]>();
    data.grades?.forEach(g => {
      if (!gradesByTerm.has(g.termId)) gradesByTerm.set(g.termId, []);
      gradesByTerm.get(g.termId)!.push(g);
    });

    // Cumulative average across all graded entries
    const scoredGrades = data.grades?.filter(g => g.totalScore != null) ?? [];
    const cumulativeAvg = scoredGrades.length
      ? scoredGrades.reduce((sum, g) => sum + g.totalScore, 0) / scoredGrades.length
      : null;

    // Earliest and latest academic year
    const firstTerm = sortedRCs[0];
    const lastTerm = sortedRCs[sortedRCs.length - 1];

    const fullName = [data.firstName, data.middleName, data.lastName]
      .filter(Boolean)
      .join(' ')
      .toUpperCase();

    const generatedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    return (
      <div
        ref={ref}
        id="transcript-template"
        style={{ fontFamily: 'Georgia, serif' }}
        className="bg-white text-slate-900 min-h-screen w-[210mm] fixed -left-[9999px] top-0 print:static print:block"
      >
        <div className="p-12">

          {/* ── HEADER ── */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0">
                <GraduationCap size={44} />
              </div>
              <div>
                <h1
                  style={{ fontFamily: 'Georgia, serif' }}
                  className="text-3xl font-black uppercase tracking-tighter leading-none"
                >
                  Mando Senior High Technical School
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-widest mt-2 text-slate-500">
                  Official Academic Transcript & Statement of Results
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">
                  PMB 14, Central Region, Ghana · audit.mando-shts.edu.gh
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-6">
              <div className="bg-slate-100 p-3 rounded-xl inline-block mb-2 border border-slate-200">
                <QrCode size={36} className="text-slate-900" />
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">
                Scan to Verify
              </p>
              {verifyUrl && (
                <p className="text-[8px] font-mono text-slate-300 mt-1 max-w-[80px] break-all">
                  {verifyUrl}
                </p>
              )}
            </div>
          </div>

          {/* ── BIO ── */}
          <div className="grid grid-cols-2 gap-10 mb-10">
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: fullName },
                { label: 'Index Number', value: data.indexNumber, mono: true },
                {
                  label: 'Programme',
                  value: data.department?.name
                    ? `${data.department.name} Dept.`
                    : data.currentClass?.level?.replace('FORM_', 'Form ') ?? '—',
                },
                {
                  label: 'Current Class',
                  value: data.currentClass
                    ? `${data.currentClass.level.replace('FORM_', 'Form ')} ${data.currentClass.name}`
                    : '—',
                },
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {item.label}
                  </span>
                  <span className={cn('text-sm font-black uppercase', item.mono && 'font-mono')}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                {
                  label: 'Enrollment Period',
                  value: firstTerm
                    ? `${firstTerm.term.academicYear.label} – ${lastTerm?.term.academicYear.label ?? 'Present'}`
                    : '—',
                },
                {
                  label: 'Terms on Record',
                  value: `${sortedRCs.length} of 9`,
                },
                {
                  label: 'Cumulative Average',
                  value: cumulativeAvg != null ? `${cumulativeAvg.toFixed(1)}%` : '—',
                },
                {
                  label: 'Document Status',
                  value: 'Official / Verified',
                  green: true,
                },
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {item.label}
                  </span>
                  <span className={cn(
                    'text-sm font-black uppercase',
                    (item as any).green && 'text-emerald-600'
                  )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── ACADEMIC HISTORY ── */}
          <div className="space-y-8 mb-12">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center gap-3">
              <ShieldCheck size={16} />
              <h2 className="text-[11px] font-black uppercase tracking-widest">
                Academic Performance Record — All Terms
              </h2>
            </div>

            {sortedRCs.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-sm font-bold text-slate-400">No academic records on file</p>
              </div>
            ) : (
              sortedRCs.map((rc, tIdx) => {
                const termGrades = gradesByTerm.get(rc.termId) ?? [];
                const coreGrades = termGrades.filter(g => g.subject?.type === 'CORE');
                const electiveGrades = termGrades.filter(g => g.subject?.type === 'ELECTIVE');

                return (
                  <div key={rc.id} className="break-inside-avoid">
                    {/* Term header */}
                    <div className="bg-slate-50 px-5 py-3 border-l-4 border-slate-900 mb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest">
                          {termLabel(rc.term.termNumber, rc.term.academicYear.label)}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-600">
                          Average: {rc.averageScore?.toFixed(1)}%
                        </span>
                        {rc.classPosition > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 ml-4">
                            Position: {rc.classPosition}/{rc.classSize}
                          </span>
                        )}
                      </div>
                    </div>

                    {termGrades.length === 0 ? (
                      <p className="text-xs text-slate-400 italic pl-4 pb-4">
                        No grade entries recorded for this term
                      </p>
                    ) : (
                      <table className="w-full text-left border-collapse mb-2">
                        <thead>
                          <tr className="border-b-2 border-slate-200">
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Subject
                            </th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                              Type
                            </th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                              Class
                            </th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                              Exam
                            </th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                              Total
                            </th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                              Grade
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {termGrades.map((g, sIdx) => (
                            <tr
                              key={g.id}
                              className={cn('border-b border-slate-50', sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')}
                            >
                              <td className="py-2.5 text-[11px] font-bold uppercase pr-4">
                                {g.subject.name}
                              </td>
                              <td className="py-2.5 text-center">
                                <span className={cn(
                                  'text-[8px] font-black uppercase px-1.5 py-0.5 rounded',
                                  g.subject.type === 'CORE'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-indigo-50 text-indigo-700'
                                )}>
                                  {g.subject.type}
                                </span>
                              </td>
                              <td className="py-2.5 text-[11px] font-mono text-center text-slate-600">
                                {g.classScore?.toFixed(1) ?? '—'}
                              </td>
                              <td className="py-2.5 text-[11px] font-mono text-center text-slate-600">
                                {g.examScore?.toFixed(1) ?? '—'}
                              </td>
                              <td className="py-2.5 text-[12px] font-black text-center">
                                {g.totalScore?.toFixed(1) ?? '—'}%
                              </td>
                              <td className="py-2.5 text-right">
                                <span
                                  style={{ color: gradeColor(g.grade) }}
                                  className="text-[13px] font-black"
                                >
                                  {g.grade ?? '—'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-slate-200">
                            <td colSpan={4} className="py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              Term Average
                            </td>
                            <td className="py-2 text-[13px] font-black text-center">
                              {rc.averageScore?.toFixed(1)}%
                            </td>
                            <td className="py-2 text-[10px] font-black text-right text-slate-400">
                              Pos. {rc.classPosition}/{rc.classSize}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── PROMOTION HISTORY ── */}
          {(data.promotions?.length ?? 0) > 0 && (
            <div className="mt-10 mb-12 break-inside-avoid">
              <div className="bg-slate-50 px-5 py-3 border-l-4 border-slate-900 mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest">Promotion Record</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {data.promotions!.map((p, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {p.academicYear?.label}
                    </p>
                    <p className="text-[12px] font-black text-slate-900">
                      {p.fromClass?.replace('FORM_', 'Form ')} →{' '}
                      {p.toClass ? p.toClass.replace('FORM_', 'Form ') : 'Graduated'}
                    </p>
                    <span className={cn(
                      'text-[9px] font-black uppercase px-2 py-0.5 rounded mt-2 inline-block',
                      p.status === 'GRADUATED'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-emerald-50 text-emerald-700'
                    )}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SUMMARY ── */}
          <div className="mt-10 mb-16 grid grid-cols-4 gap-4 break-inside-avoid">
            {[
              { label: 'Cumulative Average', value: cumulativeAvg != null ? `${cumulativeAvg.toFixed(1)}%` : '—' },
              { label: 'Terms on Record', value: `${sortedRCs.length} / 9` },
              {
                label: 'Best Term',
                value: sortedRCs.length
                  ? `${Math.max(...sortedRCs.map(r => r.averageScore)).toFixed(1)}%`
                  : '—',
              },
              { label: 'Total Grade Entries', value: String(data.grades?.length ?? 0) },
            ].map((s, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4 text-center">
                <p className="text-[22px] font-black text-slate-900">{s.value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── FOOTER / AUTH ── */}
          <div className="pt-8 border-t-2 border-slate-200 flex justify-between items-end">
            <div className="max-w-sm">
              {data.reportCards?.[0]?.systemHash && (
                <div className="mb-3">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">
                    Document Hash
                  </p>
                  <p className="text-[8px] font-mono text-slate-400 break-all">
                    {data.reportCards[0].systemHash}
                  </p>
                </div>
              )}
              <p className="text-[9px] font-medium text-slate-400 leading-relaxed uppercase italic">
                Generated by the MAAIS Academic Audit Suite on {generatedDate}.
                Valid only when verified via the system QR portal.
                Alterations constitute academic fraud.
              </p>
            </div>
            <div className="flex gap-16">
              <div className="text-center w-48">
                <div className="h-px bg-slate-300 w-full mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Head of Department
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1">
                  {data.department?.name ?? 'Academic'} Dept.
                </p>
              </div>
              <div className="text-center w-48">
                <div className="h-px bg-slate-300 w-full mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Headmaster / Registrar
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-1">
                  Mando SHTS · {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

TranscriptPrintTemplate.displayName = 'TranscriptPrintTemplate';