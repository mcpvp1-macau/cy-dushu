import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { calcCameraParameters, getGimbalInfo } from '@/constant/uav/gimbalV2'
import { DeviceEnum } from '@/enum/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getAllDeviceListV3, getDeviceDetail } from '@/service/modules/device'
import { createActionItem } from '@/service/modules/action-item'
import { addAction } from '@/service/modules/action'
import useGlobalMapStore from '@/store/map/useGlobalMap.store'
import { createInitAirlineConfig } from '@/store/wayline/uav-airline/helper'
import { OverlayPolygonPrimitive } from '@/utils/customPrimitive/OverlayPrimitive'
import { calcFovRadiation } from '@/utils/fov'
import { circle, toMercator, toWgs84 } from '@turf/turf'
import { useDebounceFn } from 'ahooks'
import { Form } from 'antd'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { customAlphabet } from 'nanoid'
import { lowercase, numbers } from 'nanoid-dictionary'
import { get_polygon_area_wayline } from '@/wasm/area_wayline/area_wayline'
import dayjs from 'dayjs'
import IconAreaDetect from '@/assets/icons/jsx/IconAreaDetect'

type CenterPoint = {
  lng: number
  lat: number
}

type PropsType = {
  open: boolean
  onClose: () => void
  center?: CenterPoint | null
  actionId?: number
}

const AreaDetectModal: FC<PropsType> = memo(
  ({ open, onClose, center, actionId }) => {
    const msgApi = useAppMsg()
    const qc = useQueryClient()
    const navigate = useNavigate()

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
          {
            label: '变焦倍数',
            name: 'zoomFocalLength',
            type: 'input-number',
            otherProps: {
              min: 1,
              max: 200,
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
        const values = form.getFieldsValue()
        const radius = values.detectRadius || 0

        if (!center || radius <= 10) {
          setScanArea(null)
          setWayline(null)
          return
        }

        const scanArea = circle([center.lng, center.lat], radius, {
          units: 'meters',
        })

        const coods = scanArea.geometry.coordinates[0] as [number, number][]
        setScanArea(coods)

        if (
          ['airlineHeight', 'goHomeHeight', 'deviceId', 'zoomFocalLength'].some(
            (key) => !values[key],
          )
        ) {
          return
        }

        if (!viewer) {
          return
        }

        const groundHeight =
          (await viewer.scene.globe.getHeight(
            Cesium.Cartographic.fromDegrees(center.lng, center.lat),
          )) ?? 0

        const uavDistanceFromGround = values.airlineHeight

        const resp = await getDeviceDetail(values.deviceId)
        const uavDetail = resp.data
        if (!uavDetail) {
          msgApi.error('获取无人机详情失败，无法规划航线，请检查后重试')
          return
        }

        const cameraName = uavDetail.properties.cameraType

        const cameraType = getGimbalInfo(cameraName)

        const { width, focal } = calcCameraParameters(
          cameraType,
          values.zoomFocalLength === 1 ? 'wide' : 'zoom',
          values.zoomFocalLength,
        )

        const hFov = calcFovRadiation(focal, width, 1)

        const lat = uavDetail.properties.latitude ?? 30
        const w =
          Math.tan(hFov / 2) *
          uavDistanceFromGround *
          Math.abs(Math.cos((lat * Math.PI) / 180)) *
          2

        // 50 表示 50% 的横向覆盖率
        const interval = w * (1 - 50 / 100)

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

    useEffect(() => {
      if (open) {
        handleChange()
      }
    }, [open, center?.lng, center?.lat, handleChange])

    const handleConfirm = useMemoizedFn(async (values) => {
      if (!center) {
        msgApi.error('未获取到选中的位置，请重新选择')
        return
      }
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
            y: -45,
          },
          type: 'CAMERA_POSITION',
        },
        values.zoomFocalLength === 1
          ? {
              config: {},
              type: 'WIDE',
            }
          : {
              config: {
                focalLength: values.zoomFocalLength,
              },
              type: 'ZOOM',
            },
      )

      const data: Record<string, any> = {
        actionItemName: name,
        deviceType: 'UAV',
        deviceIds: values.deviceId,
        taskTemplateInfo: {
          taskBasic: JSON.stringify(taskBasic),
          defaultDeviceId: values.deviceId,
          parameters: parameters,
        },
      }

      let targetActionId = actionId
      let shouldNavigate = false
      if (!targetActionId) {
        try {
          const numberNanoid = customAlphabet(numbers, 5)
          const actionName = `区域侦查(${dayjs().format(
            'YYMMDD',
          )}${numberNanoid()})`
          const resp = await addAction({
            name: actionName,
            type: 'normal',
          })
          targetActionId = resp.data.actionId
          shouldNavigate = true
        } catch (_error) {
          msgApi.error('创建行动失败，请稍后重试')
          return
        }
      }

      if (!targetActionId) {
        msgApi.error('未能获取行动信息，请重试')
        return
      }

      data.actionId = targetActionId

      await createActionItem(data)
      await qc.invalidateQueries({
        queryKey: ['action', targetActionId + '', 'items'],
      })
      if (!actionId) {
        await qc.invalidateQueries({
          queryKey: ['actionList'],
          exact: false,
        })
      }
      if (shouldNavigate && targetActionId) {
        navigate(`/action/${targetActionId}`)
      }
      onClose()
    })

    return (
      <FormModal
        form={form}
        title={
          <div>
            <IconAreaDetect className="text-lg" /> 区域侦查
          </div>
        }
        items={formItems}
        open={open}
        initialValues={{
          airlineHeight: 100,
          goHomeHeight: 100,
          globalSpeed: 10,
          zoomFocalLength: 2,
        }}
        localInitialValues={{ key: 'event-area-detect' }}
        confirmDisable={!center || !wayline?.length || wayline.length < 2}
        onClose={onClose}
        onConfirm={handleConfirm}
        onValuesChange={handleChange}
      />
    )
  },
)

AreaDetectModal.displayName = 'AreaDetectModal'

export default AreaDetectModal
