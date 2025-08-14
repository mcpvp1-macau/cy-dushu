/** 航线类型 */
export enum WaylineEnum {
  /** 航点航线 */
  PointWayline = 'waypoint',
  /** 面状航线 */
  AreaWayline = 'area_waypoint',
  /** 蜂群航线 */
  SwarmWayline = 'cluster_wayline',
  /** 机器狗航线 */
  RebotDogWayline = 'fixed_point_cruise',
  /** 点云路线 */
  PointCloud3DWayline = 'point_cloud_3d',
}

/** 编辑路线路由 */
export const editRoutePathMap = new Map<WaylineEnum, string>([
  [WaylineEnum.PointWayline, 'edit'],
  [WaylineEnum.AreaWayline, 'area-wayline-edit'],
  [WaylineEnum.SwarmWayline, 'swarm-wayline-edit'],
  [WaylineEnum.RebotDogWayline, 'rebot-dog-wayline-edit'],
  [WaylineEnum.PointCloud3DWayline, 'point-cloud-3d-edit'],
])
