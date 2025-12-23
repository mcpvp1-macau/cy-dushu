import AppViewSuspense from '@/components/AppViewSuspense'
import { ActionEnum } from '@/constant/action/action_type'
import { lazy } from 'react'

const KCYPNormalPanel = lazy(() => import('./shanghai/Panel'))
const KCYPXSPanel = lazy(() => import('./xiaoshan/Panel'))
const KCYPZSPanel = lazy(() => import('./zhoushan/Panel'))

type PropsType = {
  actionId: number
  actionType: string
}

const KCYPPanel: FC<PropsType> = memo(({ actionId, actionType }) => {
  return (
    <AppViewSuspense>
      {actionType === ActionEnum.KCYP ? (
        <KCYPNormalPanel actionId={actionId} />
      ) : actionType === ActionEnum.KCYPXS ? (
        <KCYPXSPanel actionId={actionId} />
      ) : actionType === ActionEnum.KCYPZS ? (
        <KCYPZSPanel actionId={actionId} />
      ) : (
        'error'
      )}
    </AppViewSuspense>
  )
})

KCYPPanel.displayName = 'KCYPPanel'

export default KCYPPanel
