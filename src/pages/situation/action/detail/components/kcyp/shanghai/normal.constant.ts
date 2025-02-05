import { XFormItem } from '@/components/XForm/types'
import { ProcessStatusEnum } from '@/service/modules/action/kcyp/enum'
import { idCardReg, phoneReg } from '@/constant/regExp'
import { ReactNode } from 'react'
import { TFunction } from 'i18next'

export const statusColorMap: Record<
  ProcessStatusEnum,
  { color: string; label: Record<string, string> }
> = {
  INIT: {
    color: '#BFCCD6',
    label: {
      en: 'Not Submitted',
      zh: '未提交',
    },
  },
  PROCESSING: {
    color: '#4C90F0',
    label: {
      en: 'Processing',
      zh: '处理中',
    },
  },
  TIMEOUT: {
    color: '#DD4444',
    label: {
      en: 'Timeout',
      zh: '超时',
    },
  },
  COMPLETE: {
    color: '#15B371',
    label: {
      en: 'Completed',
      zh: '已完成',
    },
  },
  RESP_ERROR: {
    color: '#DD4444',
    label: {
      en: 'Error',
      zh: '处理错误',
    },
  },
}

type Option = { label: ReactNode; value: any }

export const createFormItems = ({
  t,
  cardTypeOptions,
  brokenPartTypeOptions,
  firstSceneOptions,
  accidentTypeOptions,
}: {
  t: TFunction
  cardTypeOptions: Option[]
  brokenPartTypeOptions: Option[]
  firstSceneOptions: Option[]
  accidentTypeOptions: Option[]
}) =>
  [
    {
      label: t('action.detail.kcyp.form.driverName.label'),
      name: 'driverName',
      type: 'input',
    },
    {
      label: t('action.detail.kcyp.form.phone.label'),
      name: 'phone',
      type: 'input',
      rules: [
        { pattern: phoneReg, message: t('action.detail.kcyp.form.phone.msg') },
      ],
    },
    {
      label: t('action.detail.kcyp.form.idType.label'),
      name: 'idType',
      type: 'select',
      options: cardTypeOptions,
    },
    {
      label: t('action.detail.kcyp.form.cardNo.label'),
      name: 'cardNo',
      type: 'input',
      rules: [
        {
          pattern: idCardReg,
          message: t('action.detail.kcyp.form.cardNo.msg'),
        },
      ],
    },
    {
      label: t('action.detail.kcyp.form.otherDriverName.label'),
      name: 'otherDriverName',
      type: 'input',
    },
    {
      label: t('action.detail.kcyp.form.otherPhone.label'),
      name: 'otherPhone',
      type: 'input',
      rules: [
        { pattern: phoneReg, message: t('action.detail.kcyp.form.phone.msg') },
      ],
    },
    {
      label: t('action.detail.kcyp.form.otherIdType.label'),
      name: 'otherIdType',
      type: 'select',
      options: cardTypeOptions,
    },
    {
      label: t('action.detail.kcyp.form.otherCardNo.label'),
      name: 'otherCardNo',
      type: 'input',
      rules: [
        {
          pattern: idCardReg,
          message: t('action.detail.kcyp.form.cardNo.msg'),
        },
      ],
    },
    {
      label: t('action.detail.kcyp.form.brokenPart.label'),
      name: 'brokenPart',
      type: 'select',
      options: brokenPartTypeOptions,
    },
    {
      label: t('action.detail.kcyp.form.otherBrokenPart.label'),
      name: 'otherBrokenPart',
      type: 'select',
      options: brokenPartTypeOptions,
    },
    {
      label: t('action.detail.kcyp.form.carNo.label'),
      name: 'carNo',
      type: 'input',
    },
    {
      label: t('action.detail.kcyp.form.otherCarNo.label'),
      name: 'otherCarNo',
      type: 'input',
    },
    {
      label: t('action.detail.kcyp.form.firstScene.label'),
      name: 'firstScene',
      type: 'select',
      options: firstSceneOptions,
    },
    {
      label: t('action.detail.kcyp.form.accidentTime.label'),
      name: 'accidentType',
      type: 'select',
      options: accidentTypeOptions,
    },
  ] as XFormItem[]
