import GroundPolygon from '../service/common/GroundPolygon'
import { circle } from '@turf/turf'

type PropsType = unknown

const banAreas = [
  {
    area_id: 10243,
    name: '杭州西湖西子国宾馆',
    type: 1,
    shape: 2,
    lat: 30.233528,
    lng: 120.152342,
    radius: 151,
    level: 2,
    begin_at: 0,
    end_at: 0,
    country: 'CN',
    city: 'Hangzhou Shi',
    polygon_points: null,
    color: '#DE4329',
    url: '',
    sub_areas: [
      {
        color: '#DE4329',
        height: 0,
        level: 2,
        lat: 30.233528,
        lng: 120.152342,
        radius: 151,
        polygon_points: null,
        shape: 0,
      },
    ],
    description: '',
    height: 0,
    address: '',
    data_source: 2,
  },
  {
    area_id: 9741,
    name: '机场禁飞区',
    type: 10,
    shape: 2,
    lat: 30.705043,
    lng: 120.680211,
    radius: 6000,
    level: 2,
    begin_at: 0,
    end_at: 0,
    country: 'CN',
    city: 'Jiaxing',
    polygon_points: null,
    color: '#DE4329',
    url: '',
    sub_areas: [
      {
        color: '#DE4329',
        height: 0,
        level: 2,
        lat: 30.738729741888992,
        lng: 120.71330191845882,
        radius: 13678,
        polygon_points: [
          [
            [120.758200365, 30.7485996731],
            [120.834924903, 30.8036312857],
            [120.771798678, 30.8510133658],
            [120.718589963, 30.7783566151],
            [120.681099931, 30.7840170537],
            [120.662234096, 30.7804389848],
            [120.630841729, 30.7615791569],
            [120.608435243, 30.7395124865],
            [120.591010481, 30.7104333583],
            [120.589380823, 30.6938943714],
            [120.600986833, 30.662532025],
            [120.758200365, 30.7485996731],
          ],
        ],
        shape: 1,
      },
      {
        color: '#DE4329',
        height: 0,
        level: 2,
        lat: 30.67237404239365,
        lng: 120.64591327228365,
        radius: 13677,
        polygon_points: [
          [
            [120.524448801, 30.6074996681],
            [120.587465475, 30.560123485],
            [120.640515834, 30.6328374559],
            [120.677896494, 30.6271730961],
            [120.696737334, 30.6307317964],
            [120.713868203, 30.6383629174],
            [120.750605033, 30.6716630204],
            [120.768060674, 30.7006799802],
            [120.76973384, 30.7172157638],
            [120.758200365, 30.7485996731],
            [120.600986833, 30.662532025],
            [120.524448801, 30.6074996681],
          ],
        ],
        shape: 1,
      },
      {
        color: '#979797',
        height: 120,
        level: 2,
        lat: 30.705445747407982,
        lng: 120.6797482060666,
        radius: 23830,
        polygon_points: [
          [
            [120.609531767, 30.4998298083],
            [120.452209109, 30.6181457402],
            [120.749631226, 30.9111790723],
            [120.907432461, 30.7928631411],
            [120.609531767, 30.4998298083],
          ],
        ],
        shape: 1,
      },
    ],
    description: '',
    height: 0,
    address: '',
    data_source: 2,
  },
  {
    area_id: 1413,
    name: 'Hangzhou Xiaoshan International Airport',
    type: 10,
    shape: 2,
    lat: 30.236246,
    lng: 120.433739,
    radius: 6000,
    level: 2,
    begin_at: 0,
    end_at: 0,
    country: 'CN',
    city: 'Hangzhou',
    polygon_points: null,
    color: '#DE4329',
    url: '',
    sub_areas: [
      {
        color: '#DE4329',
        height: 0,
        level: 2,
        lat: 30.243028953059166,
        lng: 120.42851038029852,
        radius: 18527,
        polygon_points: [
          [
            [120.617956916, 30.2744138419],
            [120.585240055, 30.3345752188],
            [120.58415483796445, 30.333924305990493],
            [120.57524827, 30.351240688],
            [120.491845179, 30.301249581],
            [120.465627368, 30.3137121237],
            [120.446669399, 30.3164807412],
            [120.427527521, 30.3149164935],
            [120.376205859, 30.2974731887],
            [120.348811914, 30.2778236005],
            [120.339558963, 30.2632757555],
            [120.335393177, 30.230560609],
            [120.242044152, 30.2005863088],
            [120.24922874970913, 30.187369492180633],
            [120.526292343, 30.2443667911],
            [120.617956916, 30.2744138419],
          ],
        ],
        shape: 1,
      },
      {
        color: '#DE4329',
        height: 0,
        level: 2,
        lat: 30.21171379739892,
        lng: 120.38860162779011,
        radius: 13717,
        polygon_points: [
          [
            [120.526292343, 30.2443667911],
            [120.24922874970913, 30.187369492180633],
            [120.248698915, 30.1872326905],
            [120.25515697254484, 30.176463908142317],
            [120.274746548, 30.1404268415],
            [120.27623365737367, 30.141318629524523],
            [120.284766216, 30.1270906258],
            [120.368149065, 30.1770844006],
            [120.394246432, 30.1632841273],
            [120.413027075, 30.1598446701],
            [120.432197295, 30.1607223448],
            [120.483794132, 30.1775270456],
            [120.512245521, 30.1972412276],
            [120.521685964, 30.2116958488],
            [120.526292343, 30.2443667911],
          ],
        ],
        shape: 1,
      },
      {
        color: '#979797',
        height: 120,
        level: 2,
        lat: 30.237461589747152,
        lng: 120.42983315004516,
        radius: 24390,
        polygon_points: [
          [
            [120.675019063314, 30.244998721793582],
            [120.682817406, 30.2304511016],
            [120.271561561, 30.0660394638],
            [120.184205765, 30.2292723103],
            [120.18529336955496, 30.229707266872293],
            [120.177503817, 30.2442578686],
            [120.588657427, 30.4086928374],
            [120.676186331, 30.2454653876],
            [120.675019063314, 30.244998721793582],
          ],
        ],
        shape: 1,
      },
    ],
    description: '',
    height: 0,
    address: '',
    data_source: 2,
  },
  {
    area_id: 40036100,
    name: '大禹陵景区干扰事故多发区',
    type: 43,
    shape: 2,
    lat: 29.96753089707028,
    lng: 120.60130965074238,
    radius: 976,
    level: 3,
    begin_at: 0,
    end_at: 0,
    country: 'CN',
    city: '',
    polygon_points: null,
    color: '#EE8815',
    url: '',
    sub_areas: [
      {
        color: '#EE8815',
        height: 0,
        level: 3,
        lat: 29.969224592147597,
        lng: 120.60205651777399,
        radius: 976,
        polygon_points: [
          [
            [120.6022229587463, 29.960439516188245],
            [120.61161436892269, 29.966285297478997],
            [120.60386800295703, 29.975045513575793],
            [120.59426546734943, 29.974850190180476],
            [120.5936641477324, 29.96812534880992],
            [120.6022229587463, 29.960439516188245],
          ],
        ],
        shape: 1,
      },
    ],
    description: '',
    height: 0,
    address: '',
    data_source: 2,
  },
  {
    area_id: 960001559,
    name: '无人机管控区域',
    type: 29,
    shape: 0,
    lat: 30.2690906,
    lng: 120.14835338,
    radius: 500,
    level: 2,
    begin_at: 1684166400,
    end_at: 1767196800,
    country: 'CN',
    city: '',
    polygon_points: null,
    color: '#DE4329',
    url: '',
    sub_areas: null,
    description: '',
    height: 0,
    address: '',
    data_source: 0,
  },
  {
    area_id: 960002720,
    name: '杭州市奥林匹克体育中心',
    type: 29,
    shape: 1,
    lat: 30.229977835676156,
    lng: 120.22649541069931,
    radius: 1133,
    level: 3,
    begin_at: 1720310400,
    end_at: 1751846400,
    country: 'CN',
    city: '',
    polygon_points: [
      [
        [120.2244860128574, 30.239772028122474],
        [120.21483255076939, 30.2284552595093],
        [120.22728506572378, 30.219809400435413],
        [120.23809663266962, 30.231819617262495],
        [120.2244860128574, 30.239772028122474],
      ],
    ],
    color: '#EE8815',
    url: '',
    sub_areas: null,
    description: '',
    height: 0,
    address: '',
    data_source: 0,
  },
]

