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
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {
    type DictListRes = API_DICT.domain.DictRecord[]
  }
}
