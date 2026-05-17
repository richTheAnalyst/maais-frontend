import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface ClassCardProps {
  subject: string;
  className: string;
  status: string;
  progress: number;
  studentCount: number;
  color?: string;
}

export function ClassCard({ subject, className, status, progress, studentCount, color = "#10b981" }: ClassCardProps) {
  const data = [
    { value: progress },
    { value: 100 - progress },
  ];

  const isComplete = progress === 100;

  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all duration-300 group hover:shadow-xl hover:-translate-y-1",
      isComplete ? "bg-emerald-600 border-emerald-500 text-white" : "bg-white border-gray-100 text-gray-900"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg leading-tight">{subject}</h3>
          <p className={cn("text-sm mt-1", isComplete ? "text-emerald-100" : "text-gray-500")}>
            {className}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1">
          <p className={cn("text-sm font-medium mb-4", isComplete ? "text-emerald-100" : "text-emerald-600")}>
            {status}
          </p>
          
          <div className="flex items-center gap-2 mb-6">
            <div className={cn("w-2 h-2 rounded-full", isComplete ? "bg-emerald-300" : "bg-emerald-500")} />
            <span className={cn("text-sm font-semibold", isComplete ? "text-emerald-50" : "text-gray-700")}>
              {studentCount} Students
            </span>
          </div>

          <button className={cn(
            "w-full py-2.5 rounded-xl text-sm font-bold transition-all",
            isComplete 
              ? "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm" 
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
          )}>
            Enter Marks
          </button>
        </div>

        <div className="w-32 h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                <Cell fill={isComplete ? "#ffffff" : color} />
                <Cell fill={isComplete ? "rgba(255,255,255,0.2)" : "#f3f4f6"} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
