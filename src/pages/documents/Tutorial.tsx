import { memo, type FC } from 'react'

type PropsType = unknown

const PageDucomentTutorial: FC<PropsType> = memo(() => {
  const filename = useParams().name

  console.log('filename', filename)

  return (
    <div className="flex-1">
      <iframe
        src={`/ja-map/tutorialRoot/${globalConfig.systemName}/tutorials/${filename}`}
        className="size-full"
        title="Tutorial"
      ></iframe>
    </div>
  )
})

PageDucomentTutorial.displayName = 'PageDucomentTutorial'

export default PageDucomentTutorial
