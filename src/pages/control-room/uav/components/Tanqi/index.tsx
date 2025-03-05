import { Sender } from '@ant-design/x'

const Tanqi = memo(() => {
  return (
    <div className="size-full overflow-hidden p-2 flex flex-col">
      <div className="grow"></div>
      <Sender allowSpeech />
    </div>
  )
})

Tanqi.displayName = 'Tanqi'

export default Tanqi
