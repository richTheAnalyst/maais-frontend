import React from 'react';
import { Wallet, Landmark, Package, History, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const FinanceView: React.FC = () => {
  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight">Finance & Procurement</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Institutional Capital & Asset Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'PTA Dues Collection', value: 'GH₵ 45,200', trend: '+12%', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Material Fees', value: 'GH₵ 8,150', trend: '-5%', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Lab Equipment Value', value: 'GH₵ 120,000', trend: 'Stable', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Library Procurement', value: 'GH₵ 12,400', trend: '+8%', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Recent Transactions</h3>
              <button className="text-[10px] font-black text-brand-teal uppercase tracking-widest hover:underline">View Ledger</button>
            </div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${item % 2 === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {item % 2 === 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">SHS 3 Science Material Fees</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase">Payment Ref: ABC-123-{item}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black text-slate-900">GH₵ 400.00</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase">Today, 10:45 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Inventory Summary</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Lab Chemicals', stock: '85%', color: 'bg-emerald-400' },
                    { label: 'Textbooks', stock: '92%', color: 'bg-blue-400' },
                    { label: 'Desks/Furniture', stock: '40%', color: 'bg-amber-400' },
                    { label: 'IT Equipment', stock: '76%', color: 'bg-purple-400' },
                  ].map((inv, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-slate-300">{inv.label}</span>
                        <span>{inv.stock}</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${inv.color}`} style={{ width: inv.stock }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8">
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">Procurement Tasks</h3>
              <div className="space-y-4">
                {[
                  'Approve Science Dept requisitions',
                  'Verify library book intake',
                  'Renew PTA insurance policy',
                  'Inventory audit for SHS 1 arrival'
                ].map((task, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                    <input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-brand-teal focus:ring-brand-teal" />
                    <span className="text-[12px] font-bold text-slate-600">{task}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
