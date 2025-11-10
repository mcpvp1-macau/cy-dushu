declare namespace API_LAYER_OVERLAY {
  // ----------------- domain ----------------
  namespace domain {
    interface Layer {
      layerId: number
      layerName: string
      createTime: number
      layerUuid: string
      layerType: string
    }
    interface Overlay {
      spaceId: string
      layerId: number
      overlayId: number
      overlayName: string
      overlayType: string
      overlayPositions: string
      overlayBindType: string
      overlayExtType: any
      overlayUuid: string
      overlayStyleConfig: string
      hide: number
      cotType: string
      gmtCreate: string
      gmtCreateBy: string
      name: string
      createUid: string
      defenseStatus: number
      gmtDefense: any
    }
    interface POIRecord {
      address: string
      boundingBox?: any
      category: string | null
      city: string
      country: string
      displayName: string | null
      lat: number
      lng: number
      name: string
      placeId: string
      state: string
      type: string | null
    }
    interface SpaceItem {
      id: number
      spaceId: string
      spaceName: string
      spaceType: 'XYZ' | '3D_TILES' | 'TMS' | 'POINT_CLOUD_2D' | 'POINT_CLOUD_3D' | 'MAPBOX_STYLE' | 'I3S'
      spaceConfig: string
      gmtCreate: string
      gmtModified: string
      gmtCreateBy: string
      gmtModifiedBy: string
      deleted: number
      zeroPositionX: number
      zeroPositionY: number
      originHeight: any
      originWidth: any
      objectId: any
      paramId: any
      spaceMapUrl: string
      spaceSpecialType: string
      mapType: 'LNG_LAT' | 'POINT_CLOUD'
      dimension: string
    }
  }
  // ------------------ req ------------------
  namespace req {
    type UpdateOverlayReq = {
      overlayId: number
      overlayName: string
      overlayPositions: string
      overlayBindActions: string
      overlayStyleConfig: string
    }
    type AddLayerReq = {
      layerName: string
    }
  }
  // ------------------ res ------------------
  namespace res {
    type GetLayerListRes = API_COMMON.PageRes<API_LAYER_OVERLAY.domain.Layer>
    type GetOverlayListRes =
      API_COMMON.PageRes<API_LAYER_OVERLAY.domain.Overlay>
    type GetPOIListRes = API_LAYER_OVERLAY.domain.POIRecord[]
    type GetSpaceListRes =
      API_COMMON.PageRes<API_LAYER_OVERLAY.domain.SpaceItem>
  }
}
