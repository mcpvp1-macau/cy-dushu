import MapViewLockToggle from './components/MapViewLockToggle'

const RightTools: FC = memo(() => {
  return (
    <div className="absolute right-3 top-3">
      <div className="flex flex-col gap-3">
        <MapViewLockToggle />
      </div>
    </div>
  )
})

RightTools.displayName = 'RightTools'

export default RightTools
