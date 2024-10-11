import { useAppMsg } from '@/hooks/useAppMsg';
import type { UploadProps } from 'antd';
import { Upload } from 'antd';

interface AliyunOSSUploadProps {
  value?: string;
  onChange?: (data: string) => void;
  children: JSX.Element;
  otherProps?: UploadProps;
}

const AliyunOSSUpload = ({
  value,
  onChange,
  children,
  otherProps,
}: AliyunOSSUploadProps) => {
  const msgApi = useAppMsg();
  const handleChange: UploadProps['onChange'] = (value) => {
    const { file } = value;
    if (file.response?.code === 'SUCCESS') {
      onChange?.(file.response?.data);
    } else if (file.response?.code === 'ERROR') {
      msgApi.error(file.response?.message || '文件上传失败');
    }
  };

  const onRemove = () => {
    if (onChange) {
      onChange('');
    }
  };

  const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
    return file;
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/file/upload',
    onChange: handleChange,
    onRemove,
    beforeUpload,
  };

  return (
    <Upload {...uploadProps} {...otherProps}>
      {children}
    </Upload>
  );
};

export default AliyunOSSUpload;
