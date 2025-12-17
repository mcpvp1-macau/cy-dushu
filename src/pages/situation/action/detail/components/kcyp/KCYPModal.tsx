import type { FC } from 'react'
import { Suspense, lazy, memo } from 'react'
import { LoadingOutlined } from '@ant-design/icons'

import { ActionEnum } from '@/constant/action/action_type'

const ZSKCYPModal = lazy(() => import('./zhoushan/Modal'))
const ZSBIWUModal = lazy(() => import('../zhoushan_biwu/Modal'))
const SHJHKCYPModal = lazy(() => import('./shanghai/Modal'))
const XSKCYPModal = lazy(() => import('./xiaoshan/Modal'))

type Props = {
  actionId: string
  actionType?: API_ACTION.domain.ActionDetail['type']
  detail?: API_ACTION.domain.ActionDetail
  isBacktracking?: boolean
}

const KCYPModal: FC<Props> = memo(
  ({ actionId, actionType, detail, isBacktracking = false }) => {
    const validActionTypes = new Set<ActionEnum>([
      ActionEnum.KCYP,
      ActionEnum.KCYPXS,
      ActionEnum.KCYPZS,
      ActionEnum.BIWU,
    ])

    if (
      !actionType ||
      isBacktracking ||
      !validActionTypes.has(actionType as ActionEnum)
    ) {
      return null
    }

    const typedActionType = actionType as ActionEnum

    const modalProps = { actionId, actionType: typedActionType, detail }

    const modal = (() => {
      switch (typedActionType) {
        case ActionEnum.KCYPZS:
          return <ZSKCYPModal {...modalProps} />
        case ActionEnum.BIWU:
          return <ZSBIWUModal {...modalProps} />
        case ActionEnum.KCYP:
          return <SHJHKCYPModal {...modalProps} />
        case ActionEnum.KCYPXS:
          return <XSKCYPModal {...modalProps} />
        default:
          return null
      }
    })()

    if (!modal) {
      return null
    }

    return <Suspense fallback={<LoadingOutlined />}>{modal}</Suspense>
  },
)

KCYPModal.displayName = 'KCYPModal'

export default KCYPModal
