import { useEffect, useRef, useState, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { Dropdown, MenuProps } from 'antd'
import { useLatest } from 'ahooks'
import addPointCursor from '@/assets/imgs/add-point.svg'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'

type PropsType = unknown

const MenuBox: FC<PropsType> = () => {
  const { viewer } = useCesium()

  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const height = useAirlineConfigStore((s) => s.airlineConfig.height)
  const isDrawHome = useAirlineConfigStore((s) => s.isDrawHome)
  const isDrawPoint = useAirlineConfigStore((s) => s.isDrawPoint)
  const airPointSize = useAirlineConfigStore((s) => s.airpointsConfig.length)
  const deleteAirPoint = useAirlineConfigStore((s) => s.delteAirPoint)
  const addAirPoint = useAirlineConfigStore((s) => s.addAirPoint)
  const insertAirPoint = useAirlineConfigStore((s) => s.insertAirPoint)

  const heightRef = useLatest(height)
  const isDrawHomeRef = useLatest(isDrawHome)
  const isDrawPointRef = useLatest(isDrawPoint)

  const [open, setOpen] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)

  const geoRef = useRef<number[]>([])

  useEffect(() => {
    if (!viewer?.scene) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        // 获取屏幕坐标
        const position = e.position
        const { x, y } = viewer.scene.canvas.getBoundingClientRect()
        if (divRef.current !== null) {
          divRef.current.style.left = `${x + 5 + position.x}px`
          divRef.current.style.top = `${y + 5 + position.y}px`
        }

        if (isDrawHomeRef.current || isDrawPointRef.current) return

        const ray = viewer.camera.getPickRay(e.position)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        // 地形上的点
        const geo = cartesian3ToDegrees(cartesian)
        geoRef.current = geo

        setOpen(false)
        setTimeout(() => {
          setOpen(true)
          divRef.current?.click()
        })
      },
      Cesium.ScreenSpaceEventType.RIGHT_CLICK,
    )

    handler.setInputAction(() => {
      setOpen(false)
      if (divRef.current !== null) {
        divRef.current.style.left = `${-9999}px`
        divRef.current.style.top = `${-9999}px`
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    return () => {
      handler.destroy()
    }
  }, [])

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'addBefore',
        label: `在航点 ${currentIndex + 1} 前添加`,
        onClick: () => {
          insertAirPoint(
            {
              pointX: geoRef.current[0],
              pointY: geoRef.current[1],
              pointZ: heightRef.current ?? geoRef.current[2],
            },
            currentIndex,
          )
          setOpen(false)
        },
      },
      {
        key: 'addAfter',
        label: `在航点 ${currentIndex + 1} 后添加`,
        onClick: () => {
          insertAirPoint(
            {
              pointX: geoRef.current[0],
              pointY: geoRef.current[1],
              pointZ: heightRef.current ?? geoRef.current[2],
            },
            currentIndex + 1,
          )
          setOpen(false)
        },
      },
      {
        key: 'addLast',
        label: '在最后添加',
        onClick: () => {
          addAirPoint({
            pointX: geoRef.current[0],
            pointY: geoRef.current[1],
            pointZ: heightRef.current ?? geoRef.current[2],
          })
          setOpen(false)
        },
      },
      {
        key: 'delete',
        label: `删除航点 ${currentIndex + 1}`,
        onClick: () => {
          deleteAirPoint(currentIndex)
          setOpen(false)
        },
      },
    ],
    [],
  )

  const renderItems = useMemo(() => {
    if (airPointSize === 0) {
      return items.slice(2, 3)
    }
    return items
  }, [airPointSize])

  return (
    <>
      <Dropdown
        overlayStyle={{
          zIndex: 9999,
        }}
        open={open}
        trigger={['click']}
        menu={{
          items: renderItems,
        }}
      >
        <div
          className="fixed w-[1px] h-[1px] left-[-9999px] top-[-9999px]"
          style={{ display: open ? 'block' : 'none' }}
          ref={divRef}
        >
          <img
            src={addPointCursor}
            className="relative left-[-15px] top-[-15px]"
          />
        </div>
      </Dropdown>
    </>
  )
}

export default MenuBox
