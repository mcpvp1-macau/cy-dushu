type WaylineDisplayNameSource = {
  taskName?: string | null
  gmtCreateByName?: string | null
  gmtCreateBy?: string | null
  username?: string | null
}

export const formatWaylineDisplayName = (
  wayline?: WaylineDisplayNameSource | null,
) => {
  const taskName = wayline?.taskName?.trim()
  if (!taskName) return ''

  const creator = [
    wayline?.gmtCreateByName,
    wayline?.gmtCreateBy,
    wayline?.username,
  ]
    .find((value) => value?.trim())
    ?.trim()

  return creator ? `${taskName}（${creator}）` : taskName
}
