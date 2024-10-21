declare namespace API_PERSON {
  // ----------------- domain ----------------
  namespace domain {
    interface PersonTreeItem {
      groupId: string
      groupName: string
      groupParentId: any
      users: User[]
      children: PersonTreeItem[]
    }
    interface User {
      userId: string
      username: string
      name: string
      groupId: string
      idCard: any
      phone?: string
      createAt: string
      updateAt: string
      groupParentId: any
      bindDeviceList: any[]
      groupName: string
      remark?: string
      longitude: any
      latitude: any
    }
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {}
}
