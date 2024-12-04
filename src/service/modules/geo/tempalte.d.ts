declare namespace API_GEO_SERACH {
  // ----------------- domain ----------------
  namespace domain {
    interface AOI {
      id: number
      name: string
      coordinates: [number, number][]
    }
    interface Road {
      id: number
      name: string
      type: string
      class: string
      coordinates: [number, number][]
      description: string
    }
    interface POI {
      id: number
      name: string
      coordinates: [number, number]
      bigType: string
      midType: string
      smallType: string
      address: string
    }
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {
    type RoadDataRes = API_GEO_SERACH.domain.Road[]
    type AOIDataRes = API_GEO_SERACH.domain.AOI[]
    type POIDataRes = API_GEO_SERACH.domain.POI[]
  }
}
