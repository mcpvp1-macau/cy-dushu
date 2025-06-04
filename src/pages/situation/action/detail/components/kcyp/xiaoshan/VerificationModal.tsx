import XModal from '@/components/XModal'
import { DictEnum } from '@/enum/dict'
import { useAppMsg } from '@/hooks/useAppMsg'
import useWatch from '@/hooks/useWatch'
import { commitXiaoshanKCYP } from '@/service/modules/action/kcyp'
import { useDictOptions } from '@/store/useDict.store'
import { phoneReg } from '@/constant/regExp'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { Form, Input, Select } from 'antd'
import { uniqWith } from 'lodash'
import ImageContainBoxPreview from '@/components/ui/ImageContainBoxPreview'

const areaMap = ['(省)', '(市)', '(区)', '(街道)', '(路名/门牌)']
const areaNameMap = ['a1', 'a2', 'a3', 'a4', 'a5']

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
  open: boolean
  orderData: API_KCYP.domain.OrderRecord
  aiResultData: API_ACTION.domain.AIResultRecord[]
  checkResultIds: string[]
  onClose?: () => void
}

/** 快处易赔 校验信息 */
const KCYPXSVerificationModal: FC<PropsType> = memo(
  ({ open, orderData, aiResultData, checkResultIds, onClose }) => {
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

    const cardTypeOptions = useDictOptions(DictEnum.XIAOSHAN_KCYP_CARD_TYPE)
    const carTypeOptions = useDictOptions(DictEnum.XIAOSHAN_KCYP_CAR_TYPE)
    const carColorOptions = useDictOptions(
      DictEnum.XIAOSHAN_KCYP_CAR_COLOR_TYPE,
    )
    const casePhotoOptions = useDictOptions(DictEnum.KCYP_CASE_PHOTO_TYPE)
    const deptOptions = useDictOptions(DictEnum.XIAOSHAN_KCYP_DEPT)
    const accidentTypeOptions = useDictOptions(
      DictEnum.XIAOSHAN_KCYP_ACCIDENT_TYPE,
    )
    const accidentFromOptions = useDictOptions(
      DictEnum.XIAOSHAN_KCYP_ACCIDENT_FROM,
    )
    const accidentCollisionOptions = useDictOptions(
      DictEnum.XIAOSHAN_KCYP_ACCID_COLLISION,
    )

    const [form] = Form.useForm()

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

    useEffect(() => {
      if (!orderData.caseHapAddress) return
      const address = orderData.caseHapAddress.split('&')
      address.forEach((item: any, idx: number) => {
        const name = areaNameMap[idx]
        form.setFieldValue(name, item)
      })
    }, [orderData.caseHapAddress])

    const queryClient = useQueryClient()

    const msgApi = useAppMsg()
    const [confirmLoading, setConfirmLoading] = useState(false)
    const handleConfirm = useMemoizedFn(async () => {
      await form.validateFields()
      try {
        setConfirmLoading(true)
        const values = form.getFieldsValue()
        const { data } = await commitXiaoshanKCYP({
          // 快处易赔事故基础信息
          kcypActionCommit: {
            ...values,
            caseId: orderData.caseId,
            longitude,
            latitude,
            caseHapTime: dayjs(values.caseHapTime).valueOf(),
            caseHapAddress: areaNameMap
              .map((key) => form.getFieldValue(key) ?? '')
              .join('&'),
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
            queryKey: ['getXSKCYPOrder', String(orderData.caseId)],
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

    return (
      <XModal
        open={open}
        title="校验信息"
        width={760}
        confirmLoading={confirmLoading}
        onClose={onClose}
        onConfirm={handleConfirm}
      >
        <p className="text-fore">校验以下信息后发送至大数据中心</p>
        <div className="my-3 text-white max-h-[456px] overflow-y-auto">
          <Form form={form}>
            <HeadLine title="事故地点" />
            <div className="flex flex-wrap gap-y-2 my-2">
              {areaMap.map((item: any, index: number) => (
                <div
                  className={clsx(
                    'flex gap-2 px-2 whitespace-nowrap',
                    index < 4 ? 'w-1/4' : 'w-1/2',
                  )}
                >
                  <Form.Item noStyle name={areaNameMap[index]}>
                    <Input size="small" />
                  </Form.Item>
                  <span>{areaMap[index]}</span>
                </div>
              ))}
            </div>
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
                <Form.Item name="cardNo" noStyle>
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
                <Form.Item name="otherCardNo" noStyle>
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
                '责任单位',
                <Form.Item name="dept" noStyle>
                  <Select
                    className="w-full"
                    mode="multiple"
                    maxTagCount="responsive"
                    options={deptOptions}
                  />
                </Form.Item>,
                '事故形态',
                <Form.Item name="accidentFrom" noStyle>
                  <Select className="w-full" options={accidentFromOptions} />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '车辆碰撞形态',
                <Form.Item name="accidCollision" className="w-full" noStyle>
                  <Select
                    className="w-full"
                    options={accidentCollisionOptions}
                  />
                </Form.Item>,
                '事故原因',
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
                  <div className="w-full overflow-hidden aspect-video border border-solid border-ground-5 relative">
                    <ImageContainBoxPreview
                      src={`/storage${e.image || e.sourceImage}`}
                      sourceWidth={e.sourceFrameWidth}
                      sourceHeight={e.sourceFrameHeight}
                    >
                      {e.leftTopX && e.leftTopY && (
                        <div
                          className="absolute border border-solid border-red-400"
                          style={{
                            left: `${(e.leftTopX / e.sourceFrameWidth) * 100}%`,
                            top: `${(e.leftTopY / e.sourceFrameHeight) * 100}%`,
                            right: `${
                              100 -
                              ((e.leftTopX + e.bboxWidth) /
                                e.sourceFrameWidth) *
                                100
                            }%`,
                            bottom: `${
                              100 -
                              ((e.leftTopY + e.bboxHeight) /
                                e.sourceFrameHeight) *
                                100
                            }%`,
                          }}
                        ></div>
                      )}
                    </ImageContainBoxPreview>
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

KCYPXSVerificationModal.displayName = 'NormalVerificationModal'

export default KCYPXSVerificationModal
