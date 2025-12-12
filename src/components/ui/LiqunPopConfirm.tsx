import { Button } from 'antd'
import type { PopconfirmProps } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { useControllableValue } from 'ahooks'
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
    open: _open,
    defaultOpen: _defaultOpen,
    disabled,
    zIndex,
    arrow,
    getPopupContainer,
    onOpenChange: _onOpenChange,
    ...restProps
  } = props

  const { t } = useTranslation()
  const [isOpen = false, setIsOpen] = useControllableValue<boolean>(props, {
    valuePropName: 'open',
    defaultValuePropName: 'defaultOpen',
    trigger: 'onOpenChange',
  })

  const handleConfirm = useMemoizedFn(
    async (e: Parameters<NonNullable<PopconfirmProps['onConfirm']>>[0]) => {
      await onConfirm?.(e)
      setIsOpen(false)
    },
  )

  const handleCancel = useMemoizedFn(
    async (e: Parameters<NonNullable<PopconfirmProps['onCancel']>>[0]) => {
      onCancel?.(e)
      setIsOpen(false)
    },
  )

  const handleTrigger = useMemoizedFn(() => {
    if (disabled) return
    setIsOpen(!isOpen)
  })

  const handleClickOutside = useMemoizedFn(() => {
    setIsOpen(false)
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
        'min-w-[240px] max-w-[360px] space-y-2',
        'text-sm text-[rgb(var(--fore-color))] p-1',
        overlayClassName,
      )}
      style={overlayStyle}
    >
      {(resolvedTitle ?? resolvedDescription) && (
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            {icon ?? <ExclamationCircleFilled className="text-yellow-500" />}
            <div>
              {resolvedTitle ? (
                <div className="font-semibold leading-5 text-hightlight">
                  {resolvedTitle}
                </div>
              ) : null}
            </div>
          </div>

          {resolvedDescription ? (
            <div className="leading-5 text-fore">{resolvedDescription}</div>
          ) : null}
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
