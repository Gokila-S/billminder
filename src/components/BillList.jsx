import { useState } from 'react';
import { Search, Calendar, Tag, RefreshCw, Trash2, CheckCircle, Edit2, AlertOctagon, CircleAlert, Flag, TrendingUp, X } from './Icons';

const getStatusColor = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dueDate.split('-').map(Number);
  const dueObj = new Date(y, m - 1, d);
  const diffTime = dueObj - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { bg: 'bg-red-600', text: 'text-white', Icon: AlertOctagon, msg: 'Overdue!' };
  if (diffDays <= 3) return { bg: 'bg-red-500', text: 'text-white', Icon: CircleAlert, msg: `Due in ${diffDays}d` };
  if (diffDays <= 7) return { bg: 'bg-yellow-400', text: 'text-black', Icon: Flag, msg: `${diffDays}d left` };
  return { bg: 'bg-green-400', text: 'text-black', Icon: TrendingUp, msg: 'On track' };
};

export default function BillList({ bills, onTogglePaid, onDelete, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = bills.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Search bills..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 pl-12 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg text-lg" />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-4 border-dashed border-black/20 p-12 rounded-lg bg-white/50 min-h-[200px]">
          {searchTerm ? <Search size={48} className="opacity-20 mb-4" /> : <CheckCircle size={48} className="opacity-20 text-green-500 mb-4" />}
          <p className="text-gray-500 text-center font-bold text-xl uppercase tracking-widest">{searchTerm ? 'No results' : 'No bills pending!'}</p>
          {!searchTerm && <p className="text-gray-400 mt-2 font-mono text-sm">Add a new reminder to get started</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(bill => {
            const status = getStatusColor(bill.dueDate);
            const StatusIcon = status.Icon;
            return (
              <div key={bill.id} className="group relative flex flex-col md:flex-row bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-all rounded-lg overflow-hidden">

                {/* Color strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${status.bg}`} />

                {/* Info */}
                <div className="flex-1 p-4 pl-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg uppercase tracking-tighter truncate max-w-[220px]" title={bill.name}>{bill.name}</h3>
                    {bill.repeating && (
                      <span title="Repeats Monthly" className="bg-black/5 p-1 rounded-full"><RefreshCw size={12} className="text-black/60" /></span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold opacity-70">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(bill.dueDate).toLocaleDateString('en-IN', { timeZone: 'UTC' })}</span>
                    <span className="flex items-center gap-1"><Tag size={12}/> {bill.category}</span>
                    <span className={`flex items-center gap-1 font-bold ${status.bg === 'bg-red-600' || status.bg === 'bg-red-500' ? 'text-red-600' : 'text-green-700'}`}>
                      <StatusIcon size={12}/> {status.msg}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-center px-5 border-t md:border-t-0 md:border-l-2 border-black/10 bg-gray-50 min-w-[120px]">
                  <span className="font-mono text-xl font-bold">₹{parseFloat(bill.amount).toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col bg-gray-50 border-t md:border-t-0 md:border-l-2 border-black divide-x md:divide-x-0 md:divide-y divide-black/20">
                  <button onClick={() => onEdit(bill)} title="Edit"
                    className="flex-1 flex items-center justify-center p-3 hover:bg-yellow-100 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(bill.id)} title="Delete"
                    className="flex-1 flex items-center justify-center p-3 hover:bg-red-100 text-red-600 transition-colors"><Trash2 size={16} /></button>
                </div>

                {/* Mark Paid (hover reveal on desktop) */}
                <button onClick={() => onTogglePaid(bill.id)}
                  className="md:absolute md:right-28 md:top-1/2 md:-translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 transition-all bg-black text-white px-4 py-2 font-bold uppercase text-sm shadow-md active:translate-y-0.5 mx-3 mb-3 md:m-0 rounded flex items-center gap-2 hover:bg-green-600 z-20">
                  <CheckCircle size={16} /> Mark Paid
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
