import { createToken, createSignWithKeys } from '@/utils/ak'
import { getAccessKey } from '@/service/modules/user'
import { Typography, Spin } from 'antd'
import { QRCode } from 'qrcode-react-next'
import { useMemo } from 'react'

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
  // const { data: keysData, isLoading } = useQuery({
  //   queryKey: ['accessKey'],
  //   queryFn: async () => {
  //     const res = await getAccessKey()
  //     console.log('accessKey res', res)
  //     return res
  //   },
  // })

  const [keysData, setKeysData] = useState<{
    accessKeyId: string
    secretAccessKey: string
  } | null>(null)

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await getAccessKey()
        setKeysData(
          res as unknown as {
            accessKeyId: string
            secretAccessKey: string
          },
        )
      } catch (error) {
        console.log('accessKey res', error)
        // @ts-ignore
        if (error.accessKeyId) {
          setKeysData(
            error as unknown as {
              accessKeyId: string
              secretAccessKey: string
            },
          )
        }
      }
    }
    fetchKeys()
  }, [])

  const shareUrl = useMemo(() => {
    console.log('keysData', keysData)
    if (!keysData) return ''
    const { accessKeyId, secretAccessKey } = keysData

    // 预签名 liveAK 请求的参数
    const liveParams = {
      action: 'START',
      protocol: 'WS_FLV',
      ssl: globalConfig.globalWs === 'wss',
      type: 'AI_FRAME',
      proxy: globalConfig.videoProxy || false,
      videoId,
    }
    const liveSign = createSignWithKeys(
      liveParams,
      accessKeyId,
      secretAccessKey,
    )

    // 预签名 getDeviceStreamList 请求的参数
    const streamListParams = {
      streamId: `${productKey}/${deviceId}`,
      protocol: 'WS_FLV',
      ssl: globalConfig.globalWs === 'wss',
      proxy: globalConfig.videoProxy || false,
    }
    const streamListSign = createSignWithKeys(
      streamListParams,
      accessKeyId,
      secretAccessKey,
    )

    // 创建包含预签名参数的token (使用配置的accessKeyId加密，保持兼容性)
    const token = createToken({
      productKey,
      deviceId,
      videoId,
      liveSign,
      streamListSign,
    })

    return `${
      location.origin
    }/share/video/${productKey}/${deviceId}/${videoId}/${encodeURIComponent(
      token,
    )}`
  }, [keysData, productKey, deviceId, videoId])

  // console.log('shareUrl', isLoading, shareUrl, keysData)

  if (!shareUrl) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spin />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <span>分享</span>
        <Typography.Text
          copyable={{
            text: shareUrl,
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
        value={shareUrl}
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
