/**
 * BillMinder – localStorage auth utilities
 *
 * Storage schema
 * ──────────────
 * "bm-users"          → JSON array of { id, name, email, passwordHash, createdAt }
 * "bm-session"        → JSON  { userId, email, name }   (logged-in user)
 * "bm-bills-<userId>" → JSON array of bills (per-user)
 */

// ─── Simple hash (not cryptographic – fine for localStorage demo) ────────────
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + ch
    hash |= 0 // Convert to 32-bit integer
  }
  // Mix further to make it less predictable in plain sight
  hash = Math.abs(hash)
  return `bm$${hash.toString(36)}$${str.length}`
}

// ─── Storage helpers (safe in non-browser envs) ─────────────────────────────
const storage = (() => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const testKey = '__bm_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch {
    return null
  }
})()

function readStorage(key) {
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch {
    // Ignore write errors (quota, disabled storage)
  }
}

function removeStorage(key) {
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // Ignore remove errors
  }
}

// ─── Users store ─────────────────────────────────────────────────────────────
function getUsers() {
  try {
    return JSON.parse(readStorage('bm-users')) || []
  } catch {
    return []
  }
}

function saveUsers(users) {
  writeStorage('bm-users', JSON.stringify(users))
}

function findUserByEmail(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase())
}

// ─── Registration ────────────────────────────────────────────────────────────
export function registerUser({ name, email, password }) {
  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedName) return { ok: false, error: 'Name is required.' }
  if (!trimmedEmail) return { ok: false, error: 'Email is required.' }
  if (!isValidEmail(trimmedEmail)) return { ok: false, error: 'Please enter a valid email.' }
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }

  if (findUserByEmail(trimmedEmail)) {
    return { ok: false, error: 'An account with this email already exists. Try logging in!' }
  }

  const user = {
    id: generateId(),
    name: trimmedName,
    email: trimmedEmail,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  }

  const users = getUsers()
  users.push(user)
  saveUsers(users)

  // Auto-login after signup
  setSession(user)

  return { ok: true, user: { id: user.id, name: user.name, email: user.email } }
}

// ─── Login ───────────────────────────────────────────────────────────────────
export function loginUser({ email, password }) {
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedEmail) return { ok: false, error: 'Email is required.' }
  if (!password) return { ok: false, error: 'Password is required.' }

  const user = findUserByEmail(trimmedEmail)

  if (!user) {
    return { ok: false, error: 'No account found with this email. Sign up first!' }
  }

  if (user.passwordHash !== simpleHash(password)) {
    return { ok: false, error: 'Incorrect password. Try again!' }
  }

  setSession(user)

  return { ok: true, user: { id: user.id, name: user.name, email: user.email } }
}

// ─── Session ─────────────────────────────────────────────────────────────────
function setSession(user) {
  writeStorage('bm-session', JSON.stringify({
    userId: user.id,
    email: user.email,
    name: user.name,
  }))
}

export function getSession() {
  try {
    const session = JSON.parse(readStorage('bm-session'))
    if (session && session.userId) return session
    return null
  } catch {
    return null
  }
}

export function logout() {
  removeStorage('bm-session')
}

export function isLoggedIn() {
  return getSession() !== null
}

// ─── Per-user bill storage ───────────────────────────────────────────────────
export function getUserBills(userId) {
  try {
    const key = `bm-bills-${userId}`
    return JSON.parse(readStorage(key)) || []
  } catch {
    return []
  }
}

export function saveUserBills(userId, bills) {
  const key = `bm-bills-${userId}`
  writeStorage(key, JSON.stringify(bills))
}

// ─── Password reset (localStorage-based – shows "security question" style) ──
export function resetPassword({ email, newPassword }) {
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedEmail) return { ok: false, error: 'Email is required.' }
  if (!isValidEmail(trimmedEmail)) return { ok: false, error: 'Please enter a valid email.' }
  if (newPassword.length < 6) return { ok: false, error: 'New password must be at least 6 characters.' }

  const users = getUsers()
  const idx = users.findIndex(u => u.email.toLowerCase() === trimmedEmail)

  if (idx === -1) {
    return { ok: false, error: 'No account found with this email.' }
  }

  users[idx].passwordHash = simpleHash(newPassword)
  saveUsers(users)

  return { ok: true }
}

// ─── Update profile ─────────────────────────────────────────────────────────
export function updateProfile({ userId, name }) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { ok: false, error: 'User not found.' }

  users[idx].name = name.trim()
  saveUsers(users)

  // Update session too
  const session = getSession()
  if (session && session.userId === userId) {
    session.name = name.trim()
    writeStorage('bm-session', JSON.stringify(session))
  }

  return { ok: true }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
