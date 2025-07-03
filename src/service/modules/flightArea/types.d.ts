declare namespace API_FLIGHT_AREA {
  namespace domain {
    type FlightAreaGroup = API_LAYER_OVERLAY.domain.Layer & {
      effectiveGroups: string
    }
  }

  namespace req {
    type AddLayerReq = API_LAYER_OVERLAY.req.AddLayerReq & {
      effectiveGroups?: string
    }

    type UpdateLayerReq = API_LAYER_OVERLAY.req.AddLayerReq & {
      layerId: number
      effectiveGroups?: string
    }
  }
}
