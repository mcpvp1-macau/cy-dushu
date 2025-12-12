import { Button } from 'antd'
import type { PopconfirmProps } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import clsx from 'clsx'
import type { ReactElement } from 'react'
import { Children, isValidElement } from 'react'
import type { Placement } from 'tippy.js'
import LiqunTippy from './LiqunTippy'

type LiqunPopConfirmProps = PopconfirmProps & { okCancel?: boolean }

const LiqunPopConfirm: FC<LiqunPopConfirmProps> = (props) => {
  const {
    children,
    title,
    description,
    icon,
    okText,
    cancelText,
    okType = 'primary',
    okButtonProps,
    cancelButtonProps,
    okCancel = true,
    onConfirm,
    onCancel,
    overlayClassName,
    overlayStyle,
    placement = 'top',
    trigger = 'click',
    open,
    defaultOpen,
    disabled,
    zIndex,
    arrow,
    getPopupContainer,
    onOpenChange,
    ...restProps
  } = props

  const { t } = useTranslation()
  const [innerOpen, setInnerOpen] = useState(defaultOpen ?? false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : innerOpen

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (!isControlled) {
      setInnerOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  })

  const handleConfirm = useMemoizedFn(
    async (e: Parameters<NonNullable<PopconfirmProps['onConfirm']>>[0]) => {
      await onConfirm?.(e)
      handleOpenChange(false)
    },
  )

  const handleCancel = useMemoizedFn(
    async (e: Parameters<NonNullable<PopconfirmProps['onCancel']>>[0]) => {
      onCancel?.(e)
      handleOpenChange(false)
    },
  )

  const handleTrigger = useMemoizedFn(() => {
    if (disabled) return
    handleOpenChange(!isOpen)
  })

  const handleClickOutside = useMemoizedFn(() => {
    handleOpenChange(false)
  })

  const appendTo = useMemo(() => {
    if (!getPopupContainer) return undefined
    return (node: Element | null) => getPopupContainer(node as HTMLElement)
  }, [getPopupContainer])

  const tippyPlacement = useMemo<Placement>(() => {
    const map: Record<string, Placement> = {
      topLeft: 'top-start',
      topRight: 'top-end',
      leftTop: 'left-start',
      leftBottom: 'left-end',
      rightTop: 'right-start',
      rightBottom: 'right-end',
      bottomLeft: 'bottom-start',
      bottomRight: 'bottom-end',
    }
    return map[placement as keyof typeof map] ?? (placement as Placement)
  }, [placement])

  const resolvedTitle = useMemo(() => {
    return typeof title === 'function' ? title() : title
  }, [title])

  const resolvedDescription = useMemo(() => {
    return typeof description === 'function' ? description() : description
  }, [description])

  const isDangerType = okType === 'danger'

  const tippyArrow = useMemo(() => {
    if (typeof arrow === 'object') return true
    return arrow
  }, [arrow])

  const safeChildren = useMemo(() => {
    if (isValidElement(children)) {
      return Children.only(children) as ReactElement
    }
    return <span>{children}</span>
  }, [children])

  const content = (
    <div
      className={clsx(
        'min-w-[240px] max-w-[360px] space-y-3',
        'text-sm text-[rgb(var(--fore-color))]',
        overlayClassName,
      )}
      style={overlayStyle}
    >
      {(resolvedTitle ?? resolvedDescription) && (
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-yellow-500">
            {icon ?? <ExclamationCircleFilled />}
          </span>
          <div className="flex-1 space-y-1">
            {resolvedTitle ? (
              <div className="font-semibold leading-5">{resolvedTitle}</div>
            ) : null}
            {resolvedDescription ? (
              <div className="text-xs leading-5 text-gray-500">{resolvedDescription}</div>
            ) : null}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        {okCancel ? (
          <Button size="small" onClick={handleCancel} {...cancelButtonProps}>
            {cancelText ?? t('modal.cancel')}
          </Button>
        ) : null}
        <Button
          size="small"
          type={isDangerType ? 'primary' : okType}
          danger={okButtonProps?.danger || isDangerType}
          onClick={handleConfirm}
          {...okButtonProps}
        >
          {okText ?? t('modal.confirm')}
        </Button>
      </div>
    </div>
  )

  return (
    <LiqunTippy
      {...restProps}
      zIndex={zIndex}
      disabled={disabled}
      placement={tippyPlacement}
      trigger={trigger as Parameters<typeof LiqunTippy>[0]['trigger']}
      visible={isOpen}
      appendTo={appendTo}
      arrow={tippyArrow}
      hideOnClick={false}
      onTrigger={handleTrigger}
      onClickOutside={handleClickOutside}
      content={content}
      inertia
    >
      {safeChildren}
    </LiqunTippy>
  )
}

LiqunPopConfirm.displayName = 'LiqunPopConfirm'

export default LiqunPopConfirm
