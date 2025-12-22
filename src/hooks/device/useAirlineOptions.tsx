import { useMemoizedFn } from 'ahooks'
import { getAirlineTemplateList } from '@/service/modules/airline'
import useWaylinePreview from '../wayline/useWaylinePreview'
import { WaylineIcon } from '@/pages/wayline/components/AirlineTemplateListItem'
import IconButton from '@/components/ui/button/IconButton'
import IconPreview from '@/assets/icons/jsx/IconPreview'
import { WaylineEnum } from '@/constant/uav/wayline'
import { emtpyArray } from '@/constant/data'
import { Form, FormInstance } from 'antd'
import { DeviceEnum } from '@/enum/device'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import DeviceIcon from '@/components/device/DeviceIcon'

/** 获取所有航线和选项 */
const useWaylineOptions = () => {
  const queryClient = useQueryClient()
  const { data: airlineTemplateList } = useQuery(
    {
      queryKey: ['getAllAirlines'],
      queryFn: () =>
        getAirlineTemplateList({
          isPage: false,
        }),
      select: (d) => d.data.rows,
      // staleTime: 1000 * 60 * 60,
    },
    queryClient,
  )

  const { holder, handlePreview } = useWaylinePreview()
  const { t } = useTranslation()

  const airlineOptions = useMemo(
    () =>
      airlineTemplateList?.map((e) => ({
        label: (
          <div className="flex justify-between">
            <div className="flex gap-2">
              <WaylineIcon type={e.taskType} />
              {e.taskName}
            </div>
            {[WaylineEnum.PointWayline, WaylineEnum.AreaWayline].includes(
              e.taskType as WaylineEnum,
            ) && (
              <IconButton
                tippyProps={{ content: t('common.preview') }}
                onClick={(evt) => {
                  evt.stopPropagation()
                  handlePreview(e)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                className="hover:text-white scale-90"
              >
                <IconPreview />
              </IconButton>
            )}
          </div>
        ),
        value: e.waylineTemplateId,
        name: e.taskName,
        type: e.taskType,
      })) ?? emtpyArray,
    [airlineTemplateList, handlePreview, t],
  )

  return {
    airlineTemplateList,
    airlineOptions,
    holder,
  }
}

export const useWaylineAndDeviceFormOptions = (form: FormInstance<any>) => {
  const { airlineOptions, airlineTemplateList, holder } = useWaylineOptions()

  const waylineTemplateId = Form.useWatch('waylineTemplateId', form)
  const findAirlineByWaylineTemplateId = useMemoizedFn(
    (targetWaylineTemplateId?: string | number | null) => {
      if (targetWaylineTemplateId == null) return undefined
      return airlineTemplateList?.find(
        (e) =>
          e.waylineTemplateId != null &&
          String(e.waylineTemplateId) === String(targetWaylineTemplateId),
      )
    },
  )

  const resolveAirlineByTemplateId = useMemoizedFn(
    (
      targetWaylineTemplateId?: string | number | null,
      templateId?: string | number | null,
    ) => {
      const matchedByWaylineId = findAirlineByWaylineTemplateId(
        targetWaylineTemplateId,
      )
      if (matchedByWaylineId) return matchedByWaylineId

      if (templateId == null) return undefined

      return airlineTemplateList?.find(
        (e) => e.templateId != null && String(e.templateId) === String(templateId),
      )
    },
  )

  const activeAirline = useMemo(
    () => findAirlineByWaylineTemplateId(waylineTemplateId),
    [findAirlineByWaylineTemplateId, waylineTemplateId],
  )

  const taskType = activeAirline?.taskType

  const allDevices = useMapDevicesStore((s) => s.allDevices)

  const deviceOptions = useMemo(() => {
    let list = allDevices

    if (taskType) {
      if (
        [
          WaylineEnum.PointWayline,
          WaylineEnum.AreaWayline,
          WaylineEnum.SwarmWayline,
          'mapping2d', // 第三方
          'mapping3d',
        ].includes(taskType as WaylineEnum)
      ) {
        list = list.filter((e) => e.deviceType === DeviceEnum.UAV)
      } else if (
        [WaylineEnum.RebotDogWayline, WaylineEnum.PointCloud3DWayline].includes(
          taskType as WaylineEnum,
        )
      ) {
        list = list.filter((e) => e.deviceType === DeviceEnum.ROBOT_DOG)
      }
    }

    return list.map((e) => ({
      label: (
        <div className="flex gap-2">
          <DeviceIcon type={e.deviceType} />
          {e.deviceName}
        </div>
      ),
      deviceName: e.deviceName,
      value: e.deviceId,
    }))
  }, [allDevices, taskType])

  const allowMultipleDevice = taskType === WaylineEnum.SwarmWayline

  return {
    airlineTemplateList,
    allDevices,
    airlineOptions,
    deviceOptions,
    holder,
    waylineTemplateId,
    allowMultipleDevice,
    activeAirline,
    activeWaylineTemplate: activeAirline,
    findAirlineByWaylineTemplateId,
    resolveAirlineByTemplateId,
  }
}

export default useWaylineOptions
