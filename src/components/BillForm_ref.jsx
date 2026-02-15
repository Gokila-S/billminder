export const categories = ['Utilities', 'Subscriptions', 'Rent', 'Education', 'Food', 'Transport', 'Other'];

export default function BillForm({ onAddBill, editBill, onCancelEdit }) {
  // If editing, use existing data. Otherwise default.
  // Note: we need to handle state updates when editBill changes. 
  // But React useState default value is only used on first render.
  // We need useEffect to update form when prop changes.
}
