import useReconstructionMap from '@/store/map/useReconstructionMap.store'
import {
  getLayerGroupList,
  getLayerList,
} from '@/service/modules/reconstruction'
import { memo } from 'react'

const ReconstructionMap: FC = memo(() => {
  const updateLayerGroupList = useReconstructionMap(
    (state) => state.updateLayerGroupList,
  )
  const updateLayerList = useReconstructionMap((state) => state.updateLayerList)

  const queryClient = useQueryClient()
  // const { data: groupList } = useQuery(
  //   {
  //     queryKey: ['reconstruction-groupList'],
  //     queryFn: () => getLayerGroupList(),
  //     select: (d) => d.data.rows,
  //   },
  //   queryClient,
  // )

  // useEffect(() => {
  //   if (groupList) {
  //     updateLayerGroupList(groupList)
  //   }
  // }, [groupList])

  // useEffect(() => {
  //   if (groupList) {
  //     const layerIds = groupList.map((item) => item.layerId)
  //     const { data: layerList } = useQuery(
  //       {
  //         queryKey: ['reconstruction-layerList'],
  //         queryFn: () => getLayerList({ layerIds }),
  //         select: (d) => d.data.rows,
  //       },
  //       queryClient,
  //     )
  //     if (layerList) {
  //       updateLayerList(layerList)
  //     }
  //   }
  // }, [groupList])

  // 接口暂时未开发完毕，先使用静态测试数据
  useEffect(() => {
    const LayerGroupList: API_RECONSTRUCTION.LayerGroup[] = [
      {
        layerId: 519344,
        layerName: '默认图层', //分组名称
        createTime: 1678781830000,
        layerUuid: 'de544254-8ba2-45dc-b8c7-46939df0ba1b',
        layerType: 'DEFAULT',
      },
      {
        layerId: 519552,
        layerName: '测试图层',
        createTime: 1725084334000,
        layerUuid: '7a2bbd95-1067-4f12-bcc3-065e591ef6e5',
        layerType: 'NORMAL',
      },
    ]
    updateLayerGroupList(LayerGroupList)
  }, [])

  useEffect(() => {
    const layerList: API_RECONSTRUCTION.Layer[] = [
      {
        layerId: 519344,
        overlayId: 521372,
        overlayName: '三维重建测试1',
        overlayType: 'POSITION',
        overlayPositions: '[[120.39532,29.69677,82.3]]',
        overlayBindType: 'DEFAULT',
        overlayUuid: 'cd5d8107-27ce-47f8-8691-83d91608ef04',
        overlayStyleConfig:
          '{"contact":{"-callsign":"f"},"color":{"-argb":"-35072"},"stroke":{"-argb":"-1"},"usericon":{"-iconsetpath":"COT_MAPPING_SPOTMAP/b-m-p-s-m/-35072"},"precisionlocation":{"-altsrc":"DTED0"},"targetMunitions":{"-munitionVisibility":"false"},"remarks":""}',
        hide: 0,
        cotType: 'b-m-p-s-m',
        gmtCreate: '2024-08-31 14:11:25',
        gmtCreateBy: 'jiangsi',
        name: '蒋四',
        //算法（@阿帅）建模完后返回，用于展示3D建模
        createUid: 'jiangsi',
        useTime: 1131.6474759578705,
        imagesCount: 0,
        modelLayerLon: 119.95741934594605,
        modelLayerLat: 30.275498080649328,
        modelLayerHeight: 138.86000061035156,
        cameraHeading: 24.24420738220215,
        cameraPitchv: -52.599998474121094,
        cameraRoll: 0,
        modelPath: '/demo/output_dn3.splat',
      },
    ]
    updateLayerList(layerList)
  }, [])

  return <></>
})

ReconstructionMap.displayName = 'ReconstructionMap'

export default ReconstructionMap
