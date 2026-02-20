import { useState } from 'react'
import { registerUser, loginUser, resetPassword } from '../utils/auth'

/* ─── Icons ──────────────────────────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}

/* ─── Input component ────────────────────────────────────────────────────── */
function InputField({ label, type = 'text', placeholder, value, onChange, id, showToggle, onToggle, showPw, autoFocus }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-black uppercase tracking-widest text-black">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showToggle ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          autoFocus={autoFocus}
          autoComplete={type === 'email' ? 'email' : showToggle ? 'current-password' : 'off'}
          className="
            w-full px-4 py-3 pr-12
            bg-white
            border-4 border-black
            font-bold text-black placeholder:text-gray-400 placeholder:font-normal
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            focus:outline-none focus:shadow-[6px_6px_0px_0px_#ff6f91] focus:border-black
            transition-all duration-150
            text-base
          "
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
            tabIndex={-1}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPw} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Password strength indicator ────────────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null

  const checks = [
    { label: '6+ characters', pass: password.length >= 6 },
    { label: 'Has number', pass: /\d/.test(password) },
    { label: 'Has uppercase', pass: /[A-Z]/.test(password) },
  ]

  const passed = checks.filter(c => c.pass).length
  const barColor = passed <= 1 ? 'bg-red-500' : passed === 2 ? 'bg-yellow-500' : 'bg-green-500'
  const barWidth = `${(passed / checks.length) * 100}%`

  return (
    <div className="space-y-2 -mt-1">
      {/* Strength bar */}
      <div className="h-2 bg-gray-200 border-2 border-black overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: barWidth }}
        />
      </div>
      {/* Check list */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide ${c.pass ? 'text-green-600' : 'text-gray-400'}`}>
            {c.pass ? <CheckIcon /> : <XIcon />}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Main AuthPage ──────────────────────────────────────────────────────── */
export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')       // 'login' | 'signup' | 'forgot'
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const [error, setError] = useState('')

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const switchMode = (newMode) => {
    if (newMode === mode) return
    setAnimating(true)
    setError('')
    setSuccess('')
    setForm({ name: '', email: '', password: '', confirmPassword: '', newPassword: '', confirmNewPassword: '' })
    setShowPw(false)
    setShowConfirmPw(false)
    setShowNewPw(false)
    setTimeout(() => {
      setMode(newMode)
      setAnimating(false)
    }, 200)
  }

  /* ─── Submit handlers ─────────────────────────────────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Simulate a tiny delay for UX polish
    setTimeout(() => {
      if (mode === 'signup') handleSignup()
      else if (mode === 'login') handleLogin()
      else if (mode === 'forgot') handleForgot()
      setLoading(false)
    }, 400)
  }

  const handleSignup = () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match. Try again!")
      return
    }

    const result = registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    if (onAuth) onAuth({ mode: 'signup', ...result.user })
  }

  const handleLogin = () => {
    const result = loginUser({
      email: form.email,
      password: form.password,
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    if (onAuth) onAuth({ mode: 'login', ...result.user })
  }

  const handleForgot = () => {
    if (form.newPassword !== form.confirmNewPassword) {
      setError("New passwords don't match.")
      return
    }

    const result = resetPassword({
      email: form.email,
      newPassword: form.newPassword,
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    setSuccess('Password reset successfully! You can now log in.')
    setTimeout(() => switchMode('login'), 1800)
  }

  const isLogin = mode === 'login'
  const isForgot = mode === 'forgot'

  return (
    <div className="min-h-screen bg-pop-yellow font-sans text-black selection:bg-pop-pink selection:text-white overflow-hidden relative flex flex-col items-center justify-center p-4">

      {/* Background noise grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 40px),' +
            'repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 40px)',
        }}
      />

      {/* Decorative blobs */}
      <div className="fixed top-[-60px] right-[-60px] w-56 h-56 bg-pop-pink border-4 border-black rounded-none rotate-12 opacity-60 pointer-events-none" />
      <div className="fixed bottom-[-40px] left-[-40px] w-48 h-48 bg-pop-blue border-4 border-black rounded-none -rotate-6 opacity-50 pointer-events-none" />
      <div className="fixed top-1/2 left-[-80px] w-32 h-32 bg-black rounded-none rotate-45 opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black font-mono uppercase tracking-tighter drop-shadow-[4px_4px_0_rgba(0,0,0,1)] transform -rotate-2 mb-3 inline-block">
            Bill<span className="text-pop-pink">Minder</span>
          </h1>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-black/60">
            Keep the lights on.
          </p>
        </div>

        {/* Mode switcher tabs — hide on forgot */}
        {!isForgot && (
          <div className="flex mb-0 border-4 border-black">
            <button
              onClick={() => switchMode('login')}
              className={`
                flex-1 py-3 text-sm font-black uppercase tracking-widest transition-all duration-150
                ${isLogin
                  ? 'bg-black text-pop-yellow shadow-none'
                  : 'bg-white text-black hover:bg-pop-yellow/60'}
              `}
            >
              Log In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`
                flex-1 py-3 text-sm font-black uppercase tracking-widest transition-all duration-150 border-l-4 border-black
                ${!isLogin
                  ? 'bg-black text-pop-yellow shadow-none'
                  : 'bg-white text-black hover:bg-pop-yellow/60'}
              `}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Back button on forgot */}
        {isForgot && (
          <button
            onClick={() => switchMode('login')}
            className="flex items-center gap-2 mb-3 text-sm font-black uppercase tracking-widest hover:text-pop-pink transition-colors"
          >
            <ArrowLeftIcon /> Back to Log In
          </button>
        )}

        {/* Card */}
        <div
          className={`
            bg-white border-4 ${isForgot ? '' : 'border-t-0'} border-black p-8
            shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
            transition-all duration-200
            ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
          `}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

            {/* Title row */}
            <div className="mb-1">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {isForgot ? 'Reset Password' : isLogin ? 'Welcome back!' : 'Create account'}
              </h2>
              <p className="text-sm text-black/50 font-semibold mt-0.5">
                {isForgot
                  ? 'Enter your email and choose a new password.'
                  : isLogin
                    ? 'Sign in to manage your bills.'
                    : 'Join to never miss a due date.'}
              </p>
            </div>

            {/* ── Signup fields ──────────────────────────────────────────── */}
            {mode === 'signup' && (
              <InputField
                id="name"
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={set('name')}
                autoFocus
              />
            )}

            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoFocus={mode === 'login'}
            />

            {/* ── Login / Signup password ────────────────────────────────── */}
            {!isForgot && (
              <InputField
                id="password"
                label="Password"
                placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
                value={form.password}
                onChange={set('password')}
                showToggle
                onToggle={() => setShowPw(p => !p)}
                showPw={showPw}
              />
            )}

            {/* Password strength — signup only */}
            {mode === 'signup' && form.password && (
              <PasswordStrength password={form.password} />
            )}

            {mode === 'signup' && (
              <InputField
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                showToggle
                onToggle={() => setShowConfirmPw(p => !p)}
                showPw={showConfirmPw}
              />
            )}

            {/* ── Forgot password fields ────────────────────────────────── */}
            {isForgot && (
              <>
                <InputField
                  id="newPassword"
                  label="New Password"
                  placeholder="Min. 6 characters"
                  value={form.newPassword}
                  onChange={set('newPassword')}
                  showToggle
                  onToggle={() => setShowNewPw(p => !p)}
                  showPw={showNewPw}
                />
                {form.newPassword && <PasswordStrength password={form.newPassword} />}
                <InputField
                  id="confirmNewPassword"
                  label="Confirm New Password"
                  placeholder="Repeat new password"
                  value={form.confirmNewPassword}
                  onChange={set('confirmNewPassword')}
                  showToggle
                  onToggle={() => setShowConfirmPw(p => !p)}
                  showPw={showConfirmPw}
                />
              </>
            )}

            {/* Error */}
            {error && (
              <div className="bg-pop-pink border-4 border-black px-4 py-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-shake">
                <p className="text-sm font-black text-white uppercase tracking-wide">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-400 border-4 border-black px-4 py-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-black text-white uppercase tracking-wide">{success}</p>
              </div>
            )}

            {/* Forgot password — login only */}
            {isLogin && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-pop-pink transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full mt-1 py-4
                bg-black text-pop-yellow
                font-black uppercase tracking-widest text-base
                border-4 border-black
                shadow-[6px_6px_0px_0px_#ff6f91]
                hover:shadow-[8px_8px_0px_0px_#ff6f91] hover:-translate-y-0.5
                active:shadow-[2px_2px_0px_0px_#ff6f91] active:translate-y-0.5
                transition-all duration-100
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-pop-yellow border-t-transparent rounded-full animate-spin" />
              )}
              {isForgot
                ? 'Reset Password →'
                : isLogin
                  ? 'Sign In →'
                  : 'Create Account →'}
            </button>

            {/* Divider — not on forgot */}
            {!isForgot && (
              <>
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-0.5 bg-black/20" />
                  <span className="text-xs font-black uppercase tracking-widest text-black/40">or</span>
                  <div className="flex-1 h-0.5 bg-black/20" />
                </div>

                {/* Google OAuth mock */}
                <button
                  type="button"
                  className="
                    w-full py-3
                    bg-white text-black
                    font-black uppercase tracking-widest text-sm
                    border-4 border-black
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    hover:shadow-[6px_6px_0px_0px_#845ec2] hover:-translate-y-0.5
                    active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5
                    transition-all duration-100
                    flex items-center justify-center gap-3
                  "
                >
                  {/* Google G */}
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 19.07 12c0 .68-.11 1.33-.28 1.95H12v-3.69h7.61A7.07 7.07 0 0 0 5.27 9.76z"/>
                    <path fill="#4285F4" d="M12 19.07a7.06 7.06 0 0 1-6.73-4.93l-3.18 2.4A11.14 11.14 0 0 0 12 23.07c3.09 0 5.89-1.21 7.98-3.17l-3.03-2.35A7.07 7.07 0 0 1 12 19.07z"/>
                    <path fill="#FBBC05" d="M5.27 14.14A7.05 7.05 0 0 1 4.93 12c0-.74.13-1.46.34-2.14L2.09 7.45A11.08 11.08 0 0 0 .86 12c0 1.62.35 3.16.96 4.55l3.45-2.41z"/>
                    <path fill="#34A853" d="M12 4.93a7.1 7.1 0 0 1 4.87 1.9l2.93-2.93A11.1 11.1 0 0 0 12 .93 11.14 11.14 0 0 0 2.09 7.45l3.18 2.31A7.07 7.07 0 0 1 12 4.93z"/>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

          </form>
        </div>

        {/* Footer switch prompt */}
        <p className="text-center mt-5 text-sm font-bold text-black/60">
          {isForgot
            ? 'Remember your password? '
            : isLogin
              ? "No account yet? "
              : "Already have one? "}
          <button
            onClick={() => switchMode(isForgot ? 'login' : isLogin ? 'signup' : 'login')}
            className="font-black text-black underline decoration-2 underline-offset-4 hover:text-pop-pink transition-colors"
          >
            {isForgot ? 'Log In' : isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>

      {/* Footer */}
      <p className="absolute bottom-4 font-mono text-xs font-bold uppercase opacity-30 tracking-widest">
        © 2026 BillMinder
      </p>
    </div>
  )
}
