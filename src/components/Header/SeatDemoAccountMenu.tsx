import { SEAT_DEMO_ACCOUNTS, useSeatDemoStore } from '@/demo/situation/seat-demo.store'
import { useTanqiDialogStore } from '@/components/Tanqi/demo/TanqiFloatDialog'
import useRightMode from '@/store/layout/useRightMode.store'
import { CheckOutlined, TeamOutlined } from '@ant-design/icons'

type PropsType = unknown

const SeatDemoAccountMenu: FC<PropsType> = memo(() => {
  const seat = useSeatDemoStore((state) => state.seat)
  const navigate = useNavigate()

  const handleSeatChange = (nextSeat: typeof seat) => {
    if (nextSeat === seat) return
    useSeatDemoStore.getState().setSeat(nextSeat)
    useTanqiDialogStore.getState().updateOpen(false)
    useRightMode.getState().updateRightOuterMode(null)
    const account = SEAT_DEMO_ACCOUNTS.find((item) => item.seat === nextSeat)!
    navigate(account.defaultPath)
  }

  return (
    <div className="w-[184px] border border-solid border-ground-5 rounded bg-ground-1 p-1 text-fore">
      <div className="px-2 py-1.5 text-xs opacity-60">演示账号</div>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {SEAT_DEMO_ACCOUNTS.map((account) => {
          const active = account.seat === seat
          return (
            <li key={account.seat}>
              <button
                type="button"
                className={clsx(
                  'w-full rounded px-2 py-2 text-left text-sm transition-colors',
                  'flex items-center gap-2 cursor-pointer',
                  active
                    ? 'bg-primary/20 text-primary'
                    : 'text-fore hover:bg-ground-3',
                )}
                onClick={() => handleSeatChange(account.seat)}
              >
                <TeamOutlined />
                <span className="flex-1">{account.label}</span>
                {active && <CheckOutlined className="text-xs" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
})

SeatDemoAccountMenu.displayName = 'SeatDemoAccountMenu'

export default SeatDemoAccountMenu
