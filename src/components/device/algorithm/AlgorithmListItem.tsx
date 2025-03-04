import IconCar from '@/assets/icons/jsx/IconCar'
import IconPeople from '@/assets/icons/jsx/IconPeople'
import IconSetting from '@/assets/icons/jsx/IconSetting'
import IconButton from '@/components/ui/button/IconButton'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  deployAlgorithm,
  releaseAlgorithm,
  updateAlogorithmAppConfig,
} from '@/service/modules/algorithm'
import { shouldJson } from '@/utils/json'
import { CloudFilled, LoadingOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import AlgorithmSettingModal from './AlgorithmSettingModal'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = {
  deviceId: string
  productKey: string
  aiData: API_Alogrithm.domain.AlgorithmRecord
  onAction?: () => void
}

export const algorithmIconMap = {
  car: IconCar,
  people: IconPeople,
  person: IconPeople,
  climbing: IconPeople,
  unknown: CloudFilled,
  undefined: CloudFilled,
}

const AlgorithmListItem: FC<PropsType> = memo(
  ({ deviceId, productKey, aiData, onAction }) => {
    const { t } = useTranslation()

    const Icon = algorithmIconMap[aiData.imageType] || CloudFilled

    const envMap = shouldJson(aiData.envMap) || {}

    const { btnName, status } = useMemo(() => {
      const e = aiData.deployRecordList?.[0]
      if (!e) {
        return {
          btnName: t('device.algorithm.deploy.title'),
          status: '',
        }
      }

      const btnName = ['STOPPED', 'PENDING'].includes(e.status)
        ? t('device.algorithm.deploy.title')
        : t('device.algorithm.stop.title')
      const status =
        e.status === 'STOPPED'
          ? t('device.algorithm.stopped.title')
          : e.status === 'PENDING'
          ? t('device.algorithm.pending.title')
          : e.status === 'COMPLETED'
          ? t('device.algorihm.competed.title')
          : e.status === 'DEPLOYING'
          ? t('device.algorithm.deploying')
          : e.status === 'ERROR'
          ? t('device.algorithm.error.title')
          : e.status === 'EXCEPTION'
          ? t('device.algorithm.exception.title')
          : e.status === 'STOPPING'
          ? t('device.algorithm.stopping.title')
          : e.status === 'STOP_ERROR'
          ? t('device.algorithm.stopError.title')
          : e.status === 'SUCCESS'
          ? t('device.algorithm.success.title')
          : ''

      return { btnName, status }
    }, [aiData.deployRecordList, t])

    const isRunning = btnName === 'Stop' || btnName === '停止'
    const msgApi = useAppMsg()
    const handleBtnClick = useMemoizedFn(async () => {
      if (!productKey || !deviceId) {
        return
      }
      const deployRecord = aiData.deployRecordList?.[0]
      let message = ''
      if (btnName === '部署' || btnName === 'Deploy') {
        message = (
          await deployAlgorithm({
            appId: aiData.id,
            clusterId: deviceId,
            productKey,
          })
        ).message
      } else {
        message = (
          await releaseAlgorithm({
            deployRecordId: deployRecord.id,
            clusterId: deviceId,
            productKey,
          })
        ).message
      }
      msgApi.success(message)
      onAction?.()
    })

    const [open, setOpen] = useState(false)

    const handleUpdateAlgorithmConfig = useMemoizedFn(async (data: any) => {
      await updateAlogorithmAppConfig({
        algorithmAppId: aiData.id,
        deviceId: deviceId!,
        algorithmConfig: JSON.stringify(data),
      })
      msgApi.success(t('api.success.msg'))
      setOpen(false)
      onAction?.()
    })

    const videoId = useDeviceDetailStore(
      (s) => s.deviceDetail?.properties?.videoList?.[0]?.videoId,
    )

    return (
      <div className="flex bg-ground-3 p-2 gap-2 rounded-[3px]">
        <div>
          <Icon className="text-fore" />
        </div>
        <div className="grow">
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              <p>{aiData.name}</p>
              <IconButton onClick={() => setOpen(true)}>
                <IconSetting />
              </IconButton>
            </div>
            <div>
              <Button
                size="small"
                className="text-xs h-5 leading-5"
                type={!isRunning ? 'primary' : 'default'}
                // disabled={btnName !== '部署' && btnName !== '停止'}
                onClick={handleBtnClick}
              >
                {btnName}
              </Button>
            </div>
          </div>
          <div className="flex mt-0.5 text-xs text-fore whitespace-nowrap">
            <p className="flex-1 flex gap-1">
              <span>{t('common.version')}:</span>
              <span>{envMap['version'] || '-'}</span>
            </p>
            <p className="flex-1 flex gap-1">
              <span>{t('common.source')}:</span>
              <span>{envMap['from'] || '-'}</span>
            </p>
            <p className="flex-1 flex gap-1">
              <span>{t('common.status')}:</span>
              <span>
                {status || '-'}
                {'部署中' === status && <LoadingOutlined className="ml-1" />}
              </span>
            </p>
          </div>
          <p className="text-xs text-fore mt-0.5 flex gap-1">
            <span>{t('common.createTime')}:</span>
            <span>{aiData.createTime}</span>
          </p>
        </div>
        {open && (
          <AlgorithmSettingModal
            open={open}
            aiData={aiData}
            alogorithmConfig={shouldJson(aiData.algorithmConfig)}
            areaPickervideoInfo={{
              deviceId,
              productKey,
              videoId: videoId ?? '',
            }}
            onClose={() => setOpen(false)}
            onConfirm={handleUpdateAlgorithmConfig}
          />
        )}
      </div>
    )
  },
)

AlgorithmListItem.displayName = 'AlgorithmListItem'

export default AlgorithmListItem
