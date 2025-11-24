import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import OverflowText from '@/components/ui/OverflowText'
import { Link } from 'react-router-dom'

type PropsType = {
  data: API_ACTION.domain.ActionRecord
  actionType: string
}

/** 行动列表项 */
const ActionItem: FC<PropsType> = memo(({ data, actionType }) => {
  const { t, i18n } = useTranslation()

  const statusMap = useMemo(
    () => ({
      PENDING: [t('action.status.PENDING'), 'text-fore bg-[#d5d5d533]'],
      PROCESSING: [
        t('action.status.PROCESSING'),
        'text-[#15b371] bg-[#15b37133]',
      ],
    }),
    [i18n.language],
  )

  return (
    <Link
      to={`/action/${data.id}`}
      className={clsx(
        'p-3 bg-ground-1 rounded-[3px] transition-colors cursor-pointer',
        'border border-solid border-ground-3 hover:border-primary',
      )}
    >
      <div className="flex items-center">
        <h4 className="flex-1 flex items-center gap-1 text-sm overflow-hidden">
          <MenuIconAction />
          <OverflowText className="text-hightlight max-w-[200px] truncate">
            {data.name}
          </OverflowText>
        </h4>
        <div
          className={clsx(
            'px-2 rounded-sm text-xs leading-5 whitespace-nowrap',
            statusMap[data.status]?.[1],
          )}
        >
          {statusMap[data.status][0]}
        </div>
      </div>
      <div className="text-xs">
        <p className="mt-1">
          {t('action.item.time')}: {data.gmtCreate}
        </p>
        <p className="mt-1">
          {t('action.item.description')}: {data.description || '-'}
        </p>
        <p className="mt-1">
          {'类型'}: {actionType}
        </p>
      </div>
    </Link>
  )
})

ActionItem.displayName = 'ActionItem'

export default ActionItem
