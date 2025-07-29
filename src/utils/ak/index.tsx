import CryptoJS from 'crypto-js'

const createSign = (params) => {
  const newParams = { ...params, AccessKeyId: globalConfig.accessKeyId }
  const keys = Object.keys(newParams).sort()

  const paramsStr = keys
    .map((key) => {
      const value = newParams[key]
      const str = `${encodeURIComponent(key)}=${encodeURIComponent(
        typeof value === 'object' ? JSON.stringify(value) : value,
      )}`
        .replace(/\+/g, '%20')
        .replace(/\*/g, '%2A')
        .replace(/%27/g, "'")
        .replace(/%7e/g, '~')

      return str
    })
    .join('&')
  const words = CryptoJS.HmacSHA1(globalConfig.secretAccessKey!, paramsStr)
  const sign = CryptoJS.enc.Base64.stringify(words)
  return {
    AccessKeyId: globalConfig.accessKeyId,
    Signature: sign,
  }
}

export const createToken = (param) => {
  const d = Date.now()
  const params = {
    time: d,
    ...param,
  }
  const s = JSON.stringify(params)
  const encrypted = CryptoJS.AES.encrypt(s, globalConfig.accessKeyId!)
  return encrypted.toString()
}

export const verifyToken = (token) => {
  const encrypted = CryptoJS.AES.decrypt(token, globalConfig.accessKeyId!)

  return encrypted.toString(CryptoJS.enc.Utf8)
}

export default createSign
