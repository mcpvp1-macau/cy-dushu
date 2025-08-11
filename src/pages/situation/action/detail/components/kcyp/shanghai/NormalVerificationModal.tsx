import XModal from '@/components/XModal'
import { DictEnum } from '@/enum/dict'
import { useAppMsg } from '@/hooks/useAppMsg'
import useWatch from '@/hooks/useWatch'
import { commitKYCPOrder, saveKCYPOrder } from '@/service/modules/action/kcyp'
import { useDictOptions } from '@/store/useDict.store'
import { idCardReg, phoneReg } from '@/constant/regExp'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  SyncOutlined,
} from '@ant-design/icons'
import { Form, Image, Input, Select } from 'antd'
import { uniqWith } from 'lodash'
import { shouldJson } from '@/utils/json'
import { useDebounceFn } from 'ahooks'

const HeadLine: FC<{ title: string; suc?: boolean }> = memo(
  ({ title, suc }) => {
    return (
      <ul className="bg-ground-3 flex text-white h-[38px]">
        <li className="w-[160px] px-3 py-1 flex items-center gap-1">
          {title}
          {suc === true && <CheckCircleFilled className="text-green-400" />}
          {suc === false && <CloseCircleFilled className="text-red-400" />}
        </li>
        <li className="flex-1 border-l border-solid border-ground-5"></li>
        <li className="w-[160px] px-3 py-1 flex items-center border-l border-solid border-ground-5"></li>
        <li className="flex-1 border-l border-solid border-ground-5"></li>
      </ul>
    )
  },
)

const Line: FC<{ items: [ReactNode, ReactNode, ReactNode, ReactNode] }> = memo(
  ({ items }) => {
    return (
      <ul className="bg-ground-1 flex text-white">
        <li className="w-[160px] flex-shrink-0 px-3 py-1 flex items-center">
          {items[0]}
        </li>
        <li className="flex-1 border-l px-3 py-1 border-solid border-ground-5">
          {items[1]}
        </li>
        <li className="w-[160px] flex-shrink-0 px-3 py-1 flex items-center border-l border-solid border-ground-5">
          {items[2]}
        </li>
        <li className="flex-1 border-l px-3 py-1 border-solid border-ground-5">
          {items[3]}
        </li>
      </ul>
    )
  },
)

const typeMap = new Map<string, string>([
  ['CARD_CHECK', '一方当事人信息'],
  ['OTHER_CARD_CHECK', '另一方当事人信息'],
  ['CAR_NO_CHECK', '一方车辆信息'],
  ['OTHER_CAR_NO_CHECK', '另一方车辆信息'],
  ['CASE_INFO_UPLOAD', '事故信息'],
  ['CASE_PHOTO_UPLOAD', '现场照片信息'],
])

type PropsType = {
  actionId: string
  open: boolean
  orderData: API_KCYP.domain.OrderRecord
  aiResultData: API_ACTION.domain.AIResultRecord[]
  checkResultIds: string[]
  onClose?: () => void
}

