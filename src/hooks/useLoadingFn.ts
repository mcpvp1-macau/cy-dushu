import { useState } from 'react'

const useLoadingFn = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
): [T, boolean] => {
  const [loading, setLoading] = useState(false)

  const run = async (...args: any[]) => {
    setLoading(true)
    try {
      const res = await fn(...args)
      return res
    } finally {
      setLoading(false)
    }
  }

  return [run as T, loading] as const
}

export default useLoadingFn
