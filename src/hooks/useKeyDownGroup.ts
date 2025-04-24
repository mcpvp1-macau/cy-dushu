import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { useMemoizedFn, useUpdate } from 'ahooks'

type OptionsProps = {
  /**  监听的元素 (默认window) */
  el?: MutableRefObject<HTMLElement>
  /**  KeyboardEvent 中的 key 属性, string 类型为小写 */
  keyFilter?: (string | number)[]
  clearOnOtherKey?: boolean
  /**  回调事件 */
  event?: (e: KeyboardEvent) => void
}

/** 获取当前按下的所有组合键 */
export const useKeyDownGroup = ({
  el,
  keyFilter,
  clearOnOtherKey,
  event,
}: OptionsProps) => {
  const keys = useRef<Set<string>>(new Set())
  const keyFilterSet = useMemo(
    () =>
      new Set(
        keyFilter?.map((e) => {
          if (typeof e === 'number') {
            return e
          }
          return e.toLowerCase()
        }),
      ),
    [keyFilter],
  )
  const metaDown = useRef(false)
  const update = useUpdate()

  const element = el?.current ?? window
  const keyDownHandler = useMemoizedFn((e: Event) => {
    if (metaDown.current) {
      return
    }
    if (e.target instanceof HTMLInputElement) {
      return
    }
    let k1 = (e as KeyboardEvent).key
    if (k1 === 'Meta') {
      metaDown.current = true
      keys.current.clear()
      return
    }
    if (typeof k1 === 'string') {
      k1 = k1.toLowerCase()
    }
    const k2 = (e as KeyboardEvent).keyCode
    if (
      keyFilterSet.size > 0 &&
      !keyFilterSet.has(k1) &&
      !keyFilterSet.has(k2)
    ) {
      if (clearOnOtherKey) {
        keys.current.clear()
        update()
      }
      return
    }

    if (keys.current.has(k1)) return
    keys.current.add(k1)
    update()
    event?.(e as KeyboardEvent)
  })

  const keyUpHandler = useMemoizedFn((e: Event) => {
    let k1 = (e as KeyboardEvent).key
    if (k1 === 'Meta') {
      metaDown.current = false
      keys.current.clear()
      return
    }
    if (typeof k1 === 'string') {
      k1 = k1.toLowerCase()
    }
    const k2 = (e as KeyboardEvent).keyCode
    if (
      keyFilterSet.size > 0 &&
      !keyFilterSet.has(k1) &&
      !keyFilterSet.has(k2)
    ) {
      return
    }
    if (!keys.current.has(k1)) return
    keys.current.delete(k1)
    update()
    event?.(e as KeyboardEvent)
  })

  const blurHandler = useMemoizedFn(() => {
    keys.current.clear()
    update()
  })

  useEffect(() => {
    element.addEventListener('keydown', keyDownHandler)
    element.addEventListener('keyup', keyUpHandler)
    element.addEventListener('blur', blurHandler)
    element.addEventListener('mousedown', blurHandler)
    return () => {
      element.removeEventListener('keydown', keyDownHandler)
      element.removeEventListener('keyup', keyUpHandler)
      element.removeEventListener('blur', blurHandler)
      element.removeEventListener('mousedown', blurHandler)
    }
  }, [element, keyDownHandler, keyUpHandler])

  return keys.current
}
