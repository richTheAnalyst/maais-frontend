import React from 'react';
import { QrCode, ShieldCheck, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';

interface TranscriptData {
  studentName: string;
  indexNumber: string;
  program: string;
  house: string;
  enrollmentDate: string;
  completionDate: string;
  academicHistory: {
    year: string;
    term: string;
    subjects: { name: string; grade: string; score: number }[];
  }[];
  wassceResults?: { subject: string; grade: string }[];
}

interface Props {
  data: TranscriptData | null;
}

export const TranscriptPrintTemplate = React.forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  if (!data) return null;

  return (
    <div 
      ref={ref}
      id="transcript-template"
      className="bg-white p-12 text-slate-900 font-serif min-h-screen w-[210mm] fixed -left-[9999px] top-0 print:static print:block shadow-2xl"
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <GraduationCap size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Mando Senior High Technical School</h1>
            <p className="text-xs font-bold uppercase tracking-widest mt-2 text-slate-500">Official Academic Transcript & Statement of Results</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1">PMB 14, Central Region, Ghana • audit.mando-shts.edu.gh</p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-slate-100 p-3 rounded-xl inline-block mb-3 border border-slate-200">
            <QrCode size={40} className="text-slate-900" />
          </div>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Scan to Verify Authenticity</p>
        </div>
      </div>

      {/* Bio Information */}
      <div className="grid grid-cols-2 gap-10 mb-12">
        <div className="space-y-4">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Name of Student</span>
            <span className="text-sm font-black uppercase">{data.studentName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Index Number</span>
            <span className="text-sm font-black font-mono">{data.indexNumber}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Academic Program</span>
            <span className="text-sm font-black uppercase">{data.program}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enrollment Cycle</span>
            <span className="text-sm font-black">{data.enrollmentDate} - {data.completionDate}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Residential House</span>
            <span className="text-sm font-black uppercase">{data.house}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Document Status</span>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Official / Verified</span>
          </div>
        </div>
      </div>

      {/* Academic Table */}
      <div className="space-y-8 mb-12">
        {data.academicHistory.map((session, idx) => (
          <div key={idx}>
            <div className="bg-slate-50 px-4 py-2 border-l-4 border-slate-900 mb-4 flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase tracking-widest">{session.year} - {session.term}</h3>
              <span className="text-[10px] font-bold text-slate-400">Class Cumulative</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</th>
                  <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Score</th>
                  <th className="py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Grade</th>
                </tr>
              </thead>
              <tbody>
                {session.subjects.map((sub, sIdx) => (
                  <tr key={sIdx} className="border-b border-slate-50">
                    <td className="py-2 text-xs font-bold uppercase">{sub.name}</td>
                    <td className="py-2 text-xs font-mono text-center">{sub.score}%</td>
                    <td className="py-2 text-xs font-black text-right">{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* WASSCE Section */}
      {data.wassceResults && (
        <div className="mt-12 pt-8 border-t-2 border-slate-200 dashed">
          <div className="flex items-center gap-3 mb-6 bg-slate-900 text-white px-6 py-3 rounded-xl">
             <ShieldCheck size={18} />
             <h3 className="text-[12px] font-black uppercase tracking-widest">Official WASSCE (Final External Exam) Results</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
             {data.wassceResults.map((res, i) => (
               <div key={i} className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-xs font-bold uppercase text-slate-600">{res.subject}</span>
                  <span className="text-xs font-black">{res.grade}</span>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Footer / Auth */}
      <div className="mt-auto pt-20 flex justify-between items-end">
        <div className="max-w-xs">
           <p className="text-[9px] font-medium text-slate-400 leading-relaxed uppercase italic">
             This document is generated by the MAAIS Academic Audit Suite and is valid only when verified via the system QR portal. Alterations to this document constitute academic fraud.
           </p>
        </div>
        <div className="text-center w-64">
           <div className="h-0.5 bg-slate-200 w-full mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest">Headmaster / Registrar</p>
           <p className="text-[9px] font-bold text-slate-400 mt-1 italic uppercase">Mando SHTS Institutional Seal</p>
        </div>
      </div>
    </div>
  );
});
