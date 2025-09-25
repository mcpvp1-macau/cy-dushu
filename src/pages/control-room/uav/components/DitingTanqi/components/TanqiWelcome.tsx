import useUserStore from '@/store/useUser.store'

type PropsType = unknown

const TanqiWelCome: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const name = useUserStore((s) => s.user?.name)

  return (
    <div className="text-sm text-fore opacity-80 size-full flex flex-col items-center justify-center gap-1">
      <p className="text-center">{`${t('common.hello')}, ${name}`}</p>
      <p className="text-center">{`${t('tanqi.welcome.msg')}`}</p>
    </div>
  )
})

TanqiWelCome.displayName = 'TanqiWelCome'

export default TanqiWelCome
