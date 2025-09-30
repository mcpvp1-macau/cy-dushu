import { updAIResult } from '@/service/modules/action'
import { useAsyncEffect, useDebounceFn } from 'ahooks'
import { Checkbox, Form, Input } from 'antd'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import ImageContainBoxPreview from '@/components/ui/ImageContainBoxPreview'
import Select from '@/components/AntdOverride/Select'
import { shouldJson } from '@/utils/json'

/** AI 检测结果 */
const AIResultItem: FC<{
  data: API_ACTION.domain.AIResultRecord
}> = memo(({ data }) => {
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

  const extra = useMemo(() => {
    return shouldJson(data.extra) ?? {}
  }, [data.extra])

  const handleFormBlur = useMemoizedFn(async () => {
    if (
      form.getFieldValue('plateNo') === data.plateNo &&
      form.getFieldValue('plateColor') === data.plateColor &&
      form.getFieldValue('biwuType') === extra.biwuType
    ) {
      return
    }
    await updAIResult({
      id: data.id as unknown as number,
      plateNo: form.getFieldValue('plateNo'),
      plateColor: form.getFieldValue('plateColor'),
      extra: JSON.stringify({
        ...extra,
        biwuType: form.getFieldValue('biwuType'),
      }),
    })
    run()
  })
  const carColorOptions = useDictOptions(DictEnum.KCYP_CAR_COLOR_TYPE)

  const [newImage, setNewImage] = useState<string | null>(null)

  useAsyncEffect(async () => {
    setNewImage(null)
    if (data.image || data.sourceImage) {
      const url = `/storage${data.image || data.sourceImage}`
      try {
        const newUrl = await addTextToImage(url, [
          `车牌: ${data.plateNo || '未知'}`,
          `类型: ${extra.biwuType || '未知'}`,
          `颜色: ${data.plateColor || '未知'}`,
          `时间: ${dayjs(data.resultTime).format('YY/MM/DD HH:mm:ss')}`,
          `地点: ${data.longitude.toFixed(5)}, ${data.latitude.toFixed(5)}`,
          `来源: ${data.source}`,
        ])
        setNewImage(newUrl)
      } catch (error) {
        setNewImage(url)
      }
    }
  }, [data])

  return (
    <div className="flex gap-2">
      <div className="w-[212px] h-[155px] relative border border-solid border-ground-5 box-content bg-ground-1">
        <ImageContainBoxPreview
          src={newImage || `/storage${data.image || data.sourceImage}`}
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
            biwuType: extra.biwuType || undefined,
          }}
          onBlur={handleFormBlur}
        >
          <ul className="flex flex-col gap-1 justify-between text-fore">
            <li className="flex gap-1 whitespace-nowrap ">
              <span className="text-white">车牌:</span>
              <Form.Item name="plateNo" noStyle>
                <Input size="small" className="w-full" />
              </Form.Item>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-white">类型:</span>
              <Form.Item name="biwuType" noStyle>
                <Select
                  size="small"
                  className="w-full"
                  options={[
                    { label: '违规变道', value: '违规变道' },
                    { label: '车辆违停', value: '车辆违停' },
                  ]}
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
    </div>
  )
})

export default AIResultItem

function addTextToImage(url: string, text: string[]) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // 避免 CORS 污染
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!

      // 绘制原图
      ctx.drawImage(img, 0, 0)

      // 文字样式
      ctx.font = '36px Arial'
      ctx.fillStyle = '#e74341'
      ctx.textBaseline = 'bottom'

      // 设置描边
      ctx.lineWidth = 6
      ctx.strokeStyle = 'rgba(50,50,50,0.8)'

      for (let i = text.length - 1; i >= 0; i--) {
        const line = text[i]
        const x = 20
        const y = canvas.height - 20 - (text.length - 1 - i) * 52 // 每行文字间隔40px

        // 描边文字
        ctx.strokeText(line, x, y)
        // 填充文字
        ctx.fillText(line, x, y)
      }

      // 生成新的 URL
      const newUrl = canvas.toDataURL('image/png')
      resolve(newUrl)
    }
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = url
  })
}
