import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import { Button, Tooltip } from 'antd'
import { useBoolean } from 'ahooks'
import { FC, useMemo } from 'react'
import { XFormItem } from '@/components/XForm/types'
import FormModal from '@/components/XForm/Modal'
import { useTranslation } from 'react-i18next'
import useFlightReporting from '@/hooks/jinghang/useFlightReporting'
import globalConfig from '@/global/config'

interface TakeoffActionProps {
  childDeviceId?: string
  modeCode?: number
  onConfirm: (values: any) => Promise<void>
}

const TakeoffAction: FC<TakeoffActionProps> = ({
  childDeviceId,
  modeCode = 0,
  onConfirm,
}) => {
  const { t } = useTranslation()
  const [open, { setTrue, setFalse }] = useBoolean(false)

  const {
    isCanFly: canTakeoff,
    reason: cannotTakeoffReason,
    isLoading: isLoadingFlightReporting,
    flightAltitudeLimit,
    returnAltitudeLimit,
  } = useFlightReporting(childDeviceId)

  const maxFlightAltitude = useMemo(
    () => flightAltitudeLimit ?? globalConfig.uavHeightLimit,
    [flightAltitudeLimit],
  )

  const maxReturnAltitude = useMemo(
    () => returnAltitudeLimit ?? globalConfig.uavHeightLimit,
    [returnAltitudeLimit],
  )

  const items = useMemo(
    () =>
      [
        {
          label: t('device.uav.takeoffForm.takeoffHeight.title'),
          name: 'height',
          type: 'input-number',
          rules: [
            {
              required: true,
              message: t('device.uav.takeoffForm.takeoffHeight.required_msg'),
            },
          ],
          otherProps: {
            style: { width: '100%' },
            min: 1,
            max: maxFlightAltitude,
          },
        },
        {
          label: t('device.uav.takeoffForm.goHomeAltitude.title'),
          name: 'gohomeAltitude',
          type: 'input-number',
          otherProps: {
            style: { width: '100%' },
            min: 50,
            max: maxReturnAltitude,
          },
        },
      ] as XFormItem[],
    [maxFlightAltitude, maxReturnAltitude, t],
  )

  const initialValues = useMemo(
    () => ({
      ...(flightAltitudeLimit === undefined || flightAltitudeLimit === null
        ? {}
        : { height: flightAltitudeLimit }),
      ...(returnAltitudeLimit === undefined || returnAltitudeLimit === null
        ? {}
        : { gohomeAltitude: returnAltitudeLimit }),
    }),
    [flightAltitudeLimit, returnAltitudeLimit],
  )

  return (
    <>
      <Tooltip title={!canTakeoff ? cannotTakeoffReason : undefined}>
        <Button
          loading={isLoadingFlightReporting}
          disabled={modeCode !== 0 || !canTakeoff}
          block
          className="h-7"
          icon={<IconTakeoff />}
          onClick={setTrue}
        >
          {t('device.uavDock.takeoffForm.title')}
        </Button>
      </Tooltip>

      {open && (
        <FormModal
          initialValues={initialValues}
          localInitialValues={
            !globalConfig.useFlightReporting
              ? { key: 'uav_takeoff' }
              : undefined
          }
          title={`${t('device.uavDock.takeoffForm.title')} ALT(m)`}
          open={open}
          items={items}
          onClose={setFalse}
          onConfirm={onConfirm}
          confirmLoading={modeCode !== 0}
        />
      )}
    </>
  )
}

export default TakeoffAction
