declare namespace API_DITING_MCP {
  namespace domain {
    interface FlyPlan {
      /**
       * 圆心。仅Circle类型需要
       */
      center?: null | Gps
      /**
       * Fly Points，实际飞行的点。获取飞行计划时返回
       */
      fly_points?: Gps[] | null
      /**
       * Id，飞行计划ID。获取飞行计划时返回
       */
      id?: null | string
      /**
       * 东北角。仅Rectangle类型需要
       */
      northeast?: null | Gps
      /**
       * Points，经纬度点集。仅Point类型需要
       */
      points?: Gps[] | null
      /**
       * Radius，半径，单位米。仅Circle类型需要
       */
      radius?: number | null
      /**
       * Shape，多边形顶点集。至少3个点。仅Polygon类型需要
       */
      shape?: Gps[] | null
      /**
       * 西南角。仅Rectangle类型需要
       */
      southwest?: null | Gps
      /**
       * 飞行计划类型
       */
      type: FlyPlanType
      [property: string]: any
    }

    export interface Gps {
      lat: number
      lng: number
    }

    /**
     * 飞行计划类型
     * FlyPlanType
     */
    export type FlyPlanType = 'Point' | 'Circle' | 'Rectangle' | 'Polygon'
    interface UavInfo {
      uav_sn: string
      uav_mcp_name: string
    }
  }
}
