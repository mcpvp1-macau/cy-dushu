export enum WarningAlertType {
  DistanceAlert = 'DistanceAlert', // 距离过近报警
  InNoFlyZoneAlert = 'InNoFlyZoneAlert', // 进入禁飞区报警
  RTHInNoFlyZoneAlert = 'RTHInNoFlyZoneAlert', // 返航经过禁飞区警报
  DeviationFromFlightPathAlert = 'DeviationFromFlightPathAlert', // 偏离航线报警
  LowBatteryAlert = 'LowBatteryAlert', // 低电量报警
}

export const audioMap = {
  [WarningAlertType.DistanceAlert]: '/audio/warning/0.mp3',
  [WarningAlertType.InNoFlyZoneAlert]: '/audio/warning/0.mp3',
  [WarningAlertType.RTHInNoFlyZoneAlert]: '/audio/warning/2.mp3',
  [WarningAlertType.DeviationFromFlightPathAlert]: '/audio/warning/2.mp3',
  [WarningAlertType.LowBatteryAlert]: '/audio/warning/2.mp3',
}
