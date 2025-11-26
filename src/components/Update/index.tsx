import { useBoolean, useMemoizedFn, useMount } from 'ahooks'
import { Button, Flex, Modal } from 'antd'
import React from 'react'
import styles from './index.module.less'
import updateImg from './update.png'
import { ScrollArea } from '../ui/scroll-area'
import markdownit from 'markdown-it'

const updateDate = '2025-11-24'

const content = markdownit().render(`
### 【新功能支持】

1. 【碰撞预警】当无人机之间距离过近（20m）时，系统实时触发碰撞风险告警
2. 【3D电子围栏】支持设定电子围栏高度，构建三维围栏模型，并可在虚实融合界面中实时展示
3. 【空中回传】支持自主开启/关闭机场空中回传功能，实现机场设备在空中实时将图片等数据回传
4.【机场标定】支持车载类机场在位置移动后进行手动或自动位置标定
5. 【偏离航线告警】无人机偏离预设航线时实时告警提示
7. 【航线避开禁飞区】航线规划时自动识别并避开禁飞区域
8. 【机场3喊话器】新增对机场3喊话器及探照灯设备的适配与控制
9. 【视频标牌】支持开启视频标牌功能，可同时查看多设备的信息标牌，包括高度、速度、海拔等数据
10. 【路网航线】支持根据路网走向自动规划航线，确保航线沿道路上方智能生成与飞行
11. 【指点移动】支持在无人机视频画面中点击目标点实现无人机自动移动

### 【功能优化】

1. 【航点航线】支持以海拔高度为基准创建航线，提升复杂地形下的航线规划精度
2. 【航点动作】支持在航点设置录像开启/结束动作，并可单独设置每个航点的飞行速度
3. 【可飞行区域】可为机场设备设置并可视化展示可飞行区域
4. 【行动筛选优化】支持按行动类型（全部、普通行动、快处易赔行动/浙里快处易赔行动、建图行动）及行动状态（全部、未开始、进行中）进行筛选
5. 【航线优化】优化计划航线信息展示，支持在创建阶段预览航线内容
  `)

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
        centered
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
          <ScrollArea className="px-3 pt-3" style={{ maxHeight: '40vh' }}>
            <div
              className={'update-content'}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </ScrollArea>

          <div className="flex gap-3 m-3 justify-end">
            <Button type="primary" onClick={() => setFalse()}>
              我知道了
            </Button>
            <Button onClick={onCloseNextVersion}>不再提示</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default React.memo(Update)
