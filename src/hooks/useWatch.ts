const useWatch = <T>(
  value: T,
  callback: (val: T, oldVal: T) => unknown,
  immediate = false,
) => {
  const ref = useRef<T>(immediate ? ({} as T) : value)
  if (ref.current !== value) {
    callback(value, ref.current)
    ref.current = value
  }
}

export default useWatch
