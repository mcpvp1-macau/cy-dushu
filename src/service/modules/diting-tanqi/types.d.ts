declare namespace API_DITING_TANQI {
  // ----------------- domain ----------------
  namespace domain {
    interface PageMetadata {
      number: number
      size: number
      total_elements: number
      total_pages: number
    }
    interface ConversationItem {
      id: number
      create_time?: string
      group_name?: string
      name?: string
      system_prompt?: string
      update_time?: Date
    }
    interface ChatRecordItem {
      id: number
      /* 内容 */
      content?: string
      conversation_id?: number
      create_time?: Date
      /* 角色 */
      role?: string
    }
  }
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {
    interface PagedModelConversationResp {
      content: ConversationResp[]
      page: PageMetadata
    }
    type ChatRecordResp = domain.ChatRecordItem[]
  }
}
