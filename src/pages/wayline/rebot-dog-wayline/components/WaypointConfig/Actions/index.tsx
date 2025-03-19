type PropsType = {
  activeOperator: string
  setActiveOperator: (operator: string) => void
}

const Actions: FC<PropsType> = ({ activeOperator, setActiveOperator }) => {
  return <div>Actions</div>
}

Actions.displayName = 'Actions'

export default Actions
