import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: 'client' | 'editor' | 'admin'
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

// Simple localStorage persistence
const storageKey = 'auth-storage'

const loadFromStorage = (): Partial<AuthState> => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const saveToStorage = (state: Partial<AuthState>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {}
}

export const useAuthStore = create<AuthState>((set) => {
  const initialState = loadFromStorage()
  
  return {
    user: initialState.user || null,
    token: initialState.token || null,
    isAuthenticated: initialState.isAuthenticated || false,
    login: (user, token) => {
      const newState = { user, token, isAuthenticated: true }
      saveToStorage(newState)
      set(newState)
    },
    logout: () => {
      const newState = { user: null, token: null, isAuthenticated: false }
      saveToStorage(newState)
      set(newState)
    },
    updateUser: (updates) =>
      set((state) => {
        const newUser = state.user ? { ...state.user, ...updates } : null
        const newState = { ...state, user: newUser }
        saveToStorage(newState)
        return newState
      }),
  }
})
