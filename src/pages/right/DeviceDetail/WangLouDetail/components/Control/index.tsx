import { Button, Flex, Form, InputNumber, Popconfirm, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import styles from './index.module.less'
import { useDebounceFn, useRafInterval } from 'ahooks'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { setDeviceProp } from '@/service/modules/device'
import ControlBar from './ControlBar'
import FormModal from '@/components/XForm/Modal'
import { use } from 'i18next'

export interface presetItem {
  presetPointId: string
  presetPointIndex: number
  presetPointName: string
  stayInterval: number
}

const speed = window.globalThis.wanglouSpeed || 1000

type PropsType = {
  /** 详情数据 */
  data: API_DEVICE.domain.Device
} & Partial<{}>

const Control: React.FC<PropsType> = (props) => {
  const { data } = props

  const [form] = Form.useForm()
  const [editField, setEditField] = useState<string>('')

  const postDevice = usePostDeviceService(
    data.deviceModel?.productKey || '',
    data.deviceId,
  )
  const disable = useWangLouControlRoomStore((s) => !s.hasControlPower)
  const controlTag = useWangLouControlRoomStore(s => s.uuid)
  const pitch = useWangLouControlRoomStore((s) => s.state.pitch)
  const yaw = useWangLouControlRoomStore((s) => s.state.yaw)
  const sendCommand = useWangLouControlRoomStore((s) => s.sendCommand)
  const turnCoefficient = useWangLouControlRoomStore(
    (s) => s.state.turnCoefficient,
  )
  const presetPointList = useWangLouControlRoomStore(
    (s) => s.state.presetPointList,
  )
  const [downKey, setDownKeyFun] = useState<Record<string, number> | null>(null)

  const [isSavePositionOpen, setIsSavePositionOpen] = useState(false)

  const setDownKey = useMemoizedFn((value) => {
    setDownKeyFun(value)
  })
  const resetPosition = async (data) => {
    // await postDevice('turn', data, '')
    sendCommand('service.turnBySpeedWithRetract.post', data)
  }

  const setPosition = async (data) => {
    await postDevice('goToPresetPoint', data, '')
    // sendCommand('turn', data)
  }

  const deletePosition = async (data) => {
    await postDevice('removePresetPoint', data, '')
    // sendCommand('turn', data)
  }

  const savePosition = (values) => {
    setIsSavePositionOpen(false)
    postDevice('savePresetPoint', values)
  }

  useRafInterval(
    () => {
      resetPosition(downKey)
    },
    downKey ? 60 : undefined,
  )

  const { t } = useTranslation()

  const columns = [
    {
      title: '',
      dataIndex: 'presetPointId',
      key: 'presetPointId',
      width: 10,
      render: () => (
        <div
          style={{
            width: 10,
          }}
        ></div>
      ),
    },
    {
      title: t('common.orderNo'),
      dataIndex: 'presetPointId',
      key: 'presetPointId',
      width: 80,
      render: (text: string, record: any, index: number) => (
        <div
          style={{
            width: 80,
            // height: 22,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            margin: 0,
          }}
        >
          {index + 1}
        </div>
      ),
    },
    {
      title: t('common.name'),
      dataIndex: 'presetPointName',
      key: 'presetPointName',
      width: 100,
    },
    {
      title: t('common.operation'),
      dataIndex: 'control',
      key: 'control',
      width: 100,

      render: (_: any, item: presetItem) => {
        return (
          <div className={styles.btnGroup}>
            <Button
              type="link"
              size="small"
              disabled={disable}
              className={styles.btn}
              onClick={() => {
                setPosition({ presetPointId: item.presetPointId, controlTag })
              }}
            >
              {t('common.use')}
            </Button>
            <Popconfirm
              title={t('message.warnning.delete')}
              onConfirm={() => {
                deletePosition({ presetPointId: item.presetPointId })
              }}
            >
              <Button danger type="link" size="small" disabled={disable}>
                {t('common.delete')}
              </Button>
            </Popconfirm>
          </div>
        )
      },
    },
  ]

  const [coefficient, setCoefficient] = useState(turnCoefficient)

  const { run: turn } = useDebounceFn(
    (value) => {
      setCoefficient(value)
      setDeviceProp(data.productKey, data.deviceId, {
        turnCoefficient: value,
      })
    },
    {
      wait: 500,
    },
  )

  useEffect(() => {
    setCoefficient(turnCoefficient)
  }, [turnCoefficient])

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
              label={`${t('common.pitch')}（45-135°）`}
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
        <Flex flex={1} justify="right" align="end" vertical gap={8}>
          <div>
            <div style={{ color: '#c7d1dc', fontSize: 12 }}>{t('common.stepNum')}</div>
            <div>
              <InputNumber
                size="small"
                value={coefficient}
                onChange={(e) => turn(e)}
                style={{ width: 80 }}
                disabled={disable}
              />
            </div>
          </div>
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
            {t('uav.gimbal.reset.title')}
          </Button>
          <Button
            className={styles.btn}
            disabled={disable}
            onClick={() => setIsSavePositionOpen(true)}
          >
            {t('common.savePosition')}
          </Button>
        </Flex>
      </Flex>
      <div className={styles.bottom}>
        <Table
          dataSource={presetPointList}
          columns={columns}
          pagination={false}
        ></Table>
      </div>

      <FormModal
        title={t('common.savePosition')}
        open={isSavePositionOpen}
        onConfirm={savePosition}
        items={[
          {
            label: t('common.preset.name.title'),
            name: 'presetPointName',
            type: 'input',
            rules: [{ required: true, message: t('common.preset.name.tip') }],
          },

          {
            label: t('common.preset.stay.name'),
            name: 'stayInterval',
            type: 'input-number',
            rules: [{ required: true, message: t('common.preset.stay.tip') }],
            otherProps: { style: { width: '100%' } },
          },
          {
            label: t('common.preset.index.name'),
            name: 'presetPointIndex',
            type: 'input-number',
            rules: [{ required: true, message: t('common.preset.index.tip') }],
            otherProps: { style: { width: '100%' } },
          },
        ]}
      ></FormModal>
    </Flex>
  )
}

export default React.memo(Control)
