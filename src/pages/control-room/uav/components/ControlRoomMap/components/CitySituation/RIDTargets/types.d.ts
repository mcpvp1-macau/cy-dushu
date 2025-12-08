interface BasicInfo {
  basic_uatype: number
  basic_idtype: number
  basic_uaid: string
}

interface SystemInfo {
  sys_area_floor: number
  sys_coordinate_type: number
  sys_lat: number
  operator_id: string
  sys_area_rad: number
  sys_area_ceil: number
  operator_type: number
  sys_area_count: number
  sys_lon: number
  sys_classification: number
  alit: number
  sys_category: number
  sys_location_type: number
  sys_class: number
  sys_timestamp: string
}

interface LocationInfo {
  location_vert_acc: number
  location_alit: number
  location_speed_multi: number
  location_speed_v: number
  location_height_type: number
  location_lon: number
  location_direc: number
  location_ew: number
  location_speed_acc: number
  location_hori_acc: number
  location_speed_h: number
  location_height: number
  location_lat: number
  location_status: number
}

export interface Data {
  devid: string
  recvtype: string
  rssi: number
  basic_info: BasicInfo
  recvmac: string
  system_info: SystemInfo
  operator_info: Record<string, unknown> // 可以根据实际情况定义 operator_info 的类型
  location_info: LocationInfo
  msgtype: number
  mac: string
}

export interface WsData {
  method: string
  bid: string
  version: string
  tid: string
  timestamp: number
  data: Data
}

export type UavInfo = {
  lng: number
  lat: number
  speedH: number
  speedV: number
  height: number
  alt: number
  orientation: number
  t: number
}

export type ControlStationInfo = {
  lng: number
  lat: number
  t: number
}
