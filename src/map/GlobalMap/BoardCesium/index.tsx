import React from 'react'
import { useCesium } from 'resium'
import HoverDetail from './HoverDetail'
import useBoardObjStore from '@/store/map/useBoardObj.store'

type Props = Record<string, never>

const BoardCesium: React.FC<Props> = () => {
  const boardObj = useBoardObjStore((s) => s.boardObj)
  const boardOpenMap = useBoardObjStore((s) => s.boardOpenMap)
  const { viewer } = useCesium()

  if (!viewer) return null
  return (
    <div>
      {Object.keys(boardObj).map((targetId) => {
        return boardOpenMap[targetId] ? (
          <HoverDetail
            key={targetId}
            item={boardObj[targetId]}
            option={{
              autoPosition: true,
            }}
          />
        ) : null
      })}
    </div>
  )
}

export default React.memo(BoardCesium)
