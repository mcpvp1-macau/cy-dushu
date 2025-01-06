import { Button, Flex, Form, InputNumber, Popconfirm, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import styles from './index.module.less'
import { useDebounceFn, useRafInterval } from 'ahooks'
import controlBG from '@/assets/imgs/control/buttonBg.png'
import CircleButton from '../../../UavDetail/components/UavControlPanel/CircleButton'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { setDeviceProp } from '@/service/modules/device'

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

  const postDevice = usePostDeviceService(data.productKey, data.deviceId)
  const disable = useWangLouControlRoomStore((s) => !s.hasControlPower)
  const pitch = useWangLouControlRoomStore((s) => s.state.pitch)
  const yaw = useWangLouControlRoomStore((s) => s.state.yaw)
  const turnCoefficient = useWangLouControlRoomStore(
    (s) => s.state.turnCoefficient,
  )
  const presetPointList = useWangLouControlRoomStore(
    (s) => s.state.presetPointList,
  )
  const [downKey, setDownKey] = useState<Record<string, number> | null>(null)
  const resetPosition = async (data) => {
    await postDevice('turn', data, '')
  }

  const setPosition = async (data) => {
    await postDevice('goToPresetPoint', data, '')
  }

  const deletePosition = async (data) => {
    await postDevice('removePresetPoint', data, '')
  }

  useRafInterval(
    () => {
      resetPosition(downKey)
    },
    downKey ? 60 : undefined,
  )

  const controls1 = [
    ['上', 'left-1/2 -translate-x-1/2', { yaw: 0, pitch: speed }],
    ['下', 'left-1/2 bottom-0 -translate-x-1/2', { yaw: 0, pitch: -speed }],
    ['左', 'top-1/2 -translate-y-1/2', { yaw: -speed, pitch: 0 }],
    ['右', 'top-1/2 right-0 -translate-y-1/2', { yaw: speed, pitch: 0 }],
  ] as const

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
      title: '序号',
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
      title: '名称',
      dataIndex: 'presetPointName',
      key: 'presetPointName',
      width: 100,
    },
    {
      title: '操作',
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
                setPosition({ presetPointId: item.presetPointId })
              }}
            >
              调用
            </Button>
            <Popconfirm
              title="是否删除!"
              onConfirm={() => {
                deletePosition({ presetPointId: item.presetPointId })
              }}
            >
              <Button danger type="link" size="small" disabled={disable}>
                删除
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
              label="水平角（0-360°）"
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
              label="俯仰角（45-135°）"
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
          <div className="relative h-[100px] w-[100px] select-none">
            <img className="size-full" src={controlBG} alt="" />
            <div className="absolute inset-1">
              {controls1.map(([title, className, payload]) => (
                <CircleButton
                  key={title}
                  className={className}
                  disabled={disable}
                  onMouseDown={() => {
                    setDownKey(payload)
                  }}
                  onMouseUp={() => {
                    setDownKey(null)
                  }}
                  onMouseLeave={() => {
                    setDownKey(null)
                  }}
                >
                  {title}
                </CircleButton>
              ))}
            </div>
          </div>
        </Flex>
        <Flex flex={1} justify="right" align="end" vertical gap={8}>
          <div>
            <div style={{ color: '#c7d1dc', fontSize: 12 }}>步进值</div>
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
          <Button className={styles.btn} disabled={disable} onClick={() => {}}>
            复位
          </Button>
          <Button className={styles.btn} disabled={disable} onClick={() => {}}>
            保存预置位
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
    </Flex>
  )
}

export default React.memo(Control)
