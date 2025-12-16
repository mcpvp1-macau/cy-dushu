import dayjs from 'dayjs'
import { customAlphabet } from 'nanoid'

const nanoidWithDigits = customAlphabet('0123456789', 3)

export const generateDefaultActionName = (suffix: string) =>
  `${dayjs().format('YYYYMMDD')}${nanoidWithDigits()}${suffix}`
