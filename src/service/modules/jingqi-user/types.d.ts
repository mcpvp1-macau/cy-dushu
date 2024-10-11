declare namespace API_JINGQI_USER {
  // ----------------- domain ----------------
  namespace domain {
    interface UserListItem {
      userId: string
      username: string
      name: string
      groupId: string
      idCard?: any
      phone?: any
      createAt?: any
      updateAt?: any
      groupParentId?: any
      bindDeviceList?: any[]
      groupName: string
      remark?: any
      longitude?: any
      latitude?: any
    }
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {}
}
