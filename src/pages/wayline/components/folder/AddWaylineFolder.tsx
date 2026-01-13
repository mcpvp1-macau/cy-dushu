import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { createWaylineFolder } from '@/service/modules/airline'
import { Form, Input } from 'antd'
import { useMemoizedFn } from 'ahooks'
import type { FC } from 'react'

type AddWaylineFolderProps = {
  /** 父级文件夹 ID，null 表示根级文件夹 */
  parentFolderId: string | null
  /** 创建成功回调 */
  onSuccess?: () => void
}

/** 添加航线文件夹组件 */
const AddWaylineFolder: FC<AddWaylineFolderProps> = ({
  parentFolderId,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()
  const [form] = Form.useForm<{ folderName: string }>()

  // 模态框开关状态
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  /** 打开模态框 */
  const handleOpen = useMemoizedFn(() => {
    setOpen(true)
  })

  /** 关闭模态框并重置表单 */
  const handleClose = useMemoizedFn(() => {
    setOpen(false)
    form.resetFields()
  })

  /** 提交创建文件夹 */
  const handleConfirm = useMemoizedFn(async () => {
    try {
      const { folderName } = await form.validateFields()

      setConfirmLoading(true)

      // 调用 API 创建文件夹
      await createWaylineFolder({
        folderName,
        // 如果 parentFolderId 为 null 或 'default'，则不传 parentId（表示根级）
        parentId:
          parentFolderId && parentFolderId !== 'default'
            ? Number(parentFolderId)
            : undefined,
      })

      msgApi.success(t('wayline.folder.createSuccess'))
      handleClose()
      onSuccess?.()
    } catch (error) {
      // 验证失败或 API 错误会被自动处理
      console.error('创建文件夹失败:', error)
    } finally {
      setConfirmLoading(false)
    }
  })

  return (
    <>
      {/* 添加按钮 */}
      <IconButton
        onClick={handleOpen}
        tippyProps={{ content: t('wayline.folder.addFolder') }}
      >
        <IconPlus />
      </IconButton>

      {/* 创建文件夹模态框 */}
      <XModal
        title={t('wayline.folder.addFolder')}
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        confirmLoading={confirmLoading}
        width={400}
        centered
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="folderName"
            label={t('wayline.folder.folderName')}
            rules={[
              {
                required: true,
                message: t('wayline.folder.folderNameRequired'),
              },
              {
                max: 50,
                message: t('wayline.folder.folderNameMaxLength'),
              },
            ]}
          >
            <Input
              placeholder={t('wayline.folder.folderNamePlaceholder')}
              maxLength={50}
              showCount
            />
          </Form.Item>
        </Form>
      </XModal>
    </>
  )
}

export default AddWaylineFolder
