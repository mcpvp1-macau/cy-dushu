import IconFlightArea from '@/assets/icons/jsx/IconFlightArea'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { getGimbalInfo } from '@/constant/uav/gimbalV2'
import { DeviceEnum } from '@/enum/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getAllDeviceListV3, getDeviceDetail } from '@/service/modules/device'
import { getEventDetail } from '@/service/modules/events'
import useGlobalMapStore from '@/store/map/useGlobalMap.store'
import { OverlayPolygonPrimitive } from '@/utils/customPrimitive/OverlayPrimitive'
import { calcFovRadiation } from '@/utils/fov'
import { circle, toMercator, toWgs84 } from '@turf/turf'
import { useDebounceFn } from 'ahooks'
import { Form } from 'antd'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { customAlphabet } from 'nanoid'
import { lowercase } from 'nanoid-dictionary'

import { get_polygon_area_wayline } from '@/wasm/area_wayline/area_wayline'
import { createActionItem } from '@/service/modules/action-item'
import { createInitAirlineConfig } from '@/store/wayline/uav-airline/helper'

type PropsType = {
  actionId: number
  eventId: string
}

const AddEventResolveTask: FC<PropsType> = memo(({ actionId, eventId }) => {
  const msgApi = useAppMsg()

  const qc = useQueryClient()

  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const { data: deviceList, isFetching: deviceLoading } = useQuery(
    {
      queryKey: ['event-resolve-uav-list'],
      queryFn: () =>
        getAllDeviceListV3({
          type: DeviceEnum.UAV,
        }),
      select: (resp) => resp.data.rows ?? [],
      enabled: open,
    },
    qc,
  )

  const { data: event } = useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: () => getEventDetail(eventId),
    select: (resp) => resp.data,
  })

  const deviceOptions = useMemo(
    () =>
      deviceList?.map((device) => ({
        label: device.deviceName,
        value: device.deviceId,
      })) ?? [],
    [deviceList],
  )

  const formItems = useMemo(
    () =>
      [
        {
          label: '侦查半径（米）',
          name: 'detectRadius',
          type: 'input-number',
          rules: [
            {
              required: true,
              message: '请输入侦查半径',
            },
          ],
          otherProps: {
            min: 0,
            precision: 0,
          },
        },
        {
          label: '航线高度',
          name: 'airlineHeight',
          type: 'input-number',
          rules: [
            {
              required: true,
              message: '请输入航线高度',
            },
          ],
          otherProps: {
            min: 0,
          },
        },
        {
          label: '返航高度',
          name: 'goHomeHeight',
          type: 'input-number',
          rules: [
            {
              required: true,
              message: '请输入返航高度',
            },
          ],
          otherProps: {
            min: 0,
          },
        },
        {
          label: '全局航线速度',
          name: 'globalSpeed',
          type: 'input-number',
          rules: [
            {
              required: true,
              message: '请输入全局航线速度',
            },
          ],
          otherProps: {
            min: 0,
          },
        },
        {
          label: '设备（无人机）',
          name: 'deviceId',
          type: 'select',
          options: deviceOptions,
          rules: [
            {
              required: true,
              message: '请选择无人机设备',
            },
          ],
          otherProps: {
            loading: deviceLoading,
            optionFilterProp: 'label',
            showSearch: true,
          },
        },
      ] as XFormItem[],
    [deviceLoading, deviceOptions],
  )

  const viewer = useGlobalMapStore((s) => s.viewer)

  const [scanArea, setScanArea] = useState<[number, number][] | null>([])
  const [wayline, setWayline] = useState<[number, number, number][] | null>(
    null,
  )
  const takeoffRefPointRef = useRef<[number, number, number] | null>(null)

  useEffect(() => {
    if (!scanArea || scanArea.length < 3 || !viewer) {
      return
    }

    const e = new OverlayPolygonPrimitive({
      asynchronous: false,
      isGround: true,
      styleOptions: {
        fill: '#4c90f0',
        fillOpacity: 0.15,
        stroke: '#4c90f0',
        strokeStyle: 'solid',
        strokeWeight: 1,
        label: '',
      },
    })
    e.positions = scanArea

    viewer.scene.primitives.add(e)

    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(e)
      })
    }
  }, [scanArea, viewer])

  useEffect(() => {
    if (!wayline || wayline.length < 2 || !viewer) {
      return
    }
    const e = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(wayline.flat()),
        width: 2,
        material: Cesium.Color.fromCssColorString('#03D68F'),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [wayline, viewer])

  useEffect(() => {
    if (!open) {
      setScanArea(null)
      setWayline(null)
    }
  }, [open])

  const { run: handleChange } = useDebounceFn(
    async () => {
      setScanArea(null)
      const values = form.getFieldsValue()
      const radius = values.detectRadius || 0

      if (radius <= 10) {
        return
      }

      const scanArea = circle([event!.longitude!, event!.latitude!], radius, {
        units: 'meters',
      })

      const coods = scanArea.geometry.coordinates[0] as [number, number][]
      setScanArea(coods)

      if (
        ['airlineHeight', 'goHomeHeight', 'deviceId'].some(
          (key) => !values[key],
        )
      ) {
        return
      }

      const groundHeight =
        (await viewer?.scene.globe.getHeight(
          Cesium.Cartographic.fromDegrees(event!.longitude!, event!.latitude!),
        )) ?? 0

      const uavDistanceFromGround = values.airlineHeight

      const resp = await getDeviceDetail(values.deviceId)
      const uavDetail = resp.data
      if (!uavDetail) {
        msgApi.error('获取无人机详情失败，无法规划航线，请检查后重试')
        return
      }

      const cameraType = uavDetail.properties.cameraType

      const gimbal = getGimbalInfo(cameraType)

      const hFov = calcFovRadiation(gimbal.wide.focal, gimbal.wide.width, 1)

      const lat = uavDetail.properties.latitude ?? 30
      const w =
        Math.tan(hFov / 2) *
        uavDistanceFromGround *
        Math.abs(Math.cos((lat * Math.PI) / 180)) *
        2

      // 75 表示 75% 的横向覆盖率
      const interval = w * (1 - 75 / 100)

      const mercatorCoords = toMercator({
        type: 'Polygon',
        coordinates: [coods],
      })
      const takeoff = toMercator([
        uavDetail.properties?.longitude ?? 120,
        uavDetail.properties?.latitude ?? 30,
      ])
      takeoffRefPointRef.current = [
        uavDetail.properties?.longitude ?? 120,
        uavDetail.properties?.latitude ?? 30,
        groundHeight,
      ]

      console.log('uavDistanceFromGround', uavDistanceFromGround)

      const area_path = get_polygon_area_wayline(
        mercatorCoords.coordinates[0].slice(0, -1).map((e) => ({
          x: e[0],
          y: e[1],
        })),
        [],
        interval,
        {
          x: takeoff[0],
          y: takeoff[1],
        },
      )

      const final_path = toWgs84({
        type: 'LineString',
        coordinates: area_path.map((e) => [e.x, e.y]),
      })

      setWayline(
        final_path.coordinates.map(
          (e) =>
            [
              e[0],
              e[1],
              (values.airlineHeight +
                // values.takeoffHeight +
                groundHeight) as number,
            ] as const,
        ),
      )
    },
    { wait: 300, trailing: true },
  )

  const handleConfirm = useMemoizedFn(async (values) => {
    const nanoid = customAlphabet(lowercase, 5)
    const name = `区域侦查任务(${nanoid()})`
    const taskBasic = {
      ...createInitAirlineConfig(),
      coverage: 50,
      mainK: 1e9 - 1,
      polygon: scanArea,
      waylineType: 'area_waypoint',
      globalWaypointTurnMode: 'toPointAndPassWithContinuityCurvature',
      takeOffSecurityHeight: values.airlineHeight,
      height: values.airlineHeight,
      wideGSD: 5,
      takeOffRefPoint: takeoffRefPointRef.current,
      speed: values.globalSpeed,
      globalRTHHeight: values.goHomeHeight,
      taskName: name,
    }

    const parameters = {
      spaces: [
        {
          spaceId: 'MAP',
          spaceType: 'MAP',
          positions: wayline!.map((e, i) => ({
            positionIndex: i,
            positionName: '航点' + i,
            actions: [] as any[],
            pointX: e[0],
            pointY: e[1],
            pointZ: values.airlineHeight,
          })),
        },
      ],
    }

    parameters.spaces[0].positions[0].actions.push(
      {
        config: {
          y: -75,
        },
        type: 'CAMERA_POSITION',
      },
      {
        config: {
          focalLength: 2,
        },
        type: 'ZOOM',
      },
    )

    const data: Record<string, any> = {
      actionId: actionId,
      actionItemName: name,
      deviceType: 'UAV',
      deviceIds: values.deviceId,
      taskTemplateInfo: {
        taskBasic: JSON.stringify(taskBasic),
        defaultDeviceId: values.deviceId,
        parameters: parameters,
      },
    }

    // console.log('data', data)
    await createActionItem(data)
    await qc.invalidateQueries({
      queryKey: ['action', actionId + '', 'items'],
    })
    setOpen(false)
  })

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <IconButton
        disabled={!event}
        toolTipProps={{ title: '区域侦查' }}
        onClick={() => {
          setOpen(true)
          handleChange()
        }}
      >
        <IconFlightArea />
      </IconButton>

      <FormModal
        form={form}
        title="区域侦查"
        items={formItems}
        open={open}
        initialValues={{
          // takeoffHeight: 1,
          airlineHeight: 100,
          goHomeHeight: 100,
          globalSpeed: 10,
        }}
        localInitialValues={{ key: 'event-area-detect' }}
        confirmDisable={!wayline?.length || wayline.length < 2}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        onValuesChange={handleChange}
      />
    </div>
  )
})

AddEventResolveTask.displayName = 'AddEventResolveTask'

export default AddEventResolveTask
