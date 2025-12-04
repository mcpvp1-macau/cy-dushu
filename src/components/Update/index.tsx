import { useBoolean, useMemoizedFn, useMount } from 'ahooks'
import { Button, Flex, Modal } from 'antd'
import React from 'react'
import styles from './index.module.less'
import updateImg from './update.png'
import { ScrollArea } from '../ui/scroll-area'
import markdownit from 'markdown-it'

const updateDate = '2025-12-03'

const content = markdownit().render(`
1. 低电量返航安全提示强化
当无人机因低电量自动返航，被紧急停止等操作中断后若继续消耗至危险电量，系统将强提醒：“无人机接近强制降落电量，请立即手动飞行至空旷区域！”
2. 无人机离舱超时告警
无人机在非任务状态下离舱超过 10 分钟，系统将自动推送告警，提醒关注设备状态。
3. 非满电起飞风险提示
无人机在电量不足 90% 的情况下起飞，将提示“非满电状态起飞”，提醒注意飞行风险。
4. 机库舱盖超时打开告警
机库舱盖持续打开超过 30 分钟时，系统将自动触发告警。
5. 电池循环次数健康提示
当设备电池达到自身循环次数阈值后，系统将强提示关注电池健康状态。
6. 机库设备标签管理
支持为机库类设备添加状态标签，用于标记维修状态。
7. 告警信息查看与处理管理
支持对历史告警进行查看、处理标记，支持按设备查询告警记录，提升告警管理效率与可追溯性。
8. 电池循环数等信息查看
新增电池循环次数、返航电量阈值、强制降落电量阈值的展示。
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
