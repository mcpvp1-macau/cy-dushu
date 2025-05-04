import { useBoolean, useMemoizedFn, useMount } from 'ahooks'
import { Button, Flex, Modal } from 'antd'
import React from 'react'
import styles from './index.module.less'
import updateImg from './update.png'
import { ScrollArea } from '../ui/scroll-area'

type Node = string | [string, Node[]]

const content: Node[] = [
  [
    '【新功能支持】',
    [
      '【多任务协同】多无人机执行多个任务时，可在同一行动界面查看任务协作进程，以及镜头扫描区域的覆盖展示；',
      '【3D航线】实时呈现无人机飞行中的立体航线轨迹，直观展示三维空间内的飞行路径规划效果；',
      '【多设备详情展示】支持同时钉出多个无人机详情弹框，以便随时查看多无人机详细信息；',
      '【离线指点飞行】机场无人机支持离线指点飞行，在离线状态下也能被唤起并执行指点飞行任务；',
      '【战区地图】新增各战区地图显示，在地图上可视化展示各战区地图，通过颜色区分重点战区；',
      '【直升机航线】新增直升机航线地图上展示；',
      '【快门设置】新增无人机镜头快门速度设置；',
      '【点调对接】对接点调平台任务，平台接收、展示点调信息；',
      '【视频跟随】可设置视频小窗跟随设备，支持多设备视频跟随、支持视频小窗任意拖拽；',
      '【视频投影】支持将无人机实时视频投影在地图上，支持多设备同时投影；',
      '【群体作战】支持多无人机协同任务，对同一个区域进行自动规划航线、执行任务；',
      '【驾驶舱】支持驾驶舱内选择设备，快速切换驾驶舱。',
    ],
  ],
  [
    '【功能优化】',
    [
      '【搜星信息优化】对搜星信息展示进行优化，新增收敛状态、档位显示，并区分RTK与GPS搜星，助力用户更清晰了解信号状态；',
      '【航线设置优化】退出航线二次提醒保存航线；',
      '【航线设置】设置航线曲线过点不停，实现途经预设点位时无停顿连续通行，确保任务执行过程的流畅性。',
    ],
  ],
]
const updateDate = '2025-05-04'

const Update: React.FC = () => {
  const [open, { setFalse, setTrue }] = useBoolean(false)

  const onCloseNextVersion = useMemoizedFn(() => {
    localStorage.setItem('hideVersion', globalConfig?.version ?? '')
    setFalse()
  })

  useMount(() => {
    const version = globalConfig?.version
    const localVersion = localStorage.getItem('hideVersion')

    if (localVersion !== version) setTrue()
  })

  const location = useLocation()

  if (!globalConfig?.version || location.pathname.includes('/share')) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <Modal
        getContainer={false}
        open={open}
        footer={<></>}
        closable={false}
        style={{
          top: 'calc(50% - 60px - 40px - 12.5vh)',
        }}
      >
        <div className={styles.update}>
          <Flex className={styles.header}>
            <img src={updateImg} alt="logo" />

            <Flex className={styles.title} vertical gap={2}>
              <Flex className={styles.top}>更新提示</Flex>
              <Flex className={styles.bottom}>
                {globalConfig?.version} {updateDate}
              </Flex>
            </Flex>
          </Flex>
          <Flex className={styles.content} vertical>
            <ScrollArea style={{ maxHeight: '25vh', paddingRight: 20 }}>
              {content.map(([title, items], index) => (
                <Flex key={index} vertical>
                  <Flex className={styles.title}>
                    {index + 1}、{title}
                  </Flex>
                  <Flex className={styles.list} vertical gap={4}>
                    {Array.isArray(items) &&
                      items.map((item, index) => (
                        <div className={styles.item} key={index}>
                          <div className={styles.dot} />
                          {Array.isArray(item) ? (
                            <>
                              <Flex className={styles.text}>{item[0]}</Flex>
                              <Flex className={styles.list} vertical gap={4}>
                                {item[1].map((item, index) => (
                                  <Flex className={styles.item} key={index}>
                                    <div className={styles.dot} />
                                    <Flex className={styles.text}>{item}</Flex>
                                  </Flex>
                                ))}
                              </Flex>
                            </>
                          ) : (
                            <Flex className={styles.text}>{item}</Flex>
                          )}
                        </div>
                      ))}
                  </Flex>
                </Flex>
              ))}
            </ScrollArea>
          </Flex>

          <Flex className={styles.btnGroup} justify="flex-end" gap={12}>
            <Button type="primary" onClick={() => setFalse()}>
              我知道了
            </Button>
            <Button onClick={onCloseNextVersion}>不再提示</Button>
            {/* <Button type="primary" className={styles.btn} onClick={}>
          查看详情
        </Button> */}
          </Flex>
        </div>
      </Modal>
    </div>
  )
}

export default React.memo(Update)
