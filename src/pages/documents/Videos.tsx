import { ScrollArea } from '@/components/ui/scroll-area'
import { VideosContext } from './Documents'
import { Col, Input, Row } from 'antd'
import AppEmpty from '@/components/AppEmpty'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import useUserStore from '@/store/useUser.store'
import { deleteSystemTutorial } from '@/service/modules/system-config'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'

type PropsType = {}

export const allowUsernames = [
  'admin',
  'youshu',
  'yuzhou',
  'sijing',
  'yiqiu',
  'xiaoxin',
  'jingqi',
  'shiyang',
  'xiaochuan',
  'shiqi',
  'dawu',
]

const VideoItem: FC<{ video: string; username: string; queryClient }> = ({
  video,
  username,
  queryClient,
}) => {
  return (
    <>
      <video
        src={`/ja-map/tutorialRoot/${globalConfig.systemName}/videos/${video}`}
        controls
        className="max-w-full max-h-[600px] mx-auto"
      />
      <div className="text-center mt-1">
        {video.split('.').at(-2)}{' '}
        {allowUsernames.includes(username ?? 'sb') && (
          <IconAsyncButton
            onClick={async () => {
              await deleteSystemTutorial(video, 'videos')
              await queryClient.invalidateQueries({
                queryKey: ['getTutorials'],
              })
            }}
          >
            <IconDelete />
          </IconAsyncButton>
        )}
      </div>
    </>
  )
}

const PageDocumentsVideos: FC<PropsType> = memo(() => {
  const videos = useContext(VideosContext)

  const [kw, setKw] = useState('')

  const filteredVideo = useMemo(() => {
    return videos.filter((video) =>
      video.toLowerCase().includes(kw.toLowerCase()),
    )
  }, [kw, videos])

  const username = useUserStore((s) => s.user?.username)

  const queryClient = useQueryClient()

  return (
    <div className="flex-1 flex flex-col">
      <div className="w-full flex justify-center m-3">
        <Input.Search
          placeholder="搜索视频"
          className="max-w-[400px]"
          size="large"
          onSearch={setKw}
        />
      </div>
      <ScrollArea>
        {filteredVideo.length > 0 ? (
          <Row gutter={[16, 16]} className="px-3">
            {filteredVideo.map((video, i) => (
              <Col key={i} xxl={6} xl={8} lg={12} md={24}>
                <VideoItem
                  video={video}
                  username={username || ''}
                  queryClient={queryClient}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <AppEmpty />
        )}
      </ScrollArea>
    </div>
  )
})

PageDocumentsVideos.displayName = 'PageDocumentsVideos'

export default PageDocumentsVideos
