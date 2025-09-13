import serverCityDBAPI from '@/service/servers/serverCityDBAPI'

// 无人机属性回溯
export const getCitySituationUavTrack = (data: {
  id: string[]
  startTime: string
  endTime: string
}) => {
  return serverCityDBAPI.post<API_DBAPI.res.getCitySituationUavTrack>(
    'api/citySituationUavTrack',
    data,
  )
}

// 无人机属性详情 [https://jingan.yuque.com/staff-ycgiyb/od1rat/gqun0orpa7cwpzqh#u1Vsq]
export const getCitySituationUavDetail = (data: {
  id: string
  startTime?: string
  endTime?: string
}) => {
  return serverCityDBAPI.post<API_DBAPI.res.GetCitySituationUavDetail>(
    'api/citySituationUavDetail',
    data,
  )
}

/** 查询所有目标检测数据 [https://jingan.yuque.com/staff-ycgiyb/od1rat/wns05dyqfl0aacqr#Ejwk1] */
export const getCitySituationAllTargets = (data: {
  time: string
  expireTime: number
  type: string[]
}) => {
  return serverCityDBAPI.post<API_DBAPI.res.GetAllTargets>(
    'api/getAllTargetData',
    data,
  )
}

// 查询实体轨迹 [https://jingan.yuque.com/staff-ycgiyb/od1rat/wns05dyqfl0aacqr#Ejwk1]
export const getEntityPosition = (data: {
  startTime: string
  endTime: string
  type: string
  id: string
}) => {
  return serverCityDBAPI.post('api/entityPosition', data)
}


// fetchTargetLayerGoalSub
export const fetchTargetLayerGoalSub = (data: {
  time: string
  expireTime: number
}) => {
  return serverCityDBAPI.post('api/fetchTargetLayerGoalSub', data)
}