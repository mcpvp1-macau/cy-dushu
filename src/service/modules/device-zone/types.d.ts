declare namespace API_DEVICE_OVERLAY {
  // ----------------- domain ----------------
  namespace domain {
    type Overlay = API_LAYER_OVERLAY.domain.Overlay & { deviceId: string }
  }
  // ------------------ req ------------------
  namespace req {
    type CreateOverlayRequest = API_DEVICE_OVERLAY.domain.Overlay
  }
  // ------------------ res ------------------
  namespace res {
    type ListOverlayConditionResponse = {
      rows: API_DEVICE_OVERLAY.domain.API_LAYER_OVERLAY.domain.Overlay[]
    }
  }
}
