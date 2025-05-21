type PropsType = {
  children?: React.ReactNode
}

/** 延迟渲染 */
const DeferredRender: FC<PropsType> = ({ children }) => {
  const [render, setRender] = useState(false)

  useEffect(() => {
    setRender(true)
  }, [])

  if (!render) {
    return null
  }

  return children
}

DeferredRender.displayName = 'DeferredRender'

export default DeferredRender
