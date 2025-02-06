declare namespace API_DICT {
  // ----------------- domain ----------------
  namespace domain {
    interface DictRecord {
      dictGroup: string
      dictName: string
      dictKey: string
      isEnable: boolean
      orderWeight: number
    }
    interface ControlCenterDictRecord {
      code: string
      type: string
      msgZhCn?: string
      msgEnUs?: string
    }
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {
    type DictListRes = API_DICT.domain.DictRecord[]
    type ControlCenterDictList = API_DICT.domain.ControlCenterDictRecord[]
  }
}
