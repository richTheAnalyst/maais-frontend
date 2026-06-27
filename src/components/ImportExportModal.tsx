import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, X, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { parseCSV, downloadCSV } from '../lib/csv';
import api from '../lib/api';

interface ImportExportModalProps {
  entity: 'students' | 'staff';
  onClose: () => void;
  onImportSuccess: () => void;
}

const STUDENT_TEMPLATE_HEADERS = [
  'indexNumber', 'firstName', 'lastName', 'middleName', 'gender',
  'dateOfBirth', 'email', 'password', 'currentClassId', 'departmentId',
];

const STAFF_TEMPLATE_HEADERS = [
  'staffId', 'firstName', 'lastName', 'middleName', 'gender',
  'phone', 'email', 'password', 'role', 'departmentId',
];

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ entity, onClose, onImportSuccess }) => {
  const [mode, setMode] = React.useState<'import' | 'export'>('import');
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedRows, setParsedRows] = React.useState<Record<string, string>[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const headers = entity === 'students' ? STUDENT_TEMPLATE_HEADERS : STAFF_TEMPLATE_HEADERS;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setResult(null);

    const text = await selected.text();
    try {
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setError('CSV file appears to be empty');
        return;
      }
      setParsedRows(rows);
    } catch {
      setError('Failed to parse CSV file. Check formatting.');
    }
  };

  const handleDownloadTemplate = () => {
    const sampleRow: Record<string, string> = {};
    headers.forEach(h => { sampleRow[h] = ''; });
    downloadCSV(`${entity}_import_template.csv`, [sampleRow]);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Convert string gender/role values, strip blank optional fields
      const rows = parsedRows.map(r => {
        const cleaned: Record<string, any> = {};
        Object.entries(r).forEach(([k, v]) => {
          cleaned[k] = v === '' ? undefined : v;
        });
        return cleaned;
      });

      const endpoint = entity === 'students' ? '/users/students/bulk-import' : '/users/staff/bulk-import';
      const res = await api.post(endpoint, { rows });
      setResult(res.data);
      if (res.data.succeeded > 0) {
        onImportSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const endpoint = entity === 'students' ? '/users/students/export' : '/users/staff/export';
      const res = await api.get(endpoint);
      downloadCSV(`${entity}_export_${new Date().toISOString().split('T')[0]}.csv`, res.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Export failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setParsedRows([]);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 capitalize">{entity} Import / Export</h3>
            <p className="text-xs text-slate-400 mt-1">Bulk transfer {entity} data via CSV</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="px-8 pt-6 shrink-0">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setMode('import'); resetImport(); }}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all', mode === 'import' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400')}
            >
              <Upload size={14} /> Import
            </button>
            <button
              onClick={() => { setMode('export'); resetImport(); }}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all', mode === 'export' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400')}
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm mb-6">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* ── IMPORT MODE ── */}
          {mode === 'import' && (
            <div className="space-y-6">
              {!result ? (
                <>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <p className="text-sm font-bold text-slate-700 mb-2">Required CSV columns:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {headers.map(h => (
                        <span key={h} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-600">
                          {h}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="mt-4 flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline"
                    >
                      <Download size={12} /> Download blank template
                    </button>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText size={24} className="text-emerald-600" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-400">{parsedRows.length} rows detected</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-600">Click to select a CSV file</p>
                        <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                      </>
                    )}
                  </div>

                  {parsedRows.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview (first 3 rows)</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-50">
                              {headers.slice(0, 4).map(h => (
                                <th key={h} className="px-4 py-2 font-bold text-slate-500">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {parsedRows.slice(0, 3).map((row, i) => (
                              <tr key={i} className="border-b border-slate-50">
                                {headers.slice(0, 4).map(h => (
                                  <td key={h} className="px-4 py-2 text-slate-700 truncate max-w-[120px]">{row[h] || '—'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className={cn(
                    'p-6 rounded-3xl border text-center',
                    result.failed === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
                  )}>
                    {result.failed === 0 ? (
                      <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-3" />
                    ) : (
                      <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
                    )}
                    <p className="text-lg font-black text-slate-900">
                      {result.succeeded} of {result.total} imported successfully
                    </p>
                    {result.failed > 0 && (
                      <p className="text-sm font-bold text-amber-700 mt-1">{result.failed} rows failed</p>
                    )}
                  </div>

                  {result.failed > 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                      <div className="px-5 py-3 bg-rose-50 border-b border-rose-100 sticky top-0">
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Failed Rows</p>
                      </div>
                      {result.results.filter((r: any) => !r.success).map((r: any) => (
                        <div key={r.row} className="px-5 py-3 border-b border-slate-50 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600">
                            Row {r.row} {r.indexNumber || r.staffId ? `(${r.indexNumber || r.staffId})` : ''}
                          </span>
                          <span className="text-xs text-rose-600">{r.error}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={resetImport} className="w-full py-3 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100">
                    Import Another File
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── EXPORT MODE ── */}
          {mode === 'export' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Download size={28} />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2 capitalize">Export All {entity}</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Downloads a CSV file with all {entity} currently visible to you, including their academic and contact details.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest">
            {result ? 'Close' : 'Cancel'}
          </button>
          {mode === 'import' && !result && (
            <button
              onClick={handleImport}
              disabled={isProcessing || parsedRows.length === 0}
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Import {parsedRows.length > 0 ? `${parsedRows.length} Rows` : ''}
            </button>
          )}
          {mode === 'export' && (
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Download CSV
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};