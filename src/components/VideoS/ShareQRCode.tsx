import { createToken } from '@/utils/ak'
import { Typography } from 'antd'
import { QRCode } from 'qrcode-react-next'

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
      <div className="flex items-center gap-2">
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
        logoConfig={{
          src: globalConfig.logo ?? '/logo.svg',
          width: 20,
          height: 20,
          x: 170,
          y: 168,
        }}
        value={`${
          location.origin
        }/share/video/${productKey}/${deviceId}/${videoId}/${encodeURIComponent(
          token,
        )}`}
        styleConfig={{
          bgColor: '#000',
          color: '#fff',
          pointType: 'circle',
          pointSize: 'xs',
          margin: 10,
        }}
        config={{}}
        mode="svg"
      />
    </div>
  )
}

export default ShareQRCode
