import serverJingqi from '@/service/servers/serverJingqi'

/** 获取事件列表 */
export const getEventList = (data: API_EVENTS.req.GetEventListReq) => {
  return serverJingqi.post<API_EVENTS.res.GetEventListRes>(
    '/event/list/v2',
    data,
  )
}

/** 获取事件类型列表 */
export const getEventTypeList = () => {
  return serverJingqi.get<API_EVENTS.res.GetEventTypeListRes>(
    '/event/type/list',
  )
}

/** 获取事件详情 */
export const getEventDetail = (eventId: string) => {
  return serverJingqi.get<API_EVENTS.domain.Event>('/event/detail', {
    params: { eventId },
  })
}

/** 获取当前事件前后 5 条数据 */
export const getSurroundingEvents = (eventId: string) => {
  return serverJingqi.post('/event/list/v2/surrounding', { eventId })
}

/** 忽略事件 */
export const ignoreEvent = (eventId: string) => {
  return serverJingqi.get('/event/ignore', { params: { eventId } })
}

/** 忽略全部事件 */
export const ignoreAllEvent = (data: API_EVENTS.req.GetEventListReq) => {
  return serverJingqi.post('/event/ignoreAll', data)
}

/** 获取事件类型和来源列表 */
export const getEventTypeAndSourceList = () => {
  return serverJingqi.get<API_EVENTS.res.GetEventTypeAndSourceListRes>(
    '/event/getEventTypeAndSourceList',
  )
}

/** 获取事件是否授权 */
export const getEventHasAuth = (eventId: string) => {
  return serverJingqi.get('/event/hasAuth', { params: { eventId } })
}
