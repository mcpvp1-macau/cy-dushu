/** 设备状态过滤 */
export const deviceStatusFilter = (
  device: { status: string; taskStatus: string },
  isOnline: boolean,
  isTask: boolean,
  isNotTask: boolean,
) => {
  if (!device) {
    return false
  }
  return (
    (!isOnline || device.status === 'ONLINE') &&
    (isTask === isNotTask || (device.taskStatus === 'RUNNING') === isTask)
  )
}
