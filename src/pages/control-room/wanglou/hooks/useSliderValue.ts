import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { useDebounceFn, useDeepCompareEffect, useMemoizedFn } from 'ahooks'
import dayjs from 'dayjs'
import { useMemo, useRef, useState } from 'react'

export const useSliderValue = (props: { data: API_DEVICE.domain.Device }) => {
  const { data } = props
  const { productKey, deviceId } = data || {}
  const state = useWangLouControlRoomStore((s) => s.state[deviceId])
  const uuid = useWangLouControlRoomStore((s) => s.uuid)
  const run = usePostDeviceService(productKey, deviceId)
  const [zoom, setZoomt] = useState(0)
  const [focalLength, setFocalLengtht] = useState(0)

  const { zoomRadioMax, zoomRadioMin, focalDistanceMax, focalDistanceMin } =
    useMemo(() => {
      const {
        zoomRadioMax = 0,
        zoomRadioMin = 0,
        focalDistanceMax = 0,
        focalDistanceMin = 0,
      } = data?.properties || {}
      return {
        zoomRadioMax,
        zoomRadioMin,
        focalDistanceMax,
        focalDistanceMin,
      }
    }, [data?.properties])

  const zoomTimeRef = useRef(0)
  const focalLengthTimeRef = useRef(0)

  const setZoom = useMemoizedFn((value: number) => {
    const now = dayjs().valueOf() - zoomTimeRef.current
    if (now > 5 * 1000) {
      setZoomt(value)
    }
  })

  const setFocalLength = useMemoizedFn((value: number) => {
    const now = dayjs().valueOf() - focalLengthTimeRef.current
    if (now > 5 * 1000) {
      setFocalLengtht(value)
    }
  })

  const onChangeZoom = useMemoizedFn((value: number) => {
    setZoomt(value + 0)
    zoomTimeRef.current = dayjs().valueOf()
  })

  const onChangeFocalLength = useMemoizedFn((value: number) => {
    setFocalLengtht(value + 0)
    focalLengthTimeRef.current = dayjs().valueOf()
  })

  const { run: runZoom } = useDebounceFn(
    (value: number) => {
      setZoomt(value)
      run('zoom', {
        zoomRadio: value,
        controlTag: uuid,
      })
    },
    {
      wait: 500,
    },
  )

  const onChangeCompleteZoom = useMemoizedFn((value: number) => {
    setZoomt(value)
    runZoom(value)
  })

  const { run: runFocus } = useDebounceFn(
    (value: number) => {
      run('focus', {
        focalLength: value + 0,
        controlTag: uuid,
      })
    },
    {
      wait: 500,
    },
  )

  const onChangeCompleteFocalLength = useMemoizedFn((value: number) => {
    setFocalLengtht(value)
    runFocus(value)
  })

  useDeepCompareEffect(() => {
    if (state) {
      setZoom(state.zoomRadio)
      setFocalLength(state.focalDistance)
    }
  }, [state])

  return {
    focalProps: {
      value: focalLength,
      min: focalDistanceMin,
      max: focalDistanceMax,
      marks: {
        [focalDistanceMin]: focalDistanceMin,
        [focalDistanceMax]: focalDistanceMax,
      },
      onChange: onChangeFocalLength,
      onChangeComplete: onChangeCompleteFocalLength,
    },
    zoomProps: {
      value: zoom,
      min: zoomRadioMin,
      max: zoomRadioMax,
      marks: {
        [zoomRadioMin]: zoomRadioMin,
        [zoomRadioMax]: zoomRadioMax,
      },
      onChange: onChangeZoom,
      onChangeComplete: onChangeCompleteZoom,
    },
  }
}
