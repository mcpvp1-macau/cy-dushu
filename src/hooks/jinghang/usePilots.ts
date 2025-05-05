import { pick } from 'lodash'

export const usePilotTreeData = (data: any[]) => {
  const pilotMap = useRef<Map<string, any> | null>(null)
  const treeData = useMemo(() => {
    pilotMap.current = new Map()
    if (!data.length) return []
    const dfs = (data: any) => {
      data.label = data.name
      data.value = `orgCode-${data.orgCode}`
      data.selectable = false
      for (const child of data?.children ?? []) {
        dfs(child)
      }
      for (const pilot of data?.pilots ?? []) {
        data.children.push({
          value: pilot.userCode,
          label: pilot.name,
        })
        pilotMap.current!.set(pilot.userCode, pick(pilot, ['name', 'userCode']))
      }
      return data
    }
    return data.map(dfs)
  }, [data])

  return { treeData, pilotMap }
}
