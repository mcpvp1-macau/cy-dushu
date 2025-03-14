export const EventStatusMap: {
  [key: string]: {
    key: string
    // label: string
    icon: any
    types: any[]
    bgColor: string
    textColor?: string
  }
} = {
  PROCESSING: {
    key: 'PROCESSING',
    // label: '处理中',
    icon: null,
    types: [],
    bgColor: '#15B37144',
    textColor: '#15B371',
  },
  PENDING: {
    key: 'PENDING',
    // label: '未处理',
    icon: null,
    types: [],
    bgColor: '#37414D44',
    textColor: '#ffffff',
  },
  IGNORE: {
    key: 'IGNORE',
    // label: '已忽略',
    icon: null,
    types: [],
    bgColor: '#ffffff44',
    textColor: '#ffffff',
  },
  PROCESSED: {
    key: 'PROCESSED',
    // label: '已处理',
    icon: null,
    types: [],
    bgColor: '#15B37144',
    textColor: '#15B371',
  },
}
