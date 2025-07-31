import { getSpaceDistance } from '@/utils/geo-math'
import { useLatest } from 'ahooks'

/** 是否接近目标 */
export const useDistanceIsClose = (
  distance: number,
  lng: number,
  lat: number,
  height: number,
  lng2: number,
  lat2: number,
  height2: number = 0,
) => {
  const [isShow, setIsShow] = useState(false)
  const latestIsShow = useLatest(isShow)

  useEffect(() => {
    const d = getSpaceDistance([
      [lng, lat, height],
      [lng2, lat2, height2],
    ])
    if (latestIsShow.current !== d < distance) {
      setIsShow(d < distance)
    }
  }, [distance, lng, lat, height, lng2, lat2, height2])

  return isShow
}
