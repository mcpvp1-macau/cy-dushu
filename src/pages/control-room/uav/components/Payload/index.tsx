import AppCollapse from '@/components/AppCollapse'
import AppEmpty from '@/components/AppEmpty'
import { memo, type FC } from 'react'

type PropsType = unknown

/** 无人机负载 */
const UavPayload: FC<PropsType> = memo(() => {
  return (
    <AppCollapse
      items={[{ label: '降落伞', key: 'parachute', children: <AppEmpty /> }]}
    />
  )
})

UavPayload.displayName = 'UavPayload'

export default UavPayload
