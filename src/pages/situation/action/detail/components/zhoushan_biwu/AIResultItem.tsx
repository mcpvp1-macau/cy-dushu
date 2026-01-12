import { updAIResult } from '@/service/modules/action'
import { useAsyncEffect, useDebounceFn } from 'ahooks'
import { Checkbox, Form, Input } from 'antd'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import ImageContainBoxPreview from '@/components/ui/ImageContainBoxPreview'
import Select from '@/components/AntdOverride/Select'
import { shouldJson } from '@/utils/json'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { forwardRef, useImperativeHandle } from 'react'
import { downloadAndRename } from '@/utils/download'
import md5 from 'crypto-js/md5'
import { handleStorageURL } from '@/pages/events/components/EventDetail'
import { wrap } from 'comlink'
import { WorkerAPI } from '@/worker/watermark_image'
import WatermarkWorker from '@/worker/watermark_image?worker'
import IconLoading from '@/assets/icons/jsx/IconLoading'

const illegalMap = {
  '1116': '驾驶机动车违反禁令标志指示的',
  '1117': '驾驶机动车违反禁止标线指示的',
  '10391': '机动车不按规定临时停车影响其他车辆和行人通行的',
  '10393': '机动车未按规定在限制、禁止的区域或者路段停靠的',
  '10394': '机动车不按规定在人行道临时停车影响其他车辆和行人通行的',
}

/** AI 检测结果 */
const AIResultItem = forwardRef<
  { downloadImage: Function },
  { data: API_ACTION.domain.AIResultRecord }
