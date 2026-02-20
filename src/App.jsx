import { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from './components/Toast'
import BillForm from './components/BillForm'
import BillList from './components/BillList'
import SpendingChart from './components/SpendingChart'
import { Bell, IndianRupee, Lightbulb } from './components/Icons'
import AuthPage from './components/AuthPage'
import { getSession, logout, getUserBills, saveUserBills } from './utils/auth'

function App() {
  const [session, setSession] = useState(() => getSession())

  const handleAuth = ({ mode, id, name, email }) => {
    const newSession = getSession() // already set by auth utility
    setSession(newSession)
    toast.success(
      mode === 'signup'
        ? `Welcome, ${name || email}! 🎉`
        : `Welcome back, ${name || email}!`
    )
  }

  const handleLogout = () => {
    logout()
    setSession(null)
    toast.success('Logged out. See you soon!')
  }

  // ─── Per-user bills ──────────────────────────────────────────────────────
  const [bills, setBills] = useState(() => {
    if (!session) return []
    return getUserBills(session.userId)
  })

  const [editBill, setEditBill] = useState(null)

  // Sync bills to localStorage whenever they change
  useEffect(() => {
    if (session) {
      saveUserBills(session.userId, bills)
    }
  }, [bills, session])

  // Reload bills when session changes (login/logout)
  useEffect(() => {
    if (session) {
      setBills(getUserBills(session.userId))
    } else {
      setBills([])
    }
  }, [session])

  // On-load due-today check
  useEffect(() => {
    if (!session) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueToday = bills.filter(bill => {
      const [y, m, d] = bill.dueDate.split('-').map(Number)
      const due = new Date(y, m - 1, d)
      return due.getDate() === today.getDate() &&
             due.getMonth() === today.getMonth() &&
             due.getFullYear() === today.getFullYear()
    })

    if (dueToday.length > 0) {
      setTimeout(() => {
        toast.error(`${dueToday.length} bill(s) due TODAY: ${dueToday.map(b => b.name).join(', ')}`)
      }, 800)
    }
  }, [session])

  const addBill = (newBill) => {
    setBills(prev => [...prev, newBill])
  }

  const updateBill = (updatedBill) => {
    setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b))
    setEditBill(null)
  }

  const deleteBill = (id, force = false) => {
    const billToDelete = bills.find(b => b.id === id)
    if (!billToDelete) return
    if (!force && !confirm(`Delete '${billToDelete.name}'?`)) return

    setBills(prev => prev.filter(b => b.id !== id))

    // Toast with undo
    toast((t) => (
      <span className="flex items-center justify-between w-full gap-3">
        <span>Deleted <b>{billToDelete.name}</b></span>
        <button
          onClick={() => {
            setBills(prev => [...prev, billToDelete])
            t.dismiss()
          }}
          className="bg-black text-white px-3 py-1 text-xs font-bold uppercase rounded hover:bg-pop-pink hover:text-black transition-colors shrink-0"
        >
          Undo
        </button>
      </span>
    ), { duration: 5000 })
  }

  const togglePaid = (id) => {
    const bill = bills.find(b => b.id === id)
    if (!bill) return

    if (bill.repeating) {
      const [y, m, d] = bill.dueDate.split('-').map(Number)
      let nextYear = y, nextMonth = m + 1
      if (nextMonth > 12) { nextMonth = 1; nextYear++ }
      const daysInNextMonth = new Date(nextYear, nextMonth, 0).getDate()
      const nextDay = Math.min(d, daysInNextMonth)
      const newDueDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`
      updateBill({ ...bill, dueDate: newDueDate })
      toast.success(`Marked paid! Next due: ${newDueDate}`)
    } else {
      deleteBill(id, true)
    }
  }

  const totalMonthly = bills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)

  if (!session) return (
    <>
      <Toaster position="bottom-center" />
      <AuthPage onAuth={handleAuth} />
    </>
  )

  // Get first name for greeting
  const firstName = session.name ? session.name.split(' ')[0] : session.email.split('@')[0]

  return (
    <div className="min-h-screen bg-pop-yellow p-4 md:p-10 font-sans text-black selection:bg-pop-pink selection:text-white overflow-x-hidden relative">
      <Toaster position="bottom-center" />

      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center border-b-8 border-black pb-8">
          <h1 className="text-6xl md:text-8xl font-black font-mono uppercase tracking-tighter mb-4 transform -rotate-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            Bill<span className="text-pop-pink">Minder</span>
          </h1>
          <div className="inline-block transform rotate-2">
            <p className="text-xl md:text-2xl font-bold uppercase tracking-widest bg-black text-white px-6 py-2 shadow-[8px_8px_0px_0px_#ff6f91] flex items-center gap-2 justify-center">
              <Bell size={20} /> Don't Get Cut Off!
            </p>
          </div>

          {/* User info + logout */}
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            <span className="text-sm font-black uppercase tracking-widest bg-white border-2 border-black px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              👋 Hi, {firstName}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-black uppercase tracking-widest border-2 border-black px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-pop-yellow transition-colors"
            >
              Log Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-10">
            <BillForm onAddBill={addBill} onUpdateBill={updateBill} editBill={editBill} onCancelEdit={() => setEditBill(null)} />
            <BillList bills={bills} onTogglePaid={togglePaid} onDelete={deleteBill} onEdit={setEditBill} />
          </div>

          <div className="space-y-8 lg:sticky lg:top-10">
            {/* Total */}
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1 hover:rotate-0 transition-transform group">
              <h3 className="text-xl font-bold uppercase mb-2 border-b-2 border-black pb-2 flex items-center gap-2">
                <IndianRupee size={20} /> Total Outstanding
              </h3>
              <p className="text-6xl font-mono font-bold text-pop-pink break-all group-hover:scale-105 transition-transform origin-left">
                ₹{totalMonthly.toFixed(0)}<span className="text-2xl text-black">.{(totalMonthly % 1).toFixed(2).substring(2)}</span>
              </p>
            </div>

            {/* Chart */}
            <div className="transform -rotate-1 hover:rotate-0 transition-transform">
              <SpendingChart bills={bills} />
            </div>

            {/* Tips */}
            <div className="bg-pop-blue text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-2 hover:rotate-0 transition-transform">
              <h3 className="font-bold uppercase text-2xl mb-4 text-pop-yellow flex items-center gap-2">
                <Lightbulb size={22} className="text-white" /> Quick Tips
              </h3>
              <ul className="text-lg space-y-4 font-bold list-none">
                <li className="flex items-center gap-3">
                  <span className="bg-red-500 rounded-full p-1.5"><Bell size={12} className="text-white" /></span>
                  <span className="underline decoration-2 underline-offset-4">Red = pay ASAP</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="bg-black rounded-full p-1.5"><IndianRupee size={12} className="text-white" /></span>
                  <span>'Repeat' for recurring</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-20 text-center font-mono text-sm opacity-50 font-bold uppercase">
          © 2026 BillMinder • Keep the lights on.
        </footer>
      </div>
    </div>
  )
}

export default App
