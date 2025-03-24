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
      '【自动规划航线】制一个区域，综合考虑无人机镜头的俯仰角度和地面视野范围，计算出最佳航线，以最短的路径覆盖指定区域，满足搜索和巡逻等任务需求。',
      '【航点动作】支持航线中的航点动作增增加中心对焦功能。',
      '【告警设置】支持设置告警信息上图配置、告警声音配置以及一键清理告警信息。',
      // [
      //   '【科比特挂载设备控制】',
      //   [
      //     '喊话器：实时语音喊话、上传音频文件喊话、文字转语音喊话，语音、语速、喊话器方向控制等功能；',
      //     '云台：云台控制、云台参数调整、相机操作等功能；',
      //     '抛掷器：抛掷方向操作、抛投控制功能；',
      //     '警灯：警灯开启、关闭；闪烁方式确认；',
      //     '避障：不同方向避障开启、避障距离设置；',
      //   ],
      // ],
      // '【视频 OSD】为通过国标共享的视频增加 OSD 水印，水印为设备名称+北京时间；',
      // '【电磁态势】在地图上的电磁态势标牌信息中增加高度信息，表示该区域的信号强度是某个高度区间内的，这个高度时海拔高度；',
      // '【双链路】机场+5G双链路图传优化，链路切换更加平滑；',
      // '【平台级联】一级跨域看二级平台设备：实现一级平台跨域观看二级平台下设备的详情、飞参、视频等信息；一级跨域控制二级平台设备：实现一级平台跨域控制二级平台下的设备，包括飞行控制、云台控制等操作；',
    ],
  ],
  [
    '【功能优化】',
    [
      [
        '【驾驶舱优化】驾驶舱整体布局更新，实现更灵活的布局展示：',
        [
          '模块化布局自定义：各模块的任意拖拽功能，允许用户根据个人需求调整模块的布局和大小。',
          '算法模块、数据模块集成：在驾驶舱中新增算法模块，用户可以直接在驾驶舱内部署和运行算法，用户可以在驾驶舱内直接查看算法检测结果和相关数据信息，如拍照和视频数据。',
          'POI信息搜索与定位：支持在驾驶舱内搜索POI信息，并在地图上定位，用户可以点击地图上的POI，实现一键指点飞行，简化飞行操作流程。',
        ],
      ],
      '【虚实融合AR优化】丰富视频内叠加的虚拟数据类型，包括：航线/航点、区域、POI、点标等内容。',
      '【飞参中文】驾驶舱内飞参数据以中文的形式展示。',
      '【轨迹优化】切换「数据」模块选中设备默认不展示轨迹，切换数据模块才展示设备轨迹。',
      '【设备列表优化】选择在线无人机，在地图上同步展示在线的无人机/机场设备。',
      '【地图清晰度】地图清晰度根据电脑配置，可以选择不同的地图清晰度。',
      '【计划航线】优化计划航线设备不起飞操作。',
    ],
  ],
]
const updateDate = '2025-03-14'

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