>(({ data }, ref) => {
  const worker = useRef<ReturnType<typeof wrap<WorkerAPI>> | null>(null)
  if (!worker.current) {
    worker.current = wrap<WorkerAPI>(new WatermarkWorker())
  }

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
      form.getFieldValue('illegalCode') === extra.illegalCode &&
      form.getFieldValue('address') === extra.address
    ) {
      return
    }
    await updAIResult({
      id: data.id as unknown as number,
      plateNo: form.getFieldValue('plateNo'),
      plateColor: form.getFieldValue('plateColor'),
      extra: JSON.stringify({
        ...extra,
        illegalCode: form.getFieldValue('illegalCode'),
        address: form.getFieldValue('address'),
      }),
    })
    run()
  })
  const carColorOptions = useDictOptions(DictEnum.KCYP_CAR_COLOR_TYPE)

  const [newImage, setNewImage] = useState<string | null>(null)

  const sn = useMapDevicesStore(
    (s) => s.deviceMap[data.deviceId]?.properties.sn,
  )

  const orignalImageUrl = handleStorageURL(data.image || data.sourceImage)

  const illegalTime = useMemo(() => {
    const t = dayjs(data.resultTime)

    let codeSum = 0
    for (let i = 0; i < orignalImageUrl.length; i++) {
      codeSum += orignalImageUrl.charCodeAt(i)
    }

    const hash = (
      ((t.get('year') +
        t.get('month') +
        t.get('date') +
        t.get('hour') +
        t.get('minute') +
        t.get('second') +
        codeSum) %
        100) +
      ''
    ).padEnd(2, '0')

    return `${t.format('YYYY.MM.DD HH:mm:ss')}.${hash}`
  }, [data.resultTime])

  const antiCode = useMemo(() => {
    return md5(
      [
        `车牌: ${data.plateNo || '未知'}`,
        `类型: ${illegalMap[extra.illegalCode] || '未知'}`,
        `代码: ${extra.illegalCode || '未知'}`,
        `颜色: ${
          carColorOptions.find((e) => e.value === data.plateColor)?.label ||
          data.plateColor ||
          '未知'
        }`,
        `时间: ${illegalTime}`,
        `位置: ${data.longitude.toFixed(5)}, ${data.latitude.toFixed(5)}`,
        `地点: ${extra.address || '未知'}`,
        `来源: ${data.source}`,
        `编码: ${sn}`,
        `图片: ${orignalImageUrl}`,
      ].join('\n'),
    )
      .toString()
      ?.toUpperCase()
  }, [data])

  useAsyncEffect(async () => {
    if (!worker.current) {
      return
    }
    setNewImage(null)
    if (data.image || data.sourceImage) {
      const url = handleStorageURL(data.image || data.sourceImage)
      const texts = [
        `车牌号码: ${data.plateNo || '未知'}`,
        `车牌颜色: ${
          carColorOptions.find((e) => e.value === data.plateColor)?.label ||
          data.plateColor ||
          '未知'
        }`,
        `违法类型: ${illegalMap[extra.illegalCode] || '未知'}`,
        `违法代码: ${extra.illegalCode || '未知'}`,
        `违法时间: ${illegalTime}`,
        `违法位置: ${data.longitude.toFixed(5)}, ${data.latitude.toFixed(5)}`,
        `违法地点: ${extra.address || '未知'}`,
        `设备名称: ${data.source}`,
        `设备编码: ${sn}`,
        `防伪信息: ${antiCode}`,
      ]
      try {
        const resp = await fetch(url)
        const blob = await resp.blob()
        const bitmap = await createImageBitmap(blob)
        const newBlob = await worker.current.addTextToLeftBottom(bitmap, texts)
        const url2 = URL.createObjectURL(newBlob)
        setNewImage(url2)
      } catch (_error) {
        setNewImage(url)
      }
    }
  }, [data, antiCode])

  useImperativeHandle(ref, () => ({
    downloadImage: () =>
      downloadAndRename(
        newImage || orignalImageUrl,
        `${illegalMap[extra.illegalCode]}.${orignalImageUrl.slice(
          orignalImageUrl.lastIndexOf('.') + 1,
        )}`,
      ),
  }))

  return (
    <div className="flex gap-2">
      <div className="w-[212px] h-[155px] relative border border-solid border-ground-5 box-content bg-ground-1">
        <ImageContainBoxPreview
          src={newImage || orignalImageUrl}
          sourceWidth={data.sourceFrameWidth}
          sourceHeight={data.sourceFrameHeight}
          downloadName={`${
            illegalMap[extra.illegalCode]
          }.${orignalImageUrl.slice(orignalImageUrl.lastIndexOf('.') + 1)}`}
          loading="lazy"
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
          {!newImage && (
            <div className="abs-center flex flex-col items-center gap-1">
              <IconLoading className="text-3xl text-white shadow" />
              <p className="text-sm whitespace-nowrap">正在生成水印...</p>
            </div>
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
            illegalCode: extra.illegalCode,
            address: extra.address || undefined,
          }}
          onBlur={handleFormBlur}
        >
          <ul className="flex flex-col gap-1 justify-between text-fore">
            <li className="flex gap-1 whitespace-nowrap ">
              <span className="text-hightlight">车牌:</span>
              <Form.Item name="plateNo" noStyle>
                <Input size="small" className="w-full" />
              </Form.Item>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-hightlight">颜色:</span>
              <Form.Item name="plateColor" noStyle>
                <Select
                  size="small"
                  className="w-full"
                  options={carColorOptions}
                />
              </Form.Item>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-hightlight">行为:</span>
              <Form.Item name="illegalCode" noStyle>
                <Select
                  size="small"
                  className="w-[210px]"
                  options={[
                    { label: illegalMap['1116'], value: '1116' },
                    { label: illegalMap['1117'], value: '1117' },
                    { label: illegalMap['10391'], value: '10391' },
                    { label: illegalMap['10393'], value: '10393' },
                    { label: illegalMap['10394'], value: '10394' },
                  ]}
                  popupMatchSelectWidth={false}
                />
              </Form.Item>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-hightlight">代码:</span>
              <Form.Item name="illegalCode" noStyle>
                <Select
                  size="small"
                  className="w-full"
                  options={[
                    { label: '1116', value: '1116' },
                    { label: '1117', value: '1117' },
                    { label: '10391', value: '10391' },
                    { label: '10393', value: '10393' },
                    { label: '10394', value: '10394' },
                  ]}
                />
              </Form.Item>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-hightlight">时间:</span>
              <span>{illegalTime}</span>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-hightlight">位置:</span>
              <span>
                {data.longitude.toFixed(5)}, {data.latitude.toFixed(5)}
              </span>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-hightlight">地点:</span>
              <Form.Item name="address" noStyle>
                <Input size="small" />
              </Form.Item>
            </li>
            <li className="flex gap-1">
              <span className="text-hightlight">设备:</span>
              <span>{data.source}</span>
            </li>
            <li className="flex gap-1">
              <span className="text-hightlight">编码:</span>
              <span>{sn}</span>
            </li>
            <li className="flex gap-1 whitespace-nowrap">
              <span className="text-hightlight">防伪:</span>
              <span className="text-wrap max-w-48">{antiCode}</span>
            </li>
          </ul>
        </Form>
      </div>
    </div>
  )
})

export default AIResultItem
