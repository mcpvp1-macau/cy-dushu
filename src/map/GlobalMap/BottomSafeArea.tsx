import { useMemoizedFn } from 'ahooks'
import { memo, type FC } from 'react'

type PropsType = unknown

const BottomSafeArea: FC<PropsType> = memo(() => {
  // const leftHide = useModel('leftNav', (m) => m.leftHide);
  // const currentMode = useModel('leftNav', (m) => m.currentMode);

  const getLeft = useMemoizedFn(() => {
    // if (currentMode === 'deviceBack') {
    //   return '38px';
    // }
    // return leftHide ? '38px' : '388px';
    return '348px'
  })
  return (
    <div
      id="bottom-safe-area"
      className={clsx(
        'absolute bottom-[20px] right-[56px] min-h-[114px] p-3 z-10',
        'flex items-end gap-3',
        'overflow-hidden',
      )}
      style={{
        left: `calc(${getLeft()})`,
      }}
    ></div>
  )
})

BottomSafeArea.displayName = 'BottomSaveArea'

export default BottomSafeArea
