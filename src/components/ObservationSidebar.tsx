import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  History, 
  MessageSquare, 
  Send, 
  Paperclip, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

export type SidebarMode = 'behavioral' | 'correction' | 'compliance';

interface ObservationSidebarProps {
  mode: SidebarMode;
  student: {
    id: string;
    name: string;
    index: string;
  };
  onClose: () => void;
  ratings: Record<string, number>;
  onRatingChange: (id: string, rating: number) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  onSave: () => void;
  // Correction specific
  hodFeedback?: {
    teacherName: string;
    message: string;
    timeAgo: string;
  };
  teacherReply?: string;
  onReplyChange?: (reply: string) => void;
  onSecondaryAction?: () => void; // e.g. Navigate to revisions
}

export function ObservationSidebar({
  mode,
  student,
  onClose,
  ratings,
  onRatingChange,
  comment,
  onCommentChange,
  onSave,
  hodFeedback,
  teacherReply,
  onReplyChange,
  onSecondaryAction
}: ObservationSidebarProps) {
  const isCorrection = mode === 'correction';
  const isCompliance = mode === 'compliance';
  const isBehavioral = mode === 'behavioral';

  const [isFlagged, setIsFlagged] = React.useState(false);
  const [safetyChecked, setSafetyChecked] = React.useState(false);

  const ratingsList = isBehavioral ? [
    { label: 'Punctuality', id: 'punctuality' },
    { label: 'Class Participation', id: 'participation' },
    { label: 'Task Completion', id: 'task' },
    { label: 'Respect for Rules', id: 'rules' },
    { label: 'Peer Interaction', id: 'peer' },
  ] : [
    { label: 'Equipment Handling', id: 'equipment' },
    { label: 'Safety Protocol Compliance', id: 'safety' },
    { label: 'Tool Maintenance', id: 'maintenance' },
  ];

  const headerColor = isCorrection ? "bg-red-100/50 text-red-900" : 
                      isCompliance ? "bg-amber-100/50 text-amber-900" :
                      "bg-[#D1E9E0] text-gray-800";

  return (
    <motion.aside 
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      className="w-[300px] flex flex-col overflow-y-auto m-4 rounded-[1.5rem] border border-gray-100 shadow-2xl bg-white shrink-0"
    >
      {/* Header Banner */}
      <div className={cn("px-5 py-3 font-black flex items-center justify-between", headerColor)}>
        <span className="text-base tracking-tight">
          {isCorrection ? 'Correction Bridge' : 
           isCompliance ? 'Guided Observation' : 
           'Behavorial Observation'}
        </span>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
          <ChevronRight size={18} />
        </button>
      </div>
      
      <div className="p-5 flex flex-col gap-4">
        {/* Student Identity */}
        <div className="flex items-center gap-3 mb-1">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
            alt={student.name} 
            className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-white shadow-md shadow-gray-200"
          />
          <div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">{student.name}</h3>
            <p className="text-xs font-bold text-gray-500">Index No. {student.index}</p>
          </div>
        </div>

        <div className="h-px bg-gray-100 -mx-5" />

        {isCorrection ? (
          <div className="flex-1 flex flex-col gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest">
                <History size={12} />
                HOD Feedback
              </div>
              {hodFeedback && (
                <div className="bg-red-50 rounded-xl p-3 border border-red-100 relative">
                  <div className="flex gap-2">
                    <MessageSquare size={14} className="text-red-400 mt-1 shrink-0" />
                    <p className="text-xs text-gray-700 italic leading-relaxed">
                      <span className="font-bold text-red-800 not-italic">HOD {hodFeedback.teacherName}: </span>
                      "{hodFeedback.message}"
                    </p>
                  </div>
                  <span className="absolute bottom-1 right-3 text-[8px] text-red-400 font-bold uppercase">{hodFeedback.timeAgo}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Send size={12} />
                  Your Explanation
                </div>
                <button className="p-1 text-gray-400 hover:text-emerald-600 transition-colors">
                  <Paperclip size={14} />
                </button>
              </div>
              <textarea 
                value={teacherReply}
                onChange={(e) => onReplyChange?.(e.target.value)}
                placeholder="Explain the fix..."
                className="w-full h-24 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
              <div className="flex flex-wrap gap-2">
                {['Typo Fixed', 'Remarked', 'Data Verified'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => onReplyChange?.(tag)}
                    className="px-2 py-1 bg-gray-100 text-[9px] font-black text-gray-500 uppercase tracking-widest rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={onSecondaryAction}
              className="w-full py-3 bg-[#015D34] text-white font-black rounded-xl text-xs hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              Submit to HOD
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {ratingsList.map((rating) => (
                <div key={rating.id} className="pb-3 border-b border-gray-100 last:border-0 flex items-center justify-between">
                  <span className="text-xs font-black text-gray-800 tracking-tight">{rating.label}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((num) => (
                      <button 
                        key={num}
                        onClick={() => onRatingChange(rating.id, num)}
                        className={cn(
                          "w-7 h-7 rounded-full border border-2 flex items-center justify-center text-xs font-black transition-all",
                          ratings[rating.id] === num 
                            ? "bg-[#015D34] border-[#015D34] text-white shadow-md" 
                            : "border-[#015D34] text-[#015D34] hover:bg-emerald-50"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Safety & Tool Section */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-sm font-black text-gray-900 mb-3 tracking-tight">Safety & Tool</h4>
              <label className="flex items-center gap-3 cursor-pointer group">
                <button 
                  onClick={() => setSafetyChecked(!safetyChecked)}
                  className={cn(
                    "w-6 h-6 border-2 border-emerald-600 rounded flex items-center justify-center transition-all",
                    safetyChecked ? "bg-emerald-600" : "bg-white"
                  )}
                >
                  {safetyChecked && <ShieldCheck size={16} className="text-white" />}
                </button>
                <span className="text-xs font-bold text-gray-700">Followed Lab safety GuideLines</span>
              </label>
            </div>

            {/* Flag Student Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-black text-gray-900 tracking-tight">Flag Student</span>
              <button 
                onClick={() => setIsFlagged(!isFlagged)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative p-1 shadow-inner",
                  isFlagged ? "bg-red-500" : "bg-[#D1E9E0]"
                )}
              >
                <motion.div 
                  animate={{ x: isFlagged ? 24 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </div>

            {comment && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-800">Audit Justification</span>
                  <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Required</span>
                </div>
                <textarea 
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder="Required for extreme ratings..."
                  className="w-full h-20 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button 
                onClick={onSave}
                className="flex-1 py-3 bg-[#015D34] text-white font-black rounded-full text-sm hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10"
              >
                Save
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-[#D1E9E0] text-gray-800 font-black rounded-full text-sm hover:bg-emerald-200 transition-all"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </motion.aside>
  );
}
