import XModal from '@/components/XModal'
import { DictEnum } from '@/enum/dict'
import useWatch from '@/hooks/useWatch'
import { useDictOptions } from '@/store/useDict.store'
import { phoneReg } from '@/constant/regExp'
import { DatePicker, Form, Input } from 'antd'
import { uniqWith } from 'lodash'
import ImageContainBoxPreview from '@/components/ui/ImageContainBoxPreview'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { ReactNode } from 'react'
import AsyncButton from '@/components/ui/button/AsyncButton'
import Select from '@/components/AntdOverride/Select'
import {
  commitZSKCYPInfoOrder,
  commitZSKCYPPictures,
  commitZSKCYPVideo,
  getZSKCYPVideoURL,
} from '@/service/modules/action/kcyp'
import { ZhoushanProcessResultEnum } from '@/service/modules/action/kcyp/enum'
import { Dayjs } from 'dayjs'
import { useAppMsg } from '@/hooks/useAppMsg'
import { shouldJson } from '@/utils/json'

const Line: FC<{ items: [ReactNode, ReactNode, ReactNode, ReactNode] }> = memo(
  ({ items }) => {
    return (
      <ul className="bg-ground-1 flex text-white">
        <li className="w-[160px] flex-shrink-0 px-3 py-0.5 flex items-center">
          {items[0]}
        </li>
        <li className="flex-1 border-l px-2 py-1 border-solid border-ground-5">
          {items[1]}
        </li>
        <li className="w-[160px] flex-shrink-0 px-2 py-1 flex items-center border-l border-solid border-ground-5">
          {items[2]}
        </li>
        <li className="flex-1 border-l px-2 py-1 border-solid border-ground-5">
          {items[3]}
        </li>
      </ul>
    )
  },
)

const HeadLine: FC<{ title: string; suc?: boolean; addon?: ReactNode }> = memo(
  ({ title, suc, addon }) => {
    return (
      <div className="bg-ground-3 flex text-white h-[34px] justify-between items-center px-2">
        <div>
          {title}
          {suc === true && <CheckCircleFilled className="text-green-400" />}
          {suc === false && <CloseCircleFilled className="text-red-400" />}
        </div>
        <div className="">{addon}</div>
      </div>
    )
  },
)

enum KCYPPictureImageType {
  /**
   * 舟山 前方照
   */
  FRONT = '1',

  /**
   * 舟山 后方照
   */
  BACK = '9',

  /**
   * 舟山 细目照
   */
  HIT = '25',

  /**
   * 舟山 正上方全景照片
   * 俯拍照片
   */
  OVER_LOOK = '2',
}

const options = [
  { label: '前方照', value: KCYPPictureImageType.FRONT },
  { label: '后方照', value: KCYPPictureImageType.BACK },
  { label: '细目照', value: KCYPPictureImageType.HIT },
  { label: '正上方全景照片', value: KCYPPictureImageType.OVER_LOOK },
]

type PropsType = {
  open: boolean
  orderData: API_KCYP.domain.ZSOrderRecord
  aiResultData: API_ACTION.domain.AIResultRecord[]
  checkResultIds: string[]
  onClose?: () => void
}

