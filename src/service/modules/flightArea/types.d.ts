declare namespace API_FLIGHT_AREA {
  namespace domain {
    type FlightAreaGroup = API_LAYER_OVERLAY.domain.Layer & {
      effectiveGroups: string
    }

    type FlightArea = API_LAYER_OVERLAY.domain.Overlay
  }

  namespace res {
    type getFlightAreaGroupList =
      API_COMMON.PageRes<API_FLIGHT_AREA.domain.FlightAreaGroup>

    type getFlightAreaList =
      API_COMMON.PageRes<API_FLIGHT_AREA.domain.FlightArea>
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
