import LiqunAxios from './liqunAxios'

const serverHumanLoop = new LiqunAxios({
  baseURL: `/humanLoopServer`,
  timeout: 180_000,
})

export default serverHumanLoop
