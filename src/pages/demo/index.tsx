import { memo, type FC } from 'react'

type PropsType = unknown

const Demo: FC<PropsType> = memo(() => {
  return (
    <div className="w-20 h-20">
      <video>
        <source src="/stream/v3/vod.m3u8?deviceId=34020000006011149500&begin=1728369457096&end=1728371749029" />
      </video>
    </div>
  )
})

Demo.displayName = 'Demo'

export default Demo
