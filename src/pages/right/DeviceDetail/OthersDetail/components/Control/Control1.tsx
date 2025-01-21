import { Flex, Form, InputNumber } from 'antd'
import React, { useEffect, useState } from 'react'
import styles from './index.module.less'
import ControlBar from './ControlBar'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'

export interface presetItem {
  presetPointId: string
  presetPointIndex: number
  presetPointName: string
  stayInterval: number
}

const speed = window.globalThis.wanglouSpeed || 50

type PropsType = {
  /** 详情数据 */
  data: API_DEVICE.domain.Device
} & Partial<{}>

const Control1: React.FC<PropsType> = () => {

  const [form] = Form.useForm()
  const [editField, setEditField] = useState<string>('')

  const { t } = useTranslation()


  const disable = false // useOthersControlRoomStore((s) => !s.hasControlPower)
  const pitch = useOthersControlRoomStore((s) => s.state.pitch)
  const yaw = useOthersControlRoomStore((s) => s.state.yaw)
  const sendCommand = useOthersControlRoomStore((s) => s.sendCommand)


  const setDownKey = useMemoizedFn((value) => {
    sendCommand(
      'service.turnBySpeed.post',
      value
        ? {
            ...value,
            enable: 'true',
          }
        : {
            pitch: 0,
            yaw: 0,
            enable: 'false',
          },
    )
  })
  const resetPosition = async (data) => {
    setDownKey(data)
  }

  // const turn = (data) => {
  //   sendCommand('service.turnBySpeed.post', data)
  // }

  useEffect(() => {
    let values = {}
    if (editField === 'yaw') {
      values = {
        pitch: pitch / 100,
      }
    } else if (editField === 'pitch') {
      values = {
        yaw: yaw / 100,
      }
    } else {
      values = {
        yaw: yaw / 100 || 0,
        pitch: pitch / 100 || 45,
      }
    }
    form.setFieldsValue(values)
  }, [yaw, pitch])

  return (
    <Flex gap={12} vertical className={styles.control}>
      <Flex className={styles.top} align="center" justify="space-between">
        <Flex flex={1} justify="left" className={styles.left}>
          <Form
            form={form}
            disabled={disable}
            className={styles.controlForm}
            size="small"
            layout="vertical"
          >
            <Form.Item
              label={`${t('common.yaw')}（0-360°）`}
              name="yaw"
              style={{ marginTop: 12 }}
            >
              <InputNumber<number>
                min={0}
                max={360}
                onFocus={() => {
                  setEditField('yaw')
                }}
                onBlur={() => {
                  setEditField('')
                }}
                onPressEnter={() => {
                  resetPosition({
                    yaw: Math.trunc(form.getFieldValue('yaw') * 100),
                    pitch: Math.trunc(form.getFieldValue('pitch') * 100),
                  })
                }}
              />
            </Form.Item>
            <Form.Item
              label={`${t('common.pitch')}（-25-80°）`}
              name="pitch"
              style={{ marginTop: 24 }}
            >
              <InputNumber<number>
                min={45}
                max={135}
                onFocus={() => {
                  setEditField('pitch')
                }}
                onBlur={() => {
                  setEditField('')
                }}
                onPressEnter={() => {
                  resetPosition({
                    yaw: Math.trunc(form.getFieldValue('yaw') * 100),
                    pitch: Math.trunc(form.getFieldValue('pitch') * 100),
                  })
                }}
              />
            </Form.Item>
          </Form>
        </Flex>
        <Flex flex={1} justify="center">
          <ControlBar speed={speed} setDownKey={setDownKey} />
        </Flex>
        {/* <Flex flex={1} justify="right" align="end" vertical gap={8}>
          <Button
            className={styles.btn}
            disabled={disable}
            onClick={() =>
              resetPosition({
                yaw: 0,
                pitch: 9000,
              })
            }
          >
            复位
          </Button>
        </Flex> */}
      </Flex>
    </Flex>
  )
}

export default React.memo(Control1)
