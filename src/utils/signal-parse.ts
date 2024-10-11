import { cellToLatLng } from 'h3-js';

/** 电磁信号解析 */
const signalStrParse = (str: string) => {
  const a = str.split(',');
  return {
    h3Code: a[0],
    quality: Number(a[1]),
    sinr: Number(a[2]),
    altitude_level: Number(a[3]),
    altitude: Number(a[4]),
    ts: Number(a[5]),
    deviceId: a[6],
  };
};

export const signalStrParseWithLngLat = (str: string) => {
  const res = signalStrParse(str);
  const [lat, lng] = cellToLatLng(res.h3Code);
  return { ...res, lat, lng };
};

export default signalStrParse;
