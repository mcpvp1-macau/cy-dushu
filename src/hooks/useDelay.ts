const useDelayState = (ms: number) => {
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOk(true)
    }, ms)
    return () => clearTimeout(timer)
  }, [ms])

  return ok
}

export default useDelayState
