import IconButton from '@/components/ui/button/IconButton'
import { updAIResult } from '@/service/modules/action'
import { useDebounceFn } from 'ahooks'
import { Checkbox, Form, Input } from 'antd'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import { checkCarNo, getSipCascadePicture } from '@/service/modules/action/kcyp'
import { useAppMsg } from '@/hooks/useAppMsg'
import { ActionEnum } from '@/constant/action/action_type'
import { LoadingOutlined, PictureFilled } from '@ant-design/icons'
import ImageContainBoxPreview from '@/components/ui/ImageContainBoxPreview'
import IconKCCheck from '@/assets/icons/jsx/IconKCCheck'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import Select from '@/components/AntdOverride/Select'

/** AI 检测结果 */
const AIResultItem: FC<{
  data: API_ACTION.domain.AIResultRecord
  actionType: string
}> = memo(({ data, actionType }) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { run } = useDebounceFn(
    () => {
      queryClient.invalidateQueries({
        queryKey: ['action', String(data.actionId), 'aiResult'],
      })
    },
    { wait: 2_000 },
  )

  const handleFormBlur = useMemoizedFn(async () => {
    if (
      form.getFieldValue('plateNo') === data.plateNo &&
      form.getFieldValue('plateColor') === data.plateColor &&
      form.getFieldValue('plateType') === data.plateType
    ) {
      return
    }
    await updAIResult({
      id: data.id as unknown as number,
      plateNo: form.getFieldValue('plateNo'),
      plateColor: form.getFieldValue('plateColor'),
      plateType: form.getFieldValue('plateType'),
    })
    run()
  })
  const carColorOptions = useDictOptions(DictEnum.KCYP_CAR_COLOR_TYPE)
  const carTypeOptions = useDictOptions(DictEnum.KCYP_CAR_TYPE)

  const msgApi = useAppMsg()
  const { mutate: handleGetSipCascadePicture, isPending } = useMutation(
    {
      mutationFn: () =>
        getSipCascadePicture({
          actionId: data.actionId,
          actionItemId: data.actionItemId,
          actionItemRecordId: data.actionItemRecordId,
          actionRecordId: data.actionRecordId,
          plateNo: form.getFieldValue('plateNo'),
          resultTime: data.resultTime,
          deviceId: data.deviceId,
        }),
      onSuccess: () => {
        msgApi.success('获取卡口照片成功')
      },
    },
    queryClient,
  )

  const [checkCarNoResult, setCheckCarNoResult] = useState<
    NonNullable<API_KCYP.res.CheckNoRes['carNos']>[number] | null
  >(null)

  const handleCheckCarNo = async () => {
    const resp = await checkCarNo([
      {
        carNo: data.plateNo,
        carType: data.plateType,
        carColor: data.plateColor,
      },
    ])
    if (resp.data.carNos?.length) {
      setCheckCarNoResult(resp.data.carNos[0])
      msgApi.success('车牌检测结果已更新')
    } else {
      msgApi.error('车牌检测结果获取失败')
    }
  }

  return (
    <div className="flex gap-2">
      <div className="w-[212px] h-[155px] relative border border-solid border-ground-5 box-content bg-ground-1">
        <ImageContainBoxPreview
          src={`/storage${data.image || data.sourceImage}`}
          sourceWidth={data.sourceFrameWidth}
          sourceHeight={data.sourceFrameHeight}
        >
          {data.leftTopX && data.leftTopY && (
            <div
              className="absolute border border-solid border-red-400"
              style={{
                left: `${(data.leftTopX / data.sourceFrameWidth) * 100}%`,
                top: `${(data.leftTopY / data.sourceFrameHeight) * 100}%`,
                right: `${
                  100 -
                  ((data.leftTopX + data.bboxWidth) / data.sourceFrameWidth) *
                    100
                }%`,
                bottom: `${
                  100 -
                  ((data.leftTopY + data.bboxHeight) / data.sourceFrameHeight) *
                    100
                }%`,
              }}
            />
          )}
        </ImageContainBoxPreview>
        <div className="absolute left-2 top-2">
          <Checkbox value={data.id} />
        </div>
      </div>
      <div>
        <Form
          form={form}
          initialValues={{
            plateNo: data.plateNo,
            plateColor: data.plateColor,
            plateType: data.plateType,
          }}
          onBlur={handleFormBlur}
        >
          <ul className="flex flex-col gap-1 justify-between text-fore">
            <li className="flex gap-1 whitespace-nowrap ">
              <span className="text-white">车牌:</span>
              <Form.Item name="plateNo" noStyle>
                <Input
                  size="small"
                  className="w-full"
                  addonAfter={
                    actionType === ActionEnum.KCYPXS ? (
                      <div className="px-2">
                        {isPending ? (
                          <LoadingOutlined />
                        ) : (
                          <IconButton
                            toolTipProps={{ title: '获取卡口照片' }}
                            className="text-xs"
                            onClick={() => handleGetSipCascadePicture()}
                          >
                            <PictureFilled />
                          </IconButton>
                        )}
                      </div>
                    ) : null
                  }
                />
              </Form.Item>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-white">车型:</span>
              <Form.Item name="plateType" noStyle>
                <Select
                  size="small"
                  className="w-full"
                  options={carTypeOptions}
                />
              </Form.Item>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-white">颜色:</span>
              <Form.Item name="plateColor" noStyle>
                <Select
                  size="small"
                  className="w-full"
                  options={carColorOptions}
                />
              </Form.Item>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-white">时间:</span>
              <span>{dayjs(data.resultTime).format('MM/DD HH:mm:ss')}</span>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-white">位置:</span>
              <span>
                {data.longitude.toFixed(5)}, {data.latitude.toFixed(5)}
              </span>
            </li>
            <li className="flex gap-1">
              <span className="text-white">来源:</span>
              <span>{data.source}</span>
            </li>
          </ul>
        </Form>
      </div>
      <div>
        <IconAsyncButton
          disabled={!data.plateNo || !data.plateColor || !data.plateType}
          toolTipProps={
            checkCarNoResult?.message
              ? {
                  title: checkCarNoResult?.message,
                }
              : {
                  title: '校验车牌是否存在交强险保单信息',
                }
          }
          className={
            checkCarNoResult
              ? checkCarNoResult?.success
                ? '!text-green-500'
                : '!text-red-500'
              : undefined
          }
          successMsg=""
          onClick={handleCheckCarNo}
        >
          <IconKCCheck />
        </IconAsyncButton>
      </div>
    </div>
  )
})

export default AIResultItem
