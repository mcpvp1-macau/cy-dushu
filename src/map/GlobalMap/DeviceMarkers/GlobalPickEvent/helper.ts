/** 解析设备 id */
export const parseDevice = (idStr: string) => {
  const [kind, type, name, id, lng, lat] = idStr.split('--')
  return {
    kind,
    type,
    name,
    id,
    lng: parseFloat(lng),
    lat: parseFloat(lat),
  }
}

/** 解析事件 id */
export const parseEvent = (idStr: string) => {
  const [kind, type, name, id, lng, lat] = idStr.split('--')
  return {
    kind,
    type,
    name,
    id,
    lng: parseFloat(lng),
    lat: parseFloat(lat),
  }
}

/** 解析设备聚合 id */
export const parseDeviceCluster = (idStr: string) => {
  const reg = /deviceCluster\((.+)\)/
  const match = idStr.match(reg)
  if (!match || match.length < 2) {
    return null
  }
  return (match[1] as string).split(';', 16).map((e) => {
    const [kind, type, name, id, lng, lat] = e.split('--')
    return {
      kind,
      type,
      name,
      id,
      lng: parseFloat(lng),
      lat: parseFloat(lat),
    }
  })
}
