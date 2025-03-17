type PropsType = {
  state: 'drawing' | 'setting' | 'error_max' | 'reconstructing'
  MAX_AREA: number
}
const MapInfo: FC<PropsType> = memo(({ state, MAX_AREA }) => {
  const { t } = useTranslation()

  const infoMsg = () => {
    switch (state) {
      case 'drawing':
        return (
          t('controlRoom.uav.service.reconstruction.startInfo') +
          ` ${MAX_AREA}km²`
        )
      case 'error_max':
        return t('controlRoom.uav.service.reconstruction.error_max')
      case 'reconstructing':
        return t('controlRoom.uav.service.reconstruction.reconstructingInfo')
      default:
        return ''
    }
  }

  return (
    !!infoMsg() && (
      <div
        className="absolute p-6 top-16 left-1/2 -translate-x-1/2 w-4/5 text-center"
        style={{ backgroundColor: '#0009' }}
      >
        {infoMsg()}
      </div>
    )
  )
})

MapInfo.displayName = 'MapInfo'

export default MapInfo
