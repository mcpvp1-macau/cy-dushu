import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'

type PropsType = unknown
const UavReconstruction: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  /**最大支持重建面积，单位km² */
  const MAX_AREA = 20

  const enableReconstruction = useUavControlRoomStore(
    (s) => s.enableReconstruction,
  )
  const reconstructionState = useState<
    'start' | 'drawing' | 'setting' | 'max' | 'reconstructing'
  >('start')

  return (
    <>
      {enableReconstruction && (
        <div
          className="absolute p-6 top-16 left-1/2 -translate-x-1/2 w-4/5 text-center"
          style={{ backgroundColor: '#0009' }}
        >
          {t('controlRoom.uav.service.reconstruction.startInfo') +
            ` ${MAX_AREA}km²`}
        </div>
      )}
    </>
  )
})

UavReconstruction.displayName = 'Reconstruction'

export default UavReconstruction
