type PropsType = {
  state:
    | 'drawing'
    | 'setting'
    | 'error_max'
    | 'error_min'
    | 'reconstructing'
    | 'reconstruction_end'
  MAX_RADIUS: number
  MIN_RADIUS: number
}
const MapInfo: FC<PropsType> = memo(({ state, MAX_RADIUS, MIN_RADIUS }) => {
  const { t } = useTranslation()

  const infoMsg = () => {
    switch (state) {
      case 'drawing':
        return (
          t('controlRoom.uav.service.reconstruction.startInfo1') +
          ` ${MAX_RADIUS}m ` +
          t('controlRoom.uav.service.reconstruction.startInfo2') +
          ` ${MIN_RADIUS}m`
        )
      case 'error_max':
        return t('controlRoom.uav.service.reconstruction.error_max')
      case 'error_min':
        return t('controlRoom.uav.service.reconstruction.error_min')
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
