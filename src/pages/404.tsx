type PropsType = unknown

const Page404: FC<PropsType> = memo(() => {
  return (
    <div className="page-full p-3 bg-ground-180 flex flex-col overflow-y-hidden">
      <div className="text-center">
        <h2 className="text-[60px] mt-10">404</h2>
      </div>
    </div>
  )
})

Page404.displayName = 'Page404'

export default Page404
