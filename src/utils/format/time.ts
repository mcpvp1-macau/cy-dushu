export const formatTs = (ts: number) => {
  ts = Math.floor(ts / 1000)
  const s = ts % 60
  const m = Math.floor(ts / 60) % 60
  const h = Math.floor(ts / 3600)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`
}

export const formatSec = (sec: number) => {
  sec = Math.floor(sec)
  const s = sec % 60
  const m = Math.floor(sec / 60) % 60
  const h = Math.floor(sec / 3600)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`
}

export const formatSecMMSS = (sec: number | undefined) => {
  if (sec === undefined) {
    return '00:00'
  }
  sec = Math.floor(sec)
  if (sec < 3600) {
    const s = sec % 60
    const m = Math.floor(sec / 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  } else {
    const s = sec % 60
    const m = Math.floor(sec / 60) % 60
    const h = Math.floor(sec / 3600)
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
}
