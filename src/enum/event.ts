export const EventStatusMap: {
  [key: string]: {
    key: string
    // label: string
    icon: any
    types: any[]
    color: string
  }
} = {
  PROCESSING: {
    key: 'PROCESSING',
    // label: '处理中',
    icon: null,
    types: [],
    color: '#fff',
  },
  PENDING: {
    key: 'PENDING',
    // label: '未处理',
    icon: null,
    types: [],
    color: '#e45951',
  },
  IGNORE: {
    key: 'IGNORE',
    // label: '已忽略',
    icon: null,
    types: [],
    color: '#ffffff',
  },
  PROCESSED: {
    key: 'PROCESSED',
    // label: '已处理',
    icon: null,
    types: [],
    color: 'green',
  },
}
