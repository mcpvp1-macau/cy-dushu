declare namespace API_FLIGHT_AREA {
  namespace domain {
    type FlightAreaGroup = API_LAYER_OVERLAY.domain.Layer & {
      effectiveGroups: string
      effectiveDevices: string
    }

    type FlightArea = API_LAYER_OVERLAY.domain.Overlay & {
      overlayExtType?: string
      overlayHeight?: string
    }
  }

  namespace res {
    type getFlightAreaGroupList =
      API_COMMON.PageRes<API_FLIGHT_AREA.domain.FlightAreaGroup>

    type getFlightAreaList =
      API_COMMON.PageRes<API_FLIGHT_AREA.domain.FlightArea>
  }

  namespace req {
    type AddLayerReq = API_LAYER_OVERLAY.req.AddLayerReq & {
      effectiveGroups: string
      effectiveDevices: string
    }

    type UpdateLayerReq = API_LAYER_OVERLAY.req.AddLayerReq & {
      layerId: number
      effectiveGroups: string
      effectiveDevices: string
    }

    type UpdateOverlayReq = API_LAYER_OVERLAY.req.UpdateOverlayReq & {
      overlayExtType?: string
      overlayHeight?: string
    }
  }
}
