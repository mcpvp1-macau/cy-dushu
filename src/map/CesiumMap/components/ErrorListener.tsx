import { postServerLog } from '@/service/modules/logs'
import { memo, useEffect, type FC } from 'react'
import { useCesium } from 'resium'

type PropsType = {
  onRenderError?: (error: any) => void
}

const ErrorListener: FC<PropsType> = memo(({ onRenderError }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const removeErrorListener = viewer?.scene?.renderError.addEventListener(
      (_instance, error) => {
        postServerLog('error', error)
        console.error(error)
        onRenderError?.(error)
      },
    )

    return () => {
      removeErrorListener?.()
    }
  }, [])

  return null
})

ErrorListener.displayName = 'ErrorListener'

export default ErrorListener
