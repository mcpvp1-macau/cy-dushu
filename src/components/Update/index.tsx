import { useBoolean, useMemoizedFn, useMount } from 'ahooks'
import { Button, Flex, Modal } from 'antd'
import React from 'react'
import styles from './index.module.less'
import updateImg from './update.png'
import { ScrollArea } from '../ui/scroll-area'
import markdownit from 'markdown-it'

const updateDate = '2025-07-21'

const content = markdownit().render(`
### 【新功能支持】

1. 【操作日志】详细记录无人机的健康参数、指令操作记录、异常反馈等信息，便于事后追溯和分析。
2. 【基于路网的航线】根据地图路网信息自动规划航线，使无人机沿路网飞行，保障飞行安全。
3. 【全景拍摄】实现无人机的全景拍摄功能，获取更全面的图像信息。
4. 【航点动作】航点动作增加切换镜头模式为【录像模式】。
5. 【云台参数】支持对云台参数步进值速度调整。
6. 【视频自动保存】支持无人机视频自动保存。
7. 【上传倾斜摄影模型】支持上传倾斜摄影模型，叠加在地图上展示。
8. 【三维测距】支持对三维倾斜摄影模型进行测距操作。
9. 【断点续飞】支持在计划航线中，配置续飞功能，因电量不足导致任务未完成时点击续飞，可继续完成既定航线任务。
10. 【快速跳转三方平台】支持一键跳转第三方平台。

### 【功能优化】

1. 【一机一档】遵循一机一档要求，优化并补充无人机参数信息。
2. 【行动优化】支持不同类型行动的快速切换，例如日常巡检可快速切换为「快处易赔」行动；支持按类型筛选行动、支持仅查看行动中产生的照片。
3. 【计划航线优化】优化航线展示内容，清晰查看计划航线规划和执行进展。
4. 【历史图片优化】历史照片展示效果优化、支持快捷查看不同时间内的数据、支持批量下载图片。
5. 【航线接口】支持非现执法航线信息对接，包括航线ID、航线名称、航线开始、结束时间等。
6. 【航点配置喊话器】支持航点配置喊话内容，无人机到点执行预置的喊话内容。
7. 【快处易赔】支持快处易赔在取证中时可以进行编辑重复提交至大数据中心。
8. 【航线克隆接口】基于现有航线提供克隆（复制并新建）接口，允许用户修改其中任意内容后生成一条全新航线，原航线保持不变。
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
