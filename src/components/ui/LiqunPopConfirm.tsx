import { Button } from 'antd'
import type { PopconfirmProps } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { useControllableValue } from 'ahooks'
import clsx from 'clsx'
import type { ReactElement } from 'react'
import { Children, cloneElement, isValidElement } from 'react'
import type { Placement } from 'tippy.js'
import LiqunTippy from './LiqunTippy'
import AsyncButton from './button/AsyncButton'

type LiqunPopConfirmProps = PopconfirmProps & { okCancel?: boolean }

const composeEventHandlers = <E,>(
  originHandler?: (event: E) => void,
  nextHandler?: (event: E) => void,
) => {
  return (event: E) => {
    originHandler?.(event)
    nextHandler?.(event)
  }
}

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

  const handleClickOutside = useMemoizedFn(
    (_instance: unknown, event: unknown) => {
      setIsOpen(false)
      if (_open !== undefined && !_onOpenChange) {
        onCancel?.(
          event as Parameters<NonNullable<PopconfirmProps['onCancel']>>[0],
        )
      }
    },
  )

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

  /**
   * Tippy 的 children 必须是单个可渲染元素，且我们需要给它注入事件处理函数；
   * 因此这里把各种 children 统一规整成“单个 ReactElement”（文本/多节点会包一层 span）。
   */
  const safeChildren = useMemo(() => {
    if (isValidElement(children)) {
      return Children.only(children) as ReactElement
    }
    return <span>{children}</span>
  }, [children])

  /**
   * `@tippyjs/react` 中 `trigger` 与受控的 `visible` 不能同时生效（会冲突）；
   * 这里我们始终用 `visible={isOpen}` 走受控展示，并把 trigger 行为（click/hover/focus/contextMenu）
   * 通过 cloneElement 注入到触发节点上，从而保留原本的交互语义。
   *
   * 注：为了不破坏使用方在 children 上已有的事件，这里会“串联”事件处理函数。
   */
  const triggerChild = useMemo(() => {
    const triggerList = Array.isArray(trigger) ? trigger : [trigger]
    const shouldOpenOnClick = triggerList.includes('click')
    const shouldOpenOnHover = triggerList.includes('hover')
    const shouldOpenOnFocus = triggerList.includes('focus')
    const shouldOpenOnContextMenu = triggerList.includes('contextMenu')

    const nextProps: Record<string, unknown> = {}
    const childProps = safeChildren.props as Record<string, unknown>

    if (shouldOpenOnClick) {
      nextProps.onClick = composeEventHandlers(
        childProps.onClick as ((e: unknown) => void) | undefined,
        () => handleTrigger(),
      )
    }

    if (shouldOpenOnHover) {
      nextProps.onMouseEnter = composeEventHandlers(
        childProps.onMouseEnter as ((e: unknown) => void) | undefined,
        () => {
          if (disabled) return
          setIsOpen(true)
        },
      )
      nextProps.onMouseLeave = composeEventHandlers(
        childProps.onMouseLeave as ((e: unknown) => void) | undefined,
        () => setIsOpen(false),
      )
    }

    if (shouldOpenOnFocus) {
      nextProps.onFocus = composeEventHandlers(
        childProps.onFocus as ((e: unknown) => void) | undefined,
        () => {
          if (disabled) return
          setIsOpen(true)
        },
      )
      nextProps.onBlur = composeEventHandlers(
        childProps.onBlur as ((e: unknown) => void) | undefined,
        () => setIsOpen(false),
      )
    }

    if (shouldOpenOnContextMenu) {
      nextProps.onContextMenu = composeEventHandlers(
        childProps.onContextMenu as ((e: unknown) => void) | undefined,
        (event) => {
          if (disabled) return
          ;(event as { preventDefault?: () => void })?.preventDefault?.()
          setIsOpen(true)
        },
      )
    }

    return cloneElement(safeChildren, nextProps)
  }, [disabled, handleTrigger, safeChildren, setIsOpen, trigger])

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
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            {icon ?? <ExclamationCircleFilled className="text-yellow-500" />}
            <div>
              {resolvedTitle ? (
                <div className="text-hightlight">{resolvedTitle}</div>
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
        <AsyncButton
          size="small"
          type={isDangerType ? 'primary' : okType}
          danger={okButtonProps?.danger || isDangerType}
          onClick={handleConfirm}
          {...okButtonProps}
          successMsg=""
        >
          {okText ?? t('modal.confirm')}
        </AsyncButton>
      </div>
    </div>
  )

  return (
    <LiqunTippy
      {...restProps}
      zIndex={zIndex}
      disabled={disabled}
      placement={tippyPlacement}
      visible={isOpen}
      appendTo={appendTo}
      arrow={tippyArrow}
      onClickOutside={handleClickOutside}
      content={content}
      // 允许内容超高时有更好的表现
      inertia
    >
      {/**
       * 外层需要一个稳定的原生 DOM 节点作为 Tippy reference。
       * 某些 React 组件（或 clone 后的元素）可能无法正确接收 ref，导致 Tippy 内部出现
       * `Cannot read properties of null (reading 'contains')`。
       */}
      <div className="inline-flex">{triggerChild}</div>
    </LiqunTippy>
  )
}

LiqunPopConfirm.displayName = 'LiqunPopConfirm'

export default LiqunPopConfirm
