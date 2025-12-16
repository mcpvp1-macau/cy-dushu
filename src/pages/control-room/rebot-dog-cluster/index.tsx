import { memo, useMemo, type FC } from 'react'
import IconBack from '@/assets/icons/jsx/IconBack'
import IconButton from '@/components/ui/button/IconButton'
import { useNavigate } from 'react-router'
import VideoWall from './components/VideoWall'
import ClusterMap from './components/ClusterMap'
import {
  ClusterControlButtons,
  ClusterControlSender,
  ClusterModeButtons,
  ClusterParams,
} from './components/ClusterControl'
import { useRebotDogClusterStore } from '@/store/control-room/useRebotDogCluster.store'
import RobotDogClient from './components/RobotDogClient'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { useSearchParams } from 'react-router-dom'
import { useMemoizedFn } from 'ahooks'
import { getDeviceDetail } from '@/service/modules/device'
import { useAppMsg } from '@/hooks/useAppMsg'

type PropsType = unknown

const PageRebotDogCluster: FC<PropsType> = memo(() => {
  const [initialized, setInitialized] = useState(false)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const msgApi = useAppMsg()
  const dogs = useRebotDogClusterStore((s) => s.dogs)
  const addDog = useRebotDogClusterStore((s) => s.addDog)

  const fetchDogDetail = useMemoizedFn(async (deviceId: string) => {
    const exists = useRebotDogClusterStore
      .getState()
      .dogs.some((dog) => dog.deviceId === deviceId)

    if (exists) {
      return
    }

    try {
      const detailRes = await getDeviceDetail(deviceId)
      const detail = detailRes.data

      const productKey = detail.productKey || detail.deviceModel?.productKey

      if (!productKey) {
        msgApi?.error?.('无法获取设备产品信息')
        return
      }

      const videoId =
        detail.properties?.videoList?.[0]?.videoId ||
        detail.videos?.[0]?.videoId

      addDog(
        {
          deviceId,
          deviceName: detail.deviceName || deviceId,
          productKey,
          videoId,
        },
        detail.properties,
      )
    } catch (_error) {
      msgApi?.error?.('加载机器狗信息失败')
    }
  })

  useEffect(() => {
    const currentDogs = new URLSearchParams(window.location.search)
      .get('currentDogs')
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (!currentDogs || currentDogs.length === 0) {
      setInitialized(true)
      return
    }

    Promise.all(currentDogs.map((id) => fetchDogDetail(id))).finally(() => {
      setInitialized(true)
    })
  }, [fetchDogDetail])

  useEffect(() => {
    if (!initialized) {
      return
    }

    const dogIds = dogs.map((dog) => dog.deviceId).join(',')
    const nextParams = new URLSearchParams(searchParams)

    if (dogIds) {
      nextParams.set('currentDogs', dogIds)
    } else {
      nextParams.delete('currentDogs')
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [dogs, initialized, searchParams, setSearchParams])

  const clients = useMemo(
    () => dogs.map((dog) => <RobotDogClient key={dog.deviceId} dog={dog} />),
    [dogs],
  )

  return (
    <div className="page-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-ground-5 bg-ground-1/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <IconButton className="text-base" onClick={() => navigate(-1)}>
            <IconBack />
          </IconButton>
          <div>
            <p className="font-medium">机器狗集群驾驶舱</p>
            <p className="text-xs opacity-70">
              已加入 {dogs.length} 台，支持多选同时操控
            </p>
          </div>
        </div>
        <div className="text-xs opacity-70">
          WGS84 地图同步显示全部机器狗位置
        </div>
      </header>
      <main className="flex grow overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
            <VideoWall />
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-ground-5/40" />
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="h-full relative">
              <ClusterMap />
              <div className="absolute left-0 right-0 bottom-4 px-4 z-10">
                <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-3">
                  <ClusterModeButtons side="left" />
                  <div className="flex flex-1 min-w-[300px] flex-col items-center gap-3 md:flex-row md:items-end md:justify-center">
                    <div className="bg-ground-1/80 backdrop-blur rounded border border-ground-5 px-3 py-2 shadow">
                      <ClusterControlButtons />
                    </div>
                    <ClusterParams />
                  </div>
                  <ClusterModeButtons side="right" />
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <ClusterControlSender />
      {clients}
    </div>
  )
})

PageRebotDogCluster.displayName = 'PageRebotDogCluster'

export default PageRebotDogCluster
