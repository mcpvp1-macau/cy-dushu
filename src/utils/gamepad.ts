/** 校验是否存在摇杆 */
export const checkGamepad = () => {
  navigator.getGamepads()
  const gamepads = navigator.getGamepads()
  for (const gamepad of gamepads) {
    if (gamepad) {
      return true
    }
  }
  return false
}

/** 校验油门是否处于中位 */
export const checkUavIsZero = () => {
  const gamepads = navigator.getGamepads()
  for (const gamepad of gamepads) {
    if (!gamepad) {
      continue
    }
    const match = gamepad.id.match(/\(([^)]+)\)/)
    if (!match) {
      continue
    }
    const padId = match[1]
    if (padId === 'Vendor: 0738 Product: a221') {
      const z = gamepad.axes[0] - 0.35
      if (Math.abs(z) < 0.1) {
        return true
      }
      return false
    }
  }
  return true
}
