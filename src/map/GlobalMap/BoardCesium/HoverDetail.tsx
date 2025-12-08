import React, { useRef } from 'react'
import {
  useEventListener,
  useLatest,
  useMemoizedFn,
  useMount,
  useUnmount,
} from 'ahooks'
import * as Cesium from 'cesium'
import BoardDetail from '../BoardDetail'
import { useCesium } from 'resium'

interface Props {
  item: any
  option?: {
    moveDomLeft?: number
    moveDomTop?: number
    autoPosition?: boolean
    horizontalPosition?: 'center' | 'left' | 'right'
    verticalPosition?: 'bottom' | 'top' | 'center'
  }
  onClose?: () => void
}

const BOARD_STYLE = {
  moveDomLeft: 50,
  moveDomTop: -100,
  autoPosition: true,
  horizontalPosition: 'center',
  verticalPosition: 'bottom',
}

const HoverDetail = ({ item, option, onClose }: Props) => {
  const { viewer } = useCesium()
  const {
    targetAltitude: alt,
    targetLatitude: lat,
    targetLongitude: lng,
    targetId,
    _parentId,
    _deviceId,
  } = item
  const elRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  const styleRef = useLatest({
    ...BOARD_STYLE,
    ...option,
    downLeft: 0,
    downTop: 0,

    oriLeft: 0,
    oriTop: 0,

    moveDomLeft: 50,
    moveDomTop: -100,
  })
  const domStyleRef = useRef<any>({
    style: {},
  })

  const getPos = useMemoizedFn(() => {
    if (!viewer) return

    // if()

    const scratch = new Cesium.Cartesian2()
    const el = elRef.current
    const posC = Cesium.Cartesian3.fromDegrees(Number(lng), Number(lat), alt)
    const canvasPosition = viewer.scene.cartesianToCanvasCoordinates(
      posC,
      scratch,
    )

    if (el?.style) {
      el.style.transform = `translate(${canvasPosition?.x}px,${canvasPosition?.y}px)`
      el.style.display = 'block'
      updateLineStyle()
    }
  })

  const getPointsDistance = (point: any, point2: any) => {
    const horizontalLength = Math.abs(point.x - point2.x)
    const verticalLength = Math.abs(point.y - point2.y)

    return Number(
      Math.sqrt(
        Math.pow(horizontalLength, 2) + Math.pow(verticalLength, 2),
      ).toFixed(2),
    )
  }

  const addEvent = (el: any, event: any, handler: any) => {
    if (!el) {
      return
    }
    if (el.attachEvent) {
      el.attachEvent(`on${event}`, handler)
    } else if (el.addEventListener) {
      el.addEventListener(event, handler)
    } else {
      el[`on${event}`] = handler
    }
  }

  const removeEvent = (el: any, event: any, handler: any) => {
    if (!el) {
      return
    }
    if (el.detachEvent) {
      el.detachEvent(`on${event}`, handler)
    } else if (el.removeEventListener) {
      el.removeEventListener(event, handler)
    } else {
      el[`on${event}`] = null
    }
  }

  const updateLineStyle = () => {
    if (!elRef.current || !dragRef.current || !lineRef.current) return

    dragRef.current.style.left = domStyleRef.current.style.moveDomLeft + 'px'
    dragRef.current.style.top = domStyleRef.current.style.moveDomTop + 'px'

    const dragRect = dragRef.current.getBoundingClientRect()
    const fixedRect = elRef.current.getBoundingClientRect()

    let verticalPosition: keyof DOMRectReadOnly | 'center'
    let horizontalPosition: keyof DOMRectReadOnly | 'center'
    if (option?.autoPosition) {
      const maxW = dragRect.width
      const maxH = dragRect.height

      const chaHorizontal = dragRect.left - fixedRect.left
      const chaVertical = dragRect.top - fixedRect.top

      if (chaHorizontal > 0) {
        horizontalPosition = 'left'
      } else if (chaHorizontal < -maxW) {
        horizontalPosition = 'right'
      } else {
        horizontalPosition = 'center'
      }

      if (chaVertical > 0) {
        verticalPosition = 'top'
      } else if (chaVertical < -maxH) {
        verticalPosition = 'bottom'
      } else {
        verticalPosition = 'center'
      }
    } else {
      verticalPosition = option?.verticalPosition || 'bottom'
      horizontalPosition = option?.horizontalPosition || 'left'
    }

    const top1 = fixedRect.y + fixedRect.height / 2
    const left1 = fixedRect.x + fixedRect.width / 2
    // const top2 = dragRect['bottom'] - 6;
    const top2 =
      verticalPosition === 'center'
        ? (dragRect['top'] + dragRect['bottom']) / 2
        : dragRect[verticalPosition]
    // const left2 = (dragRect['left'] + dragRect['right']) / 2;
    const left2 =
      horizontalPosition === 'center'
        ? (dragRect['left'] + dragRect['right']) / 2
        : dragRect[horizontalPosition]

    const distance = getPointsDistance(
      { x: top1, y: left1 },
      { x: top2, y: left2 },
    )

    const topValue = (left2 - left1) / 2 - 1
    const letValue = (top2 - top1) / 2 - distance / 2
    const angle = -Math.atan2(left1 - left2, top1 - top2) * (180 / Math.PI)

    Object.assign(lineRef.current.style, {
      height: `${distance}px`,
      transform: `translateX(${topValue}px) translateY(${letValue}px) scale(1) rotate(${angle}deg)`,
    })
  }

  const handleMove = (el: any) => {
    el.preventDefault()
    el.stopPropagation()

    domStyleRef.current.style.moveDomLeft =
      el.clientX - domStyleRef.current.disX
    domStyleRef.current.style.moveDomTop = el.clientY - domStyleRef.current.disY

    updateLineStyle()
  }

  const handleUp = (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    removeEvent(document.documentElement, 'mousemove', handleMove)
    removeEvent(document.documentElement, 'mouseup', handleUp)
    removeEvent(elRef.current, 'mousemove', handleMove)
  }

  const getHyperbolicSine = useMemoizedFn((a, b) => {
    return Number((Math.sqrt(a * a + b * b) || 0).toFixed(0)) || undefined
  })

  useEventListener(
    'mousedown',
    (event) => {
      if (!dragRef.current || !elRef.current) return

      event.preventDefault()
      event.stopPropagation()

      const disX = event.clientX - dragRef.current?.offsetLeft
      const disY = event.clientY - dragRef.current?.offsetTop

      domStyleRef.current.disX = disX
      domStyleRef.current.disY = disY

      addEvent(document.documentElement, 'mousemove', handleMove)
      addEvent(document.documentElement, 'mouseup', handleUp)
      addEvent(elRef.current, 'mousemove', handleMove)
    },
    {
      target: dragRef,
    },
  )

  useMount(() => {
    viewer && viewer.scene.preRender.addEventListener(getPos)
  })

  useUnmount(() => {
    try {
      viewer && viewer.scene.preRender.removeEventListener(getPos)
    } catch (e) {}
  })

  if (!item) return null

  return (
    <div className="absolute left-0 top-0 none" ref={elRef}>
      <div className="absolute w-0 z-50 border-l-2" ref={lineRef}></div>
      <div
        className="absolute"
        ref={dragRef}
        style={{
          left: styleRef.current.moveDomLeft,
          top: styleRef.current.moveDomTop,
          // backgroundColor: 'red',
        }}
      >
        <BoardDetail
          data={{
            targetId,
            ...item,
            distance:
              item.distance ||
              getHyperbolicSine(item.xDistance, item.yDistance),
            altitude: item.targetAltitude,
            longitude: item.targetLongitude,
            latitude: item.targetLatitude,
            imageUrl: item.imagePath || item.imageUrl,
            objectLabel: item.targetType,
          }}
          onClose={onClose}
        />
      </div>
    </div>
  )
}

export default React.memo(HoverDetail)
