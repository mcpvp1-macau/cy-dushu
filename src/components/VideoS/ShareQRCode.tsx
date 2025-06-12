import { createToken } from '@/utils/ak'
import { QRCode, Typography } from 'antd'

type PropsType = {
  productKey: string
  deviceId: string
  videoId: string
}

const ShareQRCode: React.FC<PropsType> = ({
  productKey,
  deviceId,
  videoId,
}) => {
  const [token] = useState(createToken({ productKey, deviceId, videoId }))
  return (
    <div>
      <div>
        <span>分享</span>
        <Typography.Text
          copyable={{
            text: `${
              location.origin
            }/share/video/${productKey}/${deviceId}/${videoId}/${encodeURIComponent(
              token,
            )}`,
          }}
        />
      </div>
      <QRCode
        icon={globalConfig.logo ?? '/logo.svg'}
        iconSize={20}
        value={`${
          location.origin
        }/share/video/${productKey}/${deviceId}/${videoId}/${encodeURIComponent(
          token,
        )}`}
        errorLevel="L"
      />
    </div>
  )
}

export default ShareQRCode
