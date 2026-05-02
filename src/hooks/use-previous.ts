import { useEffect, useRef } from 'react'

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined) // 修改这里：添加初始值 undefined

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
