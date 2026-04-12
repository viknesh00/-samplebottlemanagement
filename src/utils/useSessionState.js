import { useState, useEffect } from 'react'

/**
 * useSessionState(key, initialValue)
 *
 * Behaves exactly like useState, but the value is persisted in sessionStorage.
 * - Survives logout (React state reset) within the same tab
 * - Automatically cleared when the tab/browser is closed
 * - Falls back to `initialValue` on first use (no stored data yet)
 */
export function useSessionState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state))
    } catch {
      // sessionStorage quota exceeded — silently skip
    }
  }, [key, state])

  return [state, setState]
}