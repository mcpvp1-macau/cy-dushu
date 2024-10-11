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
import { memo, type FC } from 'react'
import AlgorithmSettingModal from './AlgorithmSettingModal'

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
    const Icon = algorithmIconMap[aiData.imageType] || CloudFilled

    const envMap = shouldJson(aiData.envMap)

    let btnName = ''
    let status = ''

    if (aiData.deployRecordList.length) {
      const last = aiData.deployRecordList[0]
      switch (last.status) {
        case 'STOPPED':
          btnName = '部署'
          status = '停止成功'
          break
        case 'PENDING':
          btnName = '部署'
          status = '未部署'
          // loading = true;
          break
        case 'COMPLETED':
          btnName = '停止'
          status = '已完成'
          break
        case 'DEPLOYING':
          btnName = '停止'
          status = '部署中'
          // loading = true;
          break
        case 'ERROR':
          btnName = '停止'
          status = '部署失败'
          break
        case 'EXCEPTION':
          btnName = '停止'
          status = '运行异常'
          break
        case 'STOPPING':
          btnName = '停止'
          status = '停止中'
          // loading = true;
          break
        case 'STOP_ERROR':
          btnName = '停止'
          status = '停止失败'
          break
        case 'SUCCESS':
          btnName = '停止'
          status = '部署成功'
          break

        default:
          btnName = '停止'
          break
      }
    } else {
      btnName = '部署'
    }
    const isRunning = btnName === '停止'
    const msgApi = useAppMsg()
    const handleBtnClick = useMemoizedFn(async () => {
      if (!productKey || !deviceId) {
        return
      }
      const deployRecord = aiData.deployRecordList?.[0]
      let message = ''
      if (btnName === '部署') {
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
      msgApi.success('更新成功')
      setOpen(false)
      onAction?.()
    })

    return (
      <div className="flex bg-ground-200 p-2 gap-2 rounded-[3px]">
        <div>
          <Icon />
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
                disabled={btnName !== '部署' && btnName !== '停止'}
                onClick={handleBtnClick}
              >
                {btnName}
              </Button>
            </div>
          </div>
          <div className="flex mt-0.5 text-xs text-fore whitespace-nowrap">
            <p className="flex-1 flex gap-1">
              <span>版本号:</span>
              <span>{envMap['version'] || '-'}</span>
            </p>
            <p className="flex-1 flex gap-1">
              <span>来源:</span>
              <span>{envMap['from'] || '-'}</span>
            </p>
            <p className="flex-1 flex gap-1">
              <span>状态:</span>
              <span>
                {status || '-'}
                {'部署中' === status && <LoadingOutlined className="ml-1" />}
              </span>
            </p>
          </div>
          <p className="text-xs text-fore mt-0.5 flex gap-1">
            <span>创建时间:</span>
            <span>{aiData.createTime}</span>
          </p>
        </div>
        {open && (
          <AlgorithmSettingModal
            open={open}
            aiData={aiData}
            alogorithmConfig={shouldJson(aiData.algorithmConfig)}
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
