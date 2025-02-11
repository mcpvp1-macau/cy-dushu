import GroundPolygonPolyline from '@/components/map/GroundPolygonPolyline'
import axios from 'axios'
import React from 'react'

type PropsType = {
  scanRangeProfile: string
}

/**
 * 雷达范围
 */
const Radar: React.FC<PropsType> = React.memo(({ scanRangeProfile }) => {
  // const [positions, setPositions] = useState([])

  const queryClient = useQueryClient()

  const { data: positions = [] } = useQuery(
    {
      queryKey: ['scanRangeProfile', scanRangeProfile],
      queryFn: () =>
        axios(`/storage/${scanRangeProfile}?timestamp=${dayjs().valueOf()}`),
      select: (res) => res?.data?.data?.[0] || [],
    },
    queryClient,
  )

  return (
    <>
      <GroundPolygonPolyline positions={positions} />
    </>
  )
})

export default Radar
