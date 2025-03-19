import WaylineConfig from './components/WaylineConfig'
import WaypointConfig from './components/WaypointConfig'
// import NotTakeoffWarning from './components/NotTakeoffWarning'
// import DistanceWarning from './components/DistanceWarning'
import CollapsedPage from '@/components/CollapsedPage'
import { ScrollArea } from '@/components/ui/scroll-area'
// import BottomOperator from './components/ButtonOperator'
import { Spin } from 'antd'
import Navbar from './components/Navibar'
import RebotDogInfoCard from './components/InfoCard'
import Header from './components/Header'
import useWaylineEditOpen from './hooks/useWaylineEditOpen'

type PropsType = {
  pilot?: ReactNode
}

/** 航线航点配置 */
const RebotDogWaylineConfig: FC<PropsType> = memo(() => {
  const [activeNav, setActiveNav] = useState<number>(0)

  useWaylineEditOpen()

  return (
    <>
      <CollapsedPage>
        <div className="h-full flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar activeNav={activeNav} onActiveNavChange={setActiveNav} />
            <ScrollArea className="grow flex flex-col px-3">
              <Spin spinning={false}>
                <RebotDogInfoCard />
                {
                  {
                    0: <WaylineConfig />,
                    1: <WaypointConfig />,
                  }[activeNav]
                }
              </Spin>
            </ScrollArea>
            {/* <BottomOperator disabled={isLoading} /> */}
          </div>
        </div>
      </CollapsedPage>
      {/* <DistanceWarning />
      <NotTakeoffWarning /> */}
    </>
  )
})

/** 航线航点配置 */
export default RebotDogWaylineConfig
