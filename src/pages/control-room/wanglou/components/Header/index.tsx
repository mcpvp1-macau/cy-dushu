import IconBack from '@/assets/icons/jsx/IconBack'
import IconButton from '@/components/ui/button/IconButton'
import { useTitle } from 'ahooks'
import React from 'react'
import { createPortal } from 'react-dom'

const HeaderLeft: React.FC<{ deviceName: string }> = memo(({ deviceName }) => {
  const navigate = useNavigate()

  useTitle(`${deviceName ?? '-'} | ${globalConfig.title}`)

  return (
    <section className="flex items-center gap-3">
      <IconButton className="text-base" onClick={() => navigate(-1)}>
        <IconBack />
      </IconButton>
      <h3 className="whitespace-nowrap">{deviceName}</h3>
    </section>
  )
})

const Header: React.FC<{ deviceName: string }> = ({ deviceName }) => {
  const appHeader = document.getElementById('app-header-center')
  const h = (
    <header className="h-7 flex justify-between gap-3 px-3 items-center text-sm">
      {appHeader ? <HeaderLeft deviceName={deviceName} /> : <div />}
    </header>
  )

  if (appHeader) {
    return createPortal(h, appHeader)
  }

  return <div className="bg-ground-3 mx-2 rounded mt-2">{h}</div>
}

export default Header
