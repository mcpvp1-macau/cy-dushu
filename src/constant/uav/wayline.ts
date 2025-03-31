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
}
