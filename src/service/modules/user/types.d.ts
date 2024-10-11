declare namespace API_USER {
  // ----------------- domain ----------------
  namespace domain {
    interface GroupTreeItem {
      groupId: string
      groupName: string
      groupOrder?: number
      groupParentId: string
      children: GroupTreeItem[]
    }
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {
    interface GetGroupTreeRes {
      rows: API_LAYER_OVERLAY.domain.GroupTreeItem[]
    }
  }
}
