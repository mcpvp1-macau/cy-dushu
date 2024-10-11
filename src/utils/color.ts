import Color from 'color'

export const getColorWithAlpha = (color: string, alpha: number) =>
  Color(color).alpha(alpha).toString()

// 111212 => [#fff, 0.3]
export function argbToHex(argb: string): [hex: string, alpha: number] {
  // if (!argb || argb === 'undefined') return ['#ffffff', 1];

  if (argb === '0' || !argb || argb === 'undefined') return ['#ffffff', 0]
  const str = (parseInt(argb) >>> 0).toString(16)

  const alpha = parseInt(str.slice(0, 2), 16) / 255
  const hex = `#${str.slice(2)}`

  return [hex, alpha]
}

// #ffffff => 11112312
export function hexToARGB(hexColor: string) {
  // if (hexColor === '0') return 0;

  if (!hexColor || hexColor === 'undefined') return 2147483647
  // 去掉"#"字符
  let newHexColor = hexColor.replace('#', '')

  // 如果是6位颜色值，则在前面添加"FF"表示完全不透明的alpha值
  if (newHexColor.length === 6) {
    newHexColor = `FF${newHexColor}`
  }

  // 将8位16进制颜色值转换为32位整数值
  let argbValue = parseInt(newHexColor, 16)

  // 整数的范围是从-2147483648到2147483647，如果一个数字大于2147483647，则它被视为负数
  if (argbValue > 2147483647) {
    argbValue = -(4294967296 - argbValue)
  }

  // 返回ARGB数字颜色
  return argbValue
}
