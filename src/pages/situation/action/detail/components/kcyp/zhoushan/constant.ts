import { XFormItem } from '@/components/XForm/types'
import { TFunction } from 'i18next'

type Option = { label: ReactNode; value: any }

export const createFormItems = ({
  t,
  carTypeOptions,
}: {
  t: TFunction
  carTypeOptions: Option[]
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
    },
    {
      label: t('action.detail.kcyp.form.cardNo.label'),
      name: 'cardNo',
      type: 'input',
      colsProps: { span: 24 },
    },
    {
      label: t('action.detail.kcyp.form.carType.label'),
      name: 'carType',
      type: 'select',
      options: carTypeOptions,
    },
    {
      label: t('action.detail.kcyp.form.carNo.label'),
      name: 'carNo',
      type: 'input',
    },
    // ---
    {
      label: t('action.detail.kcyp.form.otherDriverName.label'),
      name: 'oDriverName',
      type: 'input',
    },
    {
      label: t('action.detail.kcyp.form.otherPhone.label'),
      name: 'oPhone',
      type: 'input',
    },
    {
      label: t('action.detail.kcyp.form.otherCardNo.label'),
      name: 'oCardNo',
      type: 'input',
      colsProps: { span: 24 },
    },
    {
      label: t('action.detail.kcyp.form.otherCarType.label'),
      name: 'oCarType',
      type: 'select',
      options: carTypeOptions,
    },
    {
      label: t('action.detail.kcyp.form.otherCarNo.label'),
      name: 'oCarNo',
      type: 'input',
    },
  ] as XFormItem[]
