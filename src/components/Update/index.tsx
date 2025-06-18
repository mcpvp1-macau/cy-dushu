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
      '【航点速度】在航线规划中，可单独设置每个航点的速度，满足不同飞行需求；',
      '【红外镜头模式】支持白热、黑热、描红、医疗、彩虹1、铁红、北极、熔岩、热铁、彩虹2等红外镜头模式（仅限机场类无人机）；',
      '【航线安全检测】 结合地形高度对航线进行安全检测，提示未超过地形高度的航段；',
      '【照片贴图】无人机拍摄的照片可在地图上以贴图形式展示；',
      '【机库视频无人观看设置】无人观看时，无人机机库视频默认不拉取视频流，节省资源；',
      '【按周执行计划航线】 支持按周设置计划航线的执行频率，可选择具体时间；',
      '【快速切换快处易赔】无人机在进行计划任务、航线任务、手动飞行时，支持一键切换行动类型至【快处易赔】行动，执行快处任务；',
      '【机场2快处易赔】支持机场2（无激光测距仪）设备进行快处易赔任务。',
    ],
  ],
  [
    '【功能优化】',
    [
      '【战区地图优化】战区地图可搜索、快速定位，并支持自定义显示/隐藏战区；',
      '【告警事件快速查看】 支持左右点击快速切换下一个告警事件；',
      '【飞参信息复制】 支持一键复制无人机飞参信息；',
      '【视频播放优化】解决视频流因网络原因异常无法播放问题。',
    ],
  ],
]
const updateDate = '2025-06-17'

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
