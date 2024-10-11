import { ComponentProps, memo, type FC } from 'react'
import { useCesium } from 'resium'
import BoardMarker3D from '@/components/map/BoardCesium/BoardMarker3D'
import SignalCellBoardContent from './BoardContent'

type PropsType = ComponentProps<typeof SignalCellBoardContent>

const SignalBoardMarker: FC<PropsType> = memo((props) => {
  const { viewer } = useCesium()

  return (
    <>
      {viewer && (
        <BoardMarker3D
          map={viewer}
          id={props.h3code}
          lng={props.lng}
          lat={props.lat}
          height={0}
        >
          <SignalCellBoardContent {...props} />
        </BoardMarker3D>
      )}
    </>
  )
})

SignalBoardMarker.displayName = 'SignalBoardMarker'

export default SignalBoardMarker
