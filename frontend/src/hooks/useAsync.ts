import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage, type Sourced } from '../services/api'

export interface AsyncResult<T> {
  status: 'loading' | 'success' | 'error'
  data: T | null
  source: 'api' | 'demo' | null
  error: string | null
  reload: () => void
}

/** Runs a service call and tracks loading, success and error states. */
export function useAsync<T>(load: () => Promise<Sourced<T>>, deps: unknown[] = []): AsyncResult<T> {
  const [state, setState] = useState<Omit<AsyncResult<T>, 'reload'>>({ status: 'loading', data: null, source: null, error: null })
  const [nonce, setNonce] = useState(0)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, status: 'loading', error: null }))
    loadRef
      .current()
      .then((result) => {
        if (active) setState({ status: 'success', data: result.data, source: result.source, error: null })
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', data: null, source: null, error: errorMessage(error) })
      })
    return () => {
      active = false
    }
  }, [nonce, ...deps])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, reload }
}