/** 快处易赔 校验信息 */
const KCYPNormalVerificationModal: FC<PropsType> = memo(
  ({ open, orderData, aiResultData, checkResultIds, actionId, onClose }) => {
    const [form] = Form.useForm()

    // 从暂存工单中获取已选择的图片的类型
    useEffect(() => {
      const pictures = shouldJson(orderData.extra)?.pictures
      if (!pictures) {
        return
      }
      pictures?.forEach((e, i) => {
        if (e.id === checkResultIds[i]) {
          form.setFieldValue(`img${i}`, e.imageType)
        }
      })
    }, [orderData])

    // 图片校验结果 和 车牌号选项
    const [checkResults, plateNoOptions] = useMemo(() => {
      const resultMap = new Map(aiResultData.map((item) => [item.id, item]))
      return [
        checkResultIds.map((id) => resultMap.get(id)!),
        uniqWith(
          checkResultIds.map((id) => ({
            value: resultMap.get(id)!.plateNo,
            label: resultMap.get(id)!.plateNo,
          })),
          (a, b) => a.value === b.value,
        ),
      ]
    }, [aiResultData, checkResultIds])

    // 图片拍摄经纬度
    const { longitude, latitude } = useMemo(
      () =>
        aiResultData.find((e) => e.longitude && e.longitude) ?? {
          longitude: 0,
          latitude: 0,
        },
      [aiResultData],
    )

    const cardTypeOptions = useDictOptions(DictEnum.KCYP_CARD_TYPE)
    const carTypeOptions = useDictOptions(DictEnum.KCYP_CAR_TYPE)
    const carColorOptions = useDictOptions(DictEnum.KCYP_CAR_COLOR_TYPE)
    const casePhotoOptions = useDictOptions(DictEnum.KCYP_CASE_PHOTO_TYPE)
    const brokenPartOptions = useDictOptions(DictEnum.KCYP_BROKEN_PART_TYPE)
    const accidentTypeOptions = useDictOptions(DictEnum.KCYP_ACCIDENT_TYPE)
    const firstSceneOptions = useDictOptions(DictEnum.KCYP_FIRSTSCENE)

    useWatch(
      orderData,
      (newData) => {
        queueMicrotask(() => {
          if (!newData) {
            return
          }
          form.setFieldsValue({
            ...newData,
            caseHapTime: dayjs(newData?.caseHapTime),
            brokenPart: newData?.brokenPart?.split(','),
            otherBrokenPart: newData?.otherBrokenPart?.split(','),
          })
        })
      },
      true,
    )

    const [commitResMap, setCommitResMap] = useState(
      new Map<
        API_KCYP.res.CommitKCYPRes[0]['type'],
        { success: boolean; message: string }
      >(),
    )

    const queryClient = useQueryClient()

    const msgApi = useAppMsg()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const handleConfirm = useMemoizedFn(async () => {
      await form.validateFields()
      try {
        setConfirmLoading(true)
        const values = form.getFieldsValue()
        const { data } = await commitKYCPOrder({
          // 快处易赔事故基础信息
          kcypActionCommit: {
            ...values,
            caseId: orderData.caseId,
            longitude,
            latitude,
            brokenPart: values.brokenPart?.join(','),
            otherBrokenPart: values.otherBrokenPart?.join(','),
            caseHapTime: dayjs(values.caseHapTime).valueOf(),
          },
          // 事故照片列表
          pictures: checkResults.map((e, i) => ({
            ...e,
            imageType: values[`img${i}`],
            carNo: e.plateNo,
            carColor: e.plateColor,
            pictureUrl: e.image || e.sourceImage,
          })),
        })
        setCommitResMap(
          data.reduce(
            (p, e) => p.set(e.type, { success: e.success, message: e.message }),
            new Map() as typeof commitResMap,
          ),
        )
        if (!data.some((e) => !e.success)) {
          msgApi.success('提交成功')
          queryClient.invalidateQueries({
            queryKey: ['getKYCPOrder', String(orderData.caseId)],
          })
          onClose?.()
        } else {
          msgApi.warning(
            '请检查信息，并重试！' +
              data
                .filter((e) => !e.success)
                .map((e) => `${typeMap.get(e.type)}：${e.message}`)
                .join('；'),
          )
        }
      } finally {
        setConfirmLoading(false)
      }
    })

    const [saveState, setSaveState] = useState(-1) // 0 未保存 1 保存中 2 保存成功
    const saveMutation = useMutation({
      mutationFn: saveKCYPOrder,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['getKCYPOrder', actionId],
        })
        setSaveState(2)
      },
    })

    const { run: save } = useDebounceFn(
      async (values: any) => {
        // await form.validateFields()
        const { caseHapTime, brokenPart, otherBrokenPart } = values
        const caseHapTimeFormat = dayjs(caseHapTime).valueOf()
        setSaveState(1)
        saveMutation.mutate({
          ...orderData,
          ...values,
          brokenPart: brokenPart.join(','),
          otherBrokenPart: otherBrokenPart.join(','),
          caseHapTime: caseHapTimeFormat,
          extra: JSON.stringify({
            pictures: checkResults.map((e, i) => ({
              id: e.id,
              imageType: values[`img${i}`],
            })),
          }),
        })
      },
      { wait: 3_000, trailing: true },
    )

    const handleValuesChange = async (_, values: any) => {
      setSaveState(0)
      save(values)
    }

    const { t } = useTranslation()

    return (
      <XModal
        open={open}
        title="校验信息"
        width={760}
        confirmLoading={confirmLoading}
        confirmTitle={t('modal.submit')}
        onClose={onClose}
        onConfirm={handleConfirm}
      >
        <div className="text-fore flex justify-between">
          <p>校验以下信息后发送至大数据中心</p>
          {saveState === 0 ? (
            <p className="text-orange-600 items-center flex gap-1">
              <SyncOutlined />
              等待暂存
            </p>
          ) : saveState === 1 ? (
            <p className="text-blue-600  items-center flex gap-1">
              <SyncOutlined spin /> 暂存中
            </p>
          ) : saveState === 2 ? (
            <p className="text-green-600">暂存成功</p>
          ) : null}
        </div>
        <div className="my-3 text-white max-h-[456px] overflow-y-auto">
          <Form form={form} onValuesChange={handleValuesChange}>
            <HeadLine
              title="一方当事人信息"
              suc={commitResMap.get('CARD_CHECK')?.success}
            />
            <Line
              items={[
                '一方姓名',
                <Form.Item name="driverName" noStyle>
                  <Input />
                </Form.Item>,
                '一方手机号',
                <Form.Item name="phone" noStyle rules={[{ pattern: phoneReg }]}>
                  <Input />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '一方证件类型',
                <Form.Item name="idType" className="w-full" noStyle>
                  <Select className="w-full" options={cardTypeOptions} />
                </Form.Item>,
                '一方证件号码',
                <Form.Item
                  name="cardNo"
                  noStyle
                  rules={[{ pattern: idCardReg }]}
                >
                  <Input />
                </Form.Item>,
              ]}
            />

            <HeadLine
              title="另一方当事人信息"
              suc={commitResMap.get('OTHER_CARD_CHECK')?.success}
            />
            <Line
              items={[
                '另一方姓名',
                <Form.Item name="otherDriverName" noStyle>
                  <Input />
                </Form.Item>,
                '另一方手机号',
                <Form.Item
                  name="otherPhone"
                  noStyle
                  rules={[{ pattern: phoneReg }]}
                >
                  <Input />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '另一方证件类型',
                <Form.Item name="otherIdType" className="w-full" noStyle>
                  <Select className="w-full" options={cardTypeOptions} />
                </Form.Item>,
                '另一方证件号码',
                <Form.Item
                  name="otherCardNo"
                  noStyle
                  rules={[{ pattern: idCardReg }]}
                >
                  <Input />
                </Form.Item>,
              ]}
            />

            <HeadLine
              title="一方车辆信息"
              suc={commitResMap.get('CAR_NO_CHECK')?.success}
            />
            <Line
              items={[
                '一方车牌号码',
                <Form.Item name="carNo" noStyle>
                  <Select className="w-full" options={plateNoOptions} />
                </Form.Item>,
                '一方车牌种类',
                <Form.Item name="carType" noStyle>
                  <Select className="w-full" options={carTypeOptions} />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '一方车牌颜色',
                <Form.Item name="carColor" className="w-full" noStyle>
                  <Select className="w-full" options={carColorOptions} />
                </Form.Item>,
                null,
                null,
              ]}
            />

            <HeadLine
              title="另一方车辆信息"
              suc={commitResMap.get('OTHER_CAR_NO_CHECK')?.success}
            />
            <Line
              items={[
                '另一方车牌号码',
                <Form.Item name="otherCarNo" noStyle>
                  <Select className="w-full" options={plateNoOptions} />
                </Form.Item>,
                '另一方车牌种类',
                <Form.Item name="otherCarType" noStyle>
                  <Select className="w-full" options={carTypeOptions} />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '另一方车牌颜色',
                <Form.Item name="otherCarColor" className="w-full" noStyle>
                  <Select className="w-full" options={carColorOptions} />
                </Form.Item>,
                null,
                null,
              ]}
            />

            <HeadLine title="事故信息" />
            <Line
              items={[
                '一方车辆受损部位',
                <Form.Item name="brokenPart" noStyle>
                  <Select
                    className="w-full"
                    mode="multiple"
                    maxTagCount="responsive"
                    options={brokenPartOptions}
                  />
                </Form.Item>,
                '另一方车辆受损部位',
                <Form.Item name="otherBrokenPart" noStyle>
                  <Select
                    className="w-full"
                    mode="multiple"
                    maxTagCount="responsive"
                    options={brokenPartOptions}
                  />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '是否第一现场',
                <Form.Item name="firstScene" className="w-full" noStyle>
                  <Select className="w-full" options={firstSceneOptions} />
                </Form.Item>,
                '事故类型',
                <Form.Item name="accidentType" className="w-full" noStyle>
                  <Select className="w-full" options={accidentTypeOptions} />
                </Form.Item>,
              ]}
            />

            <HeadLine title="现场照片信息" />
            <div className="flex gap-3 mt-2">
              {checkResults.map((e, i) => (
                <div key={e.id} className="flex-1">
                  <div className="mb-2">
                    <Form.Item name={`img${i}`}>
                      <Select
                        className="w-full"
                        placeholder="请选择对应照片"
                        options={casePhotoOptions}
                      />
                    </Form.Item>
                  </div>
                  <div className="w-full overflow-hidden aspect-video border border-solid border-ground-5">
                    <Image
                      className="object-contain"
                      width="100%"
                      height="100%"
                      src={`/storage${e.image || e.sourceImage}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Form>
        </div>
      </XModal>
    )
  },
)

KCYPNormalVerificationModal.displayName = 'NormalVerificationModal'

export default KCYPNormalVerificationModal
