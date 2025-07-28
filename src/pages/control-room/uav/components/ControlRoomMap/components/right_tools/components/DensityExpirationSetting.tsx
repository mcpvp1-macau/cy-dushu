import IconHeatMap from '@/assets/icons/jsx/IconHeatMap'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import FormModal from '@/components/XForm/Modal'
import useDensityMapStore from '@/store/map/useDensityMap.store'
import { ClockCircleOutlined } from '@ant-design/icons'

type PropsType = unknown

const DensityExpirationSetting: FC<PropsType> = memo(() => {
  const [open, { toggle }] = useBoolean()
  const densityMapExpiration = useDensityMapStore((s) => s.densityMapExpiration)

  const handleConfirm = async (values) => {
    useDensityMapStore.getState().updateDensityMapExpiration(values.expiration)
    toggle()
  }

  return (
    <>
      <FloatIconButton
        toolTipProps={{
          title: '密集有效期',
          placement: 'left',
        }}
        active={open}
        onClick={toggle}
      >
        <IconHeatMap />
      </FloatIconButton>
      {open && (
        <FormModal
          title={
            <div>
              <ClockCircleOutlined /> 密集有效期设置
            </div>
          }
          open={open}
          items={[
            {
              label: '有效期',
              name: 'expiration',
              type: 'input-number',
              otherProps: {
                min: 1,
                max: 1440, // 最大1440分钟，即24小时
                step: 1,
                suffix: 'mins',
              },
            },
          ]}
          initialValues={{ expiration: densityMapExpiration }}
          onClose={toggle}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
})

DensityExpirationSetting.displayName = 'DensityExpirationSetting'

export default DensityExpirationSetting
