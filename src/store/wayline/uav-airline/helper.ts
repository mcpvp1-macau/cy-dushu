import { AirlineConfigType, AirpointsConfigItem } from './types'
import { v4 as uuidv4 } from 'uuid'

/** 航线默认配置 */
export const createInitAirlineConfig = () =>
  ({
    flyToWaylineMode: 'safely',
    imageFormat: [],
    takeOffSecurityHeight: 100,
    height: 100, // 爬升高度
    speed: 10, // 全局航线速度
    globalRTHHeight: 0, // 返航高度
    globalTransitionalSpeed: 6,
    takeOffRefPoint: null, // 起飞点
    globalWaypointTurnMode: 'toPointAndStopWithDiscontinuityCurvature',
    waypointHeadingMode: 'followWayline', // 跟随航线
    gimbalPitchMode: 'manual',
    finishAction: 'NO_ACTION',
    actionTriggerType: 'multipleDistance',
    actionTriggerParam: null,
    // ... 其他默认字段
  } as AirlineConfigType)

/** 航点默认配置 */
export const createInitAirpointConfig = (i: number) =>
  ({
    xid: uuidv4(),
    positionIndex: i,
    positionName: `${i + 1}号点`,
    actions: [],
    eoHeading: 0,
    eoPitch: 0,
    eoRoll: 0,
    pointX: 0,
    pointY: 0,
    pointZ: 0,
    uavHeading: 0,
    // ... 其他默认字段
  } as AirpointsConfigItem)