/** 快处易赔 校验信息 */
const KCYPZSVerificationModal: FC<PropsType> = memo(
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

    // const cardTypeOptions = useDictOptions(DictEnum.XIAOSHAN_KCYP_CARD_TYPE)
    const carTypeOptions = useDictOptions(DictEnum.ZHOUSHAN_KCYP_CAR_TYPE)

    const deptOptions = useDictOptions(DictEnum.ZHOUSHAN_KCYP_DEPT_TYPE)
    const accidentTypeOptions = useDictOptions(
      DictEnum.ZHOUSHAN_KCYP_ACCIDENT_TYPE,
    )
    const accidentFromOptions = useDictOptions(
      DictEnum.ZHOUSHAN_KCYP_ACCIDENT_FORM,
    )
    const accidentCollisionOptions = useDictOptions(
      DictEnum.ZHOUSHAN_KCYP_ACCIDENT_COLLISION,
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
          })
        })
      },
      true,
    )

    const queryClient = useQueryClient()

    /** 敬请推送 */
    const handleCommitInformation = async () => {
      await form.validateFields()
      const values = form.getFieldsValue()
      values.caseId = orderData.caseId
      values.longitude = longitude
      values.latitude = latitude
      values.caseHapTime = dayjs(values.caseHapTime).format(
        'YYYY-MM-DD HH:mm:ss',
      )
      // values.dept = '330400000000' MOCK 调试使用
      await commitZSKCYPInfoOrder(values)
      await queryClient.invalidateQueries({
        queryKey: ['getZSKCYPOrder', orderData.caseId],
      })
    }

    const [pictureCommitForm] = Form.useForm()

    useEffect(() => {
      const pictures = shouldJson(orderData.pictures)

      if (pictures) {
        pictures.forEach((picture, i) => {
          pictureCommitForm.setFieldValue(`pictureType-${i}`, picture.imageType)
        })
      }
    }, [orderData.pictures])

    /** 提交图片 */
    const handleSubmitPictures = async () => {
      await pictureCommitForm.validateFields()
      const values = pictureCommitForm.getFieldsValue()

      await commitZSKCYPPictures({
        caseId: orderData.caseId,
        policeNumber: orderData.policeInformationId,
        pictures: checkResults.map((e, i) => ({
          pictureUrl: e.image || e.sourceImage,
          imageType: values[`pictureType-${i}`],
        })),
      })
      await queryClient.invalidateQueries({
        queryKey: ['getZSKCYPOrder', orderData.caseId],
      })
    }

    const [timeRange, setTimeRange] = useState<
      [Dayjs | null, Dayjs | null] | null
    >(null)

    // const timeRangeTS = useMemo(() => {
    //   if (!timeRange || timeRange[0] === null || timeRange[1] === null) {
    //     return null
    //   }
    //   return [timeRange[0].valueOf(), timeRange[1].valueOf()] as [
    //     number,
    //     number,
    //   ]
    // }, [timeRange])

    // const { data: videoUrlResp } = useQuery({
    //   queryKey: ['getZSKCYPVideoURL', timeRangeTS],
    //   enabled: !!timeRangeTS,
    //   queryFn: () =>
    //     getZSKCYPVideoURL({
    //       deviceId: checkResults[0].deviceId,
    //       begin: timeRangeTS![0],
    //       end: timeRangeTS![1],
    //     }),
    // })

    const msgApi = useAppMsg()
    const handleSubmitVideo = async () => {
      if (!timeRange || timeRange[0] === null || timeRange[1] === null) {
        msgApi.error('请选择视频时间范围')
        return
      }
      await commitZSKCYPVideo({
        caseId: orderData.caseId,
        policeNumber: orderData.policeInformationId!,
        deviceId: checkResults[0].deviceId,
        begin: timeRange[0].valueOf(),
        end: timeRange[1].valueOf(),
      })
      await queryClient.invalidateQueries({
        queryKey: ['getZSKCYPOrder', orderData.caseId],
      })
    }

    return (
      <XModal
        open={open}
        title="校验信息"
        width={800}
        footer={false}
        onClose={onClose}
      >
        <p className="text-fore">校验以下信息后发送至大数据中心</p>
        <div className="my-3 text-white max-h-[456px] overflow-y-auto">
          <Form form={form}>
            <HeadLine
              title="一方当事人信息"
              addon={
                <AsyncButton
                  type="primary"
                  size="small"
                  disabled={orderData.processResult !== 0}
                  onClick={handleCommitInformation}
                >
                  {orderData.processResult !== 0 ? '已提交' : '提交'}
                </AsyncButton>
              }
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
                '一方证件号码',
                <Form.Item name="cardNo" noStyle>
                  <Input />
                </Form.Item>,
                null,
                null,
              ]}
            />

            <Line
              items={[
                '另一方姓名',
                <Form.Item name="oDriverName" noStyle>
                  <Input />
                </Form.Item>,
                '另一方手机号',
                <Form.Item
                  name="oPhone"
                  noStyle
                  rules={[{ pattern: phoneReg }]}
                >
                  <Input />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '另一方证件号码',
                <Form.Item name="oCardNo" noStyle>
                  <Input />
                </Form.Item>,
                null,
                null,
              ]}
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
                '另一方车牌号码',
                <Form.Item name="oCarNo" noStyle>
                  <Select className="w-full" options={plateNoOptions} />
                </Form.Item>,
                '另一方车牌种类',
                <Form.Item name="oCarType" noStyle>
                  <Select className="w-full" options={carTypeOptions} />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '责任单位',
                <Form.Item name="dept" noStyle>
                  <Select className="w-full" options={deptOptions} />
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

            <Line
              items={[
                '事故时间',
                <Form.Item name="caseHapTime" className="w-full" noStyle>
                  <DatePicker className="w-full" showTime />
                </Form.Item>,
                '事故地点',
                <Form.Item
                  name="caseHapAddress"
                  className="w-full"
                  rules={[{ required: true }]}
                  noStyle
                >
                  <Input className="w-full" />
                </Form.Item>,
              ]}
            />
            <Line
              items={[
                '事故处理程序',
                <Form.Item name="procedureType" className="w-full" noStyle>
                  <Select
                    className="w-full"
                    options={[
                      {
                        label: '简易程序',
                        value: 1,
                      },
                      {
                        label: '一般程序',
                        value: 2,
                      },
                    ]}
                  />
                </Form.Item>,
                null,
                null,
              ]}
            />
          </Form>

          <HeadLine
            title="现场照片信息"
            addon={
              <AsyncButton
                type="primary"
                size="small"
                disabled={
                  orderData.processResult !==
                    ZhoushanProcessResultEnum.PUSHED_CASE_ONLY ||
                  !orderData.policeInformationId
                }
                onClick={handleSubmitPictures}
              >
                {orderData.processResult <
                ZhoushanProcessResultEnum.PUSHED_CASE_AND_PHOTO
                  ? '提交'
                  : '已提交'}
              </AsyncButton>
            }
          />
          <Form form={pictureCommitForm}>
            <div className="flex gap-3 mt-2">
              {checkResults.map((e, i) => (
                <div key={e.id} className="flex-1">
                  <div className="mb-2">
                    <Form.Item
                      name={`pictureType-${i}`}
                      rules={[{ required: true, message: '请选择对应照片' }]}
                    >
                      <Select
                        className="w-full"
                        options={options}
                        placeholder="请选择对应照片"
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

          <HeadLine
            title="现场视频信息"
            addon={
              <div>
                <DatePicker.RangePicker
                  showTime
                  size="small"
                  className="mr-2"
                  value={timeRange}
                  onChange={setTimeRange}
                />
                <AsyncButton
                  type="primary"
                  size="small"
                  disabled={
                    orderData.processResult !==
                      ZhoushanProcessResultEnum.PUSHED_CASE_AND_PHOTO ||
                    !orderData.policeInformationId ||
                    !timeRange ||
                    timeRange[0] === null ||
                    timeRange[1] === null
                  }
                  onClick={handleSubmitVideo}
                >
                  {orderData.processResult <
                  ZhoushanProcessResultEnum.PUSHED_ALL
                    ? '提交'
                    : '已提交'}
                </AsyncButton>
              </div>
            }
          />
        </div>
      </XModal>
    )
  },
)

KCYPZSVerificationModal.displayName = 'NormalVerificationModal'

export default KCYPZSVerificationModal
