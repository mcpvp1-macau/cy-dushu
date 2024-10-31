const useElectricScale = (resetKey: number | string | boolean) => {
  const [enableScale, setEnableScale] = useState(0)
  const [tranformCss, setTransformCss] = useState('')
  const [originCenter, setOriginCenter] = useState([0, 0])

  const handleDrewScaleEnd = (rect: [number, number, number, number]) => {
    setEnableScale(2)
    const scaleXCenter = (rect[0] + rect[2]) / 2
    const scaleYCenter = (rect[1] + rect[3]) / 2

    const multi = Math.max(1 / (rect[2] - rect[0]), 1 / (rect[3] - rect[1]))

    setOriginCenter([scaleXCenter, scaleYCenter])
    setTransformCss(
      `translate(${(0.5 - scaleXCenter) * 100}%, ${
        (0.5 - scaleYCenter) * 100
      }%) scale(${multi})`,
    )
  }

  useEffect(() => {
    if (enableScale === 2) {
      setEnableScale(0)
      setTransformCss('')
    }
  }, [resetKey])

  return {
    enableScale,
    tranformCss,
    originCenter,
    setEnableScale,
    handleDrewScaleEnd,
  }
}

export default useElectricScale
