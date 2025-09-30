import { SyncOutlined } from '@ant-design/icons'
import { useDebounceFn } from 'ahooks'

const useSaveOrderState = (successAction?: Function) => {
  const [saveState, setSaveState] = useState(-1) // 0 未保存 1 保存中 2 保存成功

  const { run } = useDebounceFn(
    async (saveAction: Function) => {
      setSaveState(1)
      await saveAction()
      await successAction?.()
      setSaveState(2)
    },
    { wait: 3_000, trailing: true },
  )

  const stateLabel =
    saveState === 0 ? (
      <p className="text-orange-600 items-center flex gap-1">
        <SyncOutlined />
        等待暂存
      </p>
    ) : saveState === 1 ? (
      <p className="text-blue-600  items-center flex gap-1">
        <SyncOutlined spin /> 暂存中
      </p>
    ) : saveState === 2 ? (
      <p className="text-green-600">暂存成功</p>
    ) : null

  const save = (saveAction: Function) => {
    setSaveState(0)
    run(saveAction)
  }

  return { save, saveState, stateLabel }
}

export default useSaveOrderState
