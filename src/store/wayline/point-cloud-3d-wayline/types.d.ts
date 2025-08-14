export type PointCloud3dTemplateType = Partial<{
  waylineTemplateId: number
  taskName: string
  templateId: string
  smartTaskType: string
  defaultDeviceId: string
  pilotCode: string
  actionId: string
  deviceId: string
  spaceId: number
}>

export type PointCloud3DWaylineConfigType = {
  speed: number
  obstacleMode: number
}

export type PointCloud3DWaypointConfigType = {
  positionIndex: number
  positionName: string
  actions: any[]
  x: number
  y: number
  z: number
  q_x: number
  q_y: number
  q_z: number
  q_w: number
  xid: string
}
