import { GetProps, TreeSelect } from 'antd'

type TreeNode = NonNullable<GetProps<typeof TreeSelect>['treeData']>[number]

type PilotInfo = {
  pilotName: string
  orgCode: string
  orgName: string
}

export const usePilotTreeData = (data: API_ACTION_ITEM.domain.PilotTree[]) => {
  const map = new Map<string, PilotInfo>()

  const treeData = useMemo(() => {
    if (!data.length) {
      return []
    }

    const dfs = (data: API_ACTION_ITEM.domain.PilotTree): TreeNode => {
      const node = {} as TreeNode
      node.title = data.name
      node.selectable = false
      node.value = data.orgCode

      node.children = data?.children?.map(dfs) || []
      node.children = node.children.concat(
        data?.pilots?.map((pilot) => {
          map.set(pilot.userCode!, {
            pilotName: pilot.name!,
            orgCode: data.orgCode,
            orgName: data.name,
          })
          return {
            value: pilot.userCode,
            title: pilot.name,
          }
        }) || [],
      )
      return node
    }

    return data.map(dfs)
  }, [data])

  return { treeData, pilotMap: map }
}
