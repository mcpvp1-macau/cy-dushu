import React from 'react'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import { Input } from 'antd'
import XModal from '@/components/XModal'
import { updateDevice } from '@/service/modules/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import IconButton from '@/components/ui/button/IconButton'
type PropsType = {
  cell: any
  onRefresh: () => void
}
const TTPBOXSnEditor: React.FC<PropsType> = ({ cell, onRefresh }) => {
  const msgApi = useAppMsg()
  const [value, setValue] = useState(cell?.getValue() || '')
  const [open, setOpen] = useState(false)
  const handleSave = async () => {
    const res = await updateDevice({
      deviceId: cell?.row.original.deviceId,
      productKey: cell?.row.original.productKey,
      ttpBoxSn: value,
    })
    if (res.code === 'SUCCESS') {
      msgApi.success('保存成功')
      onRefresh()
      setOpen(false)
    } else {
      msgApi.error('保存失败')
    }
  }

  useEffect(() => {
    setValue(cell?.getValue() || '')
  }, [cell?.getValue()])

  return (
    <div className="flex items-center gap-2 justify-between">
      {cell?.getValue() || '-'}
      <IconButton
        onClick={() => setOpen(true)}
        toolTipProps={{ title: '编辑盒子序列号' }}
      >
        <IconEdit className="cursor-pointer text-text-primary" />
      </IconButton>

      <XModal
        title={'编辑盒子序列号'}
        open={open}
        width={330}
        onClose={() => {
          setOpen(false)
          setValue(cell?.getValue() || '')
        }}
        onConfirm={handleSave}
      >
        <div className="p-2">
          <Input
            placeholder={'盒子序列号'}
            value={value}
            className="w-72"
            onChange={(e) => {
              setValue(e.target.value)
            }}
          />
        </div>
      </XModal>
    </div>
  )
}

export default TTPBOXSnEditor
