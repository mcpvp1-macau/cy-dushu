import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { Button, Select } from 'antd'
import { isNil } from 'lodash'

type PropsType = unknown

/** 投弹器 */
const Scorpion: FC<PropsType> = memo(() => {
  const [value, setValue] = useState<number>()
  const postService = usePostDeviceService()

  return (
    <div className="p-3 flex flex-col gap-3">
      <Select
        className="w-full"
        placeholder="请选择投弹方式"
        options={[
          {
            label: '前方',
            value: 1,
          },
          {
            label: '后方',
            value: 2,
          },
          {
            label: '左侧',
            value: 3,
          },
          {
            label: '右侧',
            value: 4,
          },
          {
            label: '全投',
            value: 5,
          },
          {
            label: '顺序单投',
            value: 6,
          },
        ]}
        value={value}
        onChange={setValue}
      />
      <Button
        disabled={isNil(value)}
        onClick={() => {
          postService('throwAt', {
            throwType: value,
          })
        }}
      >
        投弹
      </Button>
    </div>
  )
})

Scorpion.displayName = 'Scorpion'

export default Scorpion
