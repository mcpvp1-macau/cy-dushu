import { XFormItem } from '@/components/XForm/types'
import { ProcessStatusEnum } from '@/service/modules/action/kcyp/enum'
import { idCardReg, phoneReg } from '@/constant/regExp'
import { ReactNode } from 'react'

export const statusColorMap: Record<
  ProcessStatusEnum,
  { color: string; label: string }
> = {
  INIT: {
    color: '#BFCCD6',
    label: '未提交',
  },
  PROCESSING: {
    color: '#4C90F0',
    label: '处理中',
  },
  TIMEOUT: {
    color: '#DD4444',
    label: '超时',
  },
  COMPLETE: {
    color: '#15B371',
    label: '已完成',
  },
  RESP_ERROR: {
    color: '#DD4444',
    label: '处理错误',
  },
}

type Option = { label: ReactNode; value: any }

export const createFormItems = ({
  cardTypeOptions,
  brokenPartTypeOptions,
  firstSceneOptions,
  accidentTypeOptions,
}: {
  cardTypeOptions: Option[]
  brokenPartTypeOptions: Option[]
  firstSceneOptions: Option[]
  accidentTypeOptions: Option[]
}) =>
  [
    {
      label: '一方姓名',
      name: 'driverName',
      type: 'input',
    },
    {
      label: '一方手机号',
      name: 'phone',
      type: 'input',
      rules: [{ pattern: phoneReg, message: '请输入手机号' }],
    },
    {
      label: '一方证件类型',
      name: 'idType',
      type: 'select',
      options: cardTypeOptions,
    },
    {
      label: '一方证件号码',
      name: 'cardNo',
      type: 'input',
      rules: [{ pattern: idCardReg, message: '请输入正确的身份证号码' }],
    },
    {
      label: '另一方姓名',
      name: 'otherDriverName',
      type: 'input',
    },
    {
      label: '另一方手机号',
      name: 'otherPhone',
      type: 'input',
      rules: [{ pattern: phoneReg, message: '请输入手机号' }],
    },
    {
      label: '另一方证件类型',
      name: 'otherIdType',
      type: 'select',
      options: cardTypeOptions,
    },
    {
      label: '另一方证件号码',
      name: 'otherCardNo',
      type: 'input',
      rules: [{ pattern: idCardReg, message: '请输入正确的身份证号码' }],
    },
    {
      label: '一方车辆受损部位',
      name: 'brokenPart',
      type: 'select',
      options: brokenPartTypeOptions,
    },
    {
      label: '另一方车辆受损部位',
      name: 'otherBrokenPart',
      type: 'select',
      options: brokenPartTypeOptions,
    },
    {
      label: '一方车牌号',
      name: 'carNo',
      type: 'input',
    },
    {
      label: '另一方车牌号',
      name: 'otherCarNo',
      type: 'input',
    },
    {
      label: '是否第一现场',
      name: 'firstScene',
      type: 'select',
      options: firstSceneOptions,
    },
    {
      label: '事故类型',
      name: 'accidentType',
      type: 'select',
      options: accidentTypeOptions,
    },
  ] as XFormItem[]
