import IconDelete from '@/assets/icons/jsx/IconDelete'
import AppSpin from '@/components/AppSpin'
import AppViewSuspense from '@/components/AppViewSuspense'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  deleteSystemTutorial,
  getSystemTutorials,
} from '@/service/modules/system-config'
import useUserStore from '@/store/useUser.store'
import { ReadOutlined, VideoCameraFilled } from '@ant-design/icons'
import { Button } from 'antd'
import { createContext } from 'react'
import { Outlet } from 'react-router'
import { Link } from 'react-router-dom'
import { allowUsernames } from './Videos'

type PropsType = unknown

export const VideosContext = createContext<string[]>([])

const PageDocuments: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['getTutorials'],
      queryFn: () => getSystemTutorials(),
      select: (d) => d.data,
    },
    queryClient,
  )

  const username = useUserStore((s) => s.user?.username ?? 'sb')

  return (
    <div className="page-full bg-ground-2 flex flex-col overflow-y-hidden">
      {isLoading || !data ? (
        <AppSpin />
      ) : (
        <div className="flex h-full overflow-hidden text-sm">
          <div className="flex flex-col">
            <ScrollArea className="flex-1 h-full flex flex-col">
              <ul className="w-[338px] flex-1 flex flex-col bg-ground-1">
                {data.tutorials.map((t) => (
                  <li key={t}>
                    <Link
                      to={`/documents/tutorial/${t}`}
                      className="flex gap-2 p-2 hover:bg-ground-3"
                    >
                      <ReadOutlined />
                      {t.split('.').at(-2)}
                      {allowUsernames.includes(username) && (
                        <IconAsyncButton
                          onClick={async (e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            await deleteSystemTutorial(t, 'tutorials')
                            await queryClient.invalidateQueries({
                              queryKey: ['getTutorials'],
                            })
                          }}
                        >
                          <IconDelete />
                        </IconAsyncButton>
                      )}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/documents/videos"
                    className="flex gap-2 p-3 hover:bg-ground-3"
                  >
                    <VideoCameraFilled />
                    教学视频
                  </Link>
                </li>
              </ul>
            </ScrollArea>
            {allowUsernames.includes(username) && (
              <div className="flex justify-center items-center p-3">
                <Link to="/documents/upload">
                  <Button>上传教程</Button>
                </Link>
              </div>
            )}
          </div>

          <VideosContext.Provider value={data.videos}>
            <AppViewSuspense>
              <Outlet />
            </AppViewSuspense>
          </VideosContext.Provider>
        </div>
      )}
    </div>
  )
})

PageDocuments.displayName = 'PageDocuments'

export default PageDocuments
