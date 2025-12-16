import dayjs from 'dayjs'
import { customAlphabet } from 'nanoid'

const nanoidWithDigits = customAlphabet('0123456789', 3)

export const generateDefaultActionName = () =>
  `${dayjs().format('YYYYMMDD')}${nanoidWithDigits()}行动`
