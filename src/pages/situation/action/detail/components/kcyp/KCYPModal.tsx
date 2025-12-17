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
    if (
      !actionType ||
      isBacktracking ||
      ![
        'kcyp_action',
        'xiaoshan_kcyp_action',
        'zs_kcyp_action',
        'biwu_action',
      ].includes(actionType)
    ) {
      return null
    }

    const renderModal = () => {
      if (actionType === 'zs_kcyp_action') {
        return (
          <ZSKCYPModal
            actionId={actionId}
            actionType={actionType}
            detail={detail}
          />
        )
      }

      if (actionType === 'biwu_action') {
        return (
          <ZSBIWUModal
            actionId={actionId}
            actionType={actionType}
            detail={detail}
          />
        )
      }

      if (actionType === ActionEnum.KCYP) {
        return (
          <SHJHKCYPModal
            actionId={actionId}
            actionType={actionType}
            detail={detail}
          />
        )
      }

      if (actionType === ActionEnum.KCYPXS) {
        return (
          <XSKCYPModal
            actionId={actionId}
            actionType={actionType}
            detail={detail}
          />
        )
      }

      return null
    }

    const modal = renderModal()

    if (!modal) {
      return null
    }

    return <Suspense fallback={<LoadingOutlined />}>{modal}</Suspense>
  },
)

KCYPModal.displayName = 'KCYPModal'

export default KCYPModal