const HangzhouBanAreas: FC<PropsType> = memo(() => {
  // useEffect(() => {
  //   if (!viewer) return

  //   const entities: Cesium.Entity[] = []

  //   banAreas.forEach((area) => {
  //     area.sub_areas?.forEach((subArea) => {
  //       if (!subArea.polygon_points) {
  //         return
  //       }
  //       const entity = viewer.entities.add({
  //         name: area.name,
  //         polygon: {
  //           hierarchy: Cesium.Cartesian3.fromDegreesArray(
  //             subArea.polygon_points.map((e) => e.flat()).flat(),
  //           ),
  //           material: Cesium.Color.fromCssColorString(subArea.color).withAlpha(
  //             0.2,
  //           ),
  //         },
  //         position: Cesium.Cartesian3.fromDegrees(subArea.lng, subArea.lat),
  //       })

  //       entities.push(entity)

  //       const outlineEntity = viewer.entities.add({
  //         name: area.name,
  //         polyline: {
  //           positions: Cesium.Cartesian3.fromDegreesArray(
  //             subArea.polygon_points.map((e) => e.flat()).flat(),
  //           ),
  //           width: 1,
  //           material: Cesium.Color.fromCssColorString(subArea.color),
  //           clampToGround: true,
  //         },
  //       })
  //       entities.push(outlineEntity)
  //     })
  //   })

  //   // Cleanup function to remove entities when component unmounts
  //   return () => {
  //     try {
  //       entities.forEach((entity) => {
  //         viewer.entities.remove(entity)
  //       })
  //     } catch (error) {}
  //   }
  // }, [viewer])
  return (
    <>
      {banAreas
        .filter((e) => e.shape === 1 && e.polygon_points && !e.sub_areas)
        .map((area) => (
          <GroundPolygon
            key={area.area_id}
            positions={area.polygon_points?.[0] || []}
            fillColor={`${area.color}33`}
            outlineColor={area.color}
            outlineWidth={1}
          />
        ))}
      {banAreas
        .filter((e) => e.shape === 2 && e.radius && !e.sub_areas)
        .map((e) => {
          const c = circle([e.lng, e.lat], e.radius, { units: 'meters' })
          return (
            <GroundPolygon
              key={e.area_id}
              positions={c.geometry.coordinates[0]}
              fillColor={`${e.color}33`}
              outlineColor={e.color}
              outlineWidth={1}
            />
          )
        })}
      {banAreas.map((e) =>
        e.sub_areas?.map((subArea, i) => {
          if (subArea.shape === 0 && subArea.radius) {
            const c = circle([subArea.lng, subArea.lat], subArea.radius, {
              units: 'meters',
            })
            return (
              <GroundPolygon
                key={`${subArea.area_id}-${i}`}
                positions={c.geometry.coordinates[0]}
                fillColor={`${subArea.color}33`}
                outlineColor={subArea.color}
                outlineWidth={1}
              />
            )
          }
          return (
            <GroundPolygon
              key={`${subArea.area_id}-${i}`}
              positions={subArea.polygon_points[0]}
              fillColor={`${subArea.color}33`}
              outlineColor={subArea.color}
              outlineWidth={1}
            />
          )
        }),
      )}
    </>
  )
})

HangzhouBanAreas.displayName = 'ShanghaiBanAreas'

export default HangzhouBanAreas
