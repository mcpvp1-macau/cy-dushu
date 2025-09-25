import { useDeepCompareEffect, useMount } from 'ahooks'
import { Ellipse, Leafer, Text } from 'leafer-ui'
import React, { useMemo, useRef, useState } from 'react'
import './index.less'

interface RMark {
  label: string
  value: number
}

interface Props {
  id: string
  width: number
  height: number
  backgroundColor?: string
  // marks?: RMark[]
  children?: any
  max: number
}

const RadarChart: React.FC<Props> = (props) => {
  const {
    id,
    width,
    height,
    backgroundColor,
    // marks = [
    //   {
    //     label: '200m',
    //     value: 0.2,
    //   },
    //   {
    //     label: '400m',
    //     value: 0.4,
    //   },
    //   {
    //     label: '600m',
    //     value: 0.6,
    //   },
    //   {
    //     label: '800m',
    //     value: 0.8,
    //   },
    //   {
    //     label: '1000m',
    //     value: 1,
    //   },
    // ],
    max = 1000,
  } = props

  const marks = useMemo(() => {
    return [
      {
        label: `${max * 0.2}m`,
        value: 0.2,
      },
      {
        label: `${max * 0.4}m`,
        value: 0.4,
      },
      {
        label: `${max * 0.6}m`,
        value: 0.6,
      },
      {
        label: `${max * 0.8}m`,
        value: 0.8,
      },
      {
        label: `${max * 1}m`,
        value: 1,
      },
    ]
  }, [max])
  const leaferRef = useRef<Leafer | null>(null)
  const [leafer, setLeafer] = useState<Leafer | null>(null)

  const left = 10
  const top = 10
  const right = 10
  const bottom = 10

  const R = useMemo(() => {
    const xWidth = width - left - right
    const yWidth = height - top - bottom
    const R = xWidth > yWidth ? yWidth / 2 : xWidth / 2
    return R
  }, [width, height])

  useMount(() => {
    leaferRef.current = new Leafer({
      view: id,
      wheel: { zoomMode: false },
      move: { disabled: true },
      zoom: { disabled: true },
    })
    setLeafer(leaferRef.current)
    return () => {
      //
    }
  })

  useDeepCompareEffect(() => {
    // const xWidth = width - left - right;
    // const yWidth = height - top - bottom;
    // const R = xWidth > yWidth ? yWidth / 2 : xWidth / 2;
    // 中心点
    // const centerX = left + R;
    // const centerY = top + R;

    const markEntitys = [] as (Ellipse | Text)[]

    marks.forEach((item) => {
      const ellipse = new Ellipse({
        x: left + R * (1 - item.value),
        y: top + R * (1 - item.value),
        width: 2 * R * item.value,
        height: 2 * R * item.value,
        innerRadius: 1,
        stroke: 'rgba(50,205,121, 0.3)',
        strokeWidth: 1,
        strokeAlign: 'center',
        strokeCap: 'round',
      })

      leaferRef.current?.add(ellipse)
      markEntitys.push(ellipse)

      const text = new Text({
        fill: '#C7D1DC',
        text: item.label,
        x: left + R - 10,
        y: top + R * (1 - item.value) - 4,
        scale: 0.7,
      })
      leaferRef.current?.add(text)
      markEntitys.push(text)
    })

    return () => {
      markEntitys.forEach((item) => leaferRef.current?.remove(item))
    }
  }, [width, height, marks])

  return (
    <div className="liqun-radar-chart" style={{ backgroundColor }}>
      <div id={id} className="liqun-chart" style={{ width, height }}>
        {props.children &&
          leafer &&
          React.Children?.map(props.children, (child) => {
            if (typeof child === 'object') {
              return React.cloneElement(child, {
                leafer,
                R,
                max,
                left,
                top,
                right,
                bottom,
              })
            }
            return child
          })}
      </div>
    </div>
  )
}

export default React.memo(RadarChart)
