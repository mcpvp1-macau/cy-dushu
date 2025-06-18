import PanoramaViewer from '@/components/ui/PanoramaViewer'

type PropsType = unknown

const Thing: FC<PropsType> = () => {
  return (
    <div className="w-[600px] h-[400px]">
      <PanoramaViewer src="/storage//ja-media-storage/cloud-sample/dd29f4c6-59fe-4795-812b-0bb9f19f8bdc/DJI_202506161642_051_dd29f4c6-59fe-4795-812b-0bb9f19f8bdc/DJI_20250616164811_0001_V.jpeg" />
    </div>
  )
}

export default Thing

// import { memo, type FC } from 'react'
// import WaylineAreaPathWorker from '@/worker/wayline_area_path.ts?worker'
// import { wrap } from 'comlink'
// import { useAsyncEffect } from 'ahooks'
// import { WorkerAPI } from '@/worker/wayline_area_path'
// import { toMercator, toWgs84 } from '@turf/turf'

// type PropsType = unknown

// const polygon = [
//   [119.939726, 30.239146],
//   [119.885557, 30.20439],
//   [119.955187, 30.178542],
//   [120.019364, 30.182858],
//   [120.038479, 30.236563],
//   [120.02632, 30.259214],
//   [119.980934, 30.259789],
//   [119.953229, 30.25193],
//   [119.931994, 30.251127],
// ]

// const Demo: FC<PropsType> = memo(() => {
//   const worker = wrap<WorkerAPI>(new WaylineAreaPathWorker())
//   useAsyncEffect(async () => {
//     const pg = toMercator({
//       type: 'Feature',
//       geometry: {
//         type: 'Polygon',
//         coordinates: [polygon],
//       },
//     }).geometry.coordinates
//     const start = performance.now()
//     const res = await worker.solve(pg[0] as any, 2, 200)
//     console.log('time', performance.now() - start)
//     console.log(
//       'res',
//       toWgs84({
//         type: 'Feature',
//         geometry: {
//           type: 'Polygon',
//           coordinates: [res],
//         },
//       }),
//     )

//     // const res = await o.add(1, 2)
//     // console.log('res', res)
//   }, [])
//   return <div></div>
// })

// Demo.displayName = 'Demo'

// export default Demo
