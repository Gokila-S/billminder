import { useState, useEffect } from 'react';
import { Calendar, IndianRupee, Tag, Type, RefreshCw, X, Check, AlertCircle, Edit2 } from './Icons';
import { toast } from './Toast';

const categories = ['Utilities', 'Subscriptions', 'Rent', 'Education', 'Food', 'Transport', 'Other'];

export default function BillForm({ onAddBill, onUpdateBill, editBill, onCancelEdit }) {
  const [bill, setBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'Other',
    repeating: false
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editBill) {
      setBill(editBill);
      setErrors({});
    } else {
      setBill({ name: '', amount: '', dueDate: '', category: 'Other', repeating: false });
    }
  }, [editBill]);

  const validate = () => {
    const newErrors = {};
    if (!bill.name.trim()) newErrors.name = 'Bill name is required';
    if (!bill.amount) newErrors.amount = 'Amount is required';
    else if (parseFloat(bill.amount) <= 0) newErrors.amount = 'Amount must be positive';
    if (!bill.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    const amountVal = parseFloat(bill.amount);
    if (editBill) {
      onUpdateBill({ ...bill, amount: amountVal });
      toast.success('Bill updated successfully!');
    } else {
      onAddBill({ ...bill, id: Date.now(), amount: amountVal, isPaid: false });
      toast.success('New reminder added!');
    }
    if (!editBill) {
      setBill({ name: '', amount: '', dueDate: '', category: 'Other', repeating: false });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`mb-8 p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg relative transition-all ${editBill ? 'ring-4 ring-pop-pink' : ''}`}>
      {editBill && (
        <div className="absolute top-0 right-0 bg-pop-pink text-white text-xs font-bold px-2 py-1 uppercase tracking-widest border-b-2 border-l-2 border-black flex items-center gap-1">
          <Edit2 size={12} /> Editing
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-6 font-mono uppercase tracking-tighter flex items-center gap-2">
        {editBill ? <RefreshCw size={22} /> : <Calendar size={22} />} 
        {editBill ? 'Edit Bill' : 'Add New Bill'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2"><Type size={14} /> Bill Name</label>
          <div className="relative">
            <input type="text" value={bill.name}
              onChange={(e) => { setBill({...bill, name: e.target.value}); if(errors.name) setErrors({...errors, name: null}); }}
              className={`w-full p-3 border-2 ${errors.name ? 'border-red-500 bg-red-50' : 'border-black'} focus:outline-none focus:ring-4 focus:ring-pop-pink font-bold transition-all`}
              placeholder="e.g. Netflix, Rent..." />
            {errors.name && <AlertCircle className="absolute right-3 top-3.5 text-red-500" size={18} />}
          </div>
          {errors.name && <p className="text-red-600 text-xs font-bold mt-1 flex items-center gap-1"><X size={12}/> {errors.name}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2"><IndianRupee size={14} /> Amount (₹)</label>
          <div className="relative">
            <input type="number" step="0.01" value={bill.amount}
              onChange={(e) => { setBill({...bill, amount: e.target.value}); if(errors.amount) setErrors({...errors, amount: null}); }}
              className={`w-full p-3 border-2 ${errors.amount ? 'border-red-500 bg-red-50' : 'border-black'} focus:outline-none focus:ring-4 focus:ring-pop-yellow font-bold transition-all`}
              placeholder="0.00" />
            {errors.amount && <AlertCircle className="absolute right-3 top-3.5 text-red-500" size={18} />}
          </div>
          {errors.amount && <p className="text-red-600 text-xs font-bold mt-1 flex items-center gap-1"><X size={12}/> {errors.amount}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2"><Calendar size={14} /> Due Date</label>
          <input type="date" value={bill.dueDate}
            onChange={(e) => { setBill({...bill, dueDate: e.target.value}); if(errors.dueDate) setErrors({...errors, dueDate: null}); }}
            className={`w-full p-3 border-2 ${errors.dueDate ? 'border-red-500 bg-red-50' : 'border-black'} focus:outline-none focus:ring-4 focus:ring-pop-blue font-bold`} />
          {errors.dueDate && <p className="text-red-600 text-xs font-bold mt-1 flex items-center gap-1"><X size={12}/> {errors.dueDate}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2"><Tag size={14} /> Category</label>
          <select value={bill.category} onChange={(e) => setBill({...bill, category: e.target.value})}
            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-4 focus:ring-pop-dark bg-white font-bold">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Repeat checkbox */}
      <div className="mt-6 flex items-center gap-3 p-3 bg-gray-50 border-2 border-black/10 rounded">
        <div className="relative flex items-center">
          <input type="checkbox" id="repeating" checked={bill.repeating}
            onChange={(e) => setBill({...bill, repeating: e.target.checked})}
            className="peer h-6 w-6 cursor-pointer appearance-none border-2 border-black bg-white checked:bg-pop-pink checked:border-black transition-all" />
          <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={16} strokeWidth={4} />
        </div>
        <label htmlFor="repeating" className="font-bold cursor-pointer select-none flex items-center gap-2 uppercase text-sm">
          <RefreshCw size={14} /> Repeat Monthly?
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <button type="submit"
          className="flex-1 bg-black text-white py-4 font-bold text-lg hover:bg-pop-pink hover:text-black transition-all border-2 border-transparent hover:border-black active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] uppercase flex items-center justify-center gap-2">
          {editBill ? <RefreshCw size={20}/> : <Check size={20}/>}
          {editBill ? 'Update Bill' : 'Add Reminder'}
        </button>
        {editBill && (
          <button type="button" onClick={onCancelEdit}
            className="flex-none px-6 py-4 bg-white text-black font-bold text-lg border-2 border-black hover:bg-gray-100 transition-colors active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center gap-2 uppercase">
            <X size={20} /> Cancel
          </button>
        )}
      </div>
    </form>
  );
}
