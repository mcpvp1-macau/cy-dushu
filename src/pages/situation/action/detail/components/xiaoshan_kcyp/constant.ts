import { XFormItem } from '@/components/XForm/types'
import { TFunction } from 'i18next'

type Option = { label: ReactNode; value: any }

export const createFormItems = ({
  t,
  cardTypeOptions,
  carTypeOptions,
}: {
  t: TFunction
  cardTypeOptions: Option[]
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
      label: t('action.detail.kcyp.form.idType.label'),
      name: 'idType',
      type: 'select',
      options: cardTypeOptions,
    },
    {
      label: t('action.detail.kcyp.form.cardNo.label'),
      name: 'cardNo',
      type: 'input',
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
      name: 'otherDriverName',
      type: 'input',
    },
    {
      label: t('action.detail.kcyp.form.otherPhone.label'),
      name: 'otherPhone',
      type: 'input',
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
    },
    {
      label: t('action.detail.kcyp.form.otherCarType.label'),
      name: 'otherCarType',
      type: 'select',
      options: carTypeOptions,
    },
    {
      label: t('action.detail.kcyp.form.otherCarNo.label'),
      name: 'otherCarNo',
      type: 'input',
    },
  ] as XFormItem[]
