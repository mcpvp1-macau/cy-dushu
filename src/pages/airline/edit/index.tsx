import AirlineConfig from './components/AirlineConfig'
import AirpointConfig from './components/AirpointConfig'
import NotTakeoffWarning from './components/NotTakeoffWarning'
import DistanceWarning from './components/DistanceWarning'
import CameraView from './components/CameraView'
import CollapsedPage from '@/components/CollapsedPage'
import AirlineInfoCard from './components/InfoCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import useAirlineInit from './hooks/useAirlineInit'
import AirlineHeader from './components/AirlineHeader'
import useAirlineEditOpen from './hooks/useAirlineEditOpen'
import AirlineAirpointNavbar from './components/AirlineAirpointNavBar'
import BottomOperator from './components/ButtonOperator'
import { Spin } from 'antd'

type PropsType = {
  pilot?: ReactNode
}

/** 航线航点配置 */
const AirlineAirpointConfig: FC<PropsType> = memo(({ pilot }) => {
  const [activeNav, setActiveNav] = useState<number>(0)

  useAirlineEditOpen()
  const { isLoading } = useAirlineInit()

  return (
    <>
      <CollapsedPage>
        <div className="h-full flex flex-col overflow-hidden">
          <AirlineHeader />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AirlineAirpointNavbar
              activeNav={activeNav}
              onActiveNavChange={setActiveNav}
            />
            <ScrollArea className="grow flex flex-col px-3">
              <Spin spinning={isLoading}>
                {
                  {
                    0: (
                      <AirlineConfig info={<AirlineInfoCard />} pilot={pilot} />
                    ),
                    1: <AirpointConfig info={<AirlineInfoCard />} />,
                  }[activeNav]
                }
              </Spin>
            </ScrollArea>
            <BottomOperator disabled={isLoading} />
          </div>
        </div>
      </CollapsedPage>
      <DistanceWarning />
      <NotTakeoffWarning />
      <CameraView />
    </>
  )
})

/** 航线航点配置 */
export default AirlineAirpointConfig
