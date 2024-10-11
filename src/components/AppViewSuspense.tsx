import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import { type ReactNode, Suspense, type FC } from 'react'

type PropsType = {
  fallbackDescription?: string
  children?: ReactNode
  iconLoading?: boolean
}

/** 视图加载菊花 */
const AppViewSuspense: FC<PropsType> = ({
  fallbackDescription,
  iconLoading,
  children,
}) => {
  return (
    <Suspense
      fallback={
        iconLoading ? (
          <LoadingOutlined />
        ) : (
          <div className="py-6 flex justify-center">
            <Spin />
            {fallbackDescription && (
              <p className="mt-3">{fallbackDescription}</p>
            )}
          </div>
        )
      }
    >
      {children}
    </Suspense>
  )
}

export default AppViewSuspense
