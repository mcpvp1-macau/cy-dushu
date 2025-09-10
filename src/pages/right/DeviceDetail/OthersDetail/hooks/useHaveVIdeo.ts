const useHaveVIdeo = (deviceDetail: API_DEVICE.domain.Device | null) => {
  if (!deviceDetail) {
    return false
  }
  const videoList = deviceDetail?.properties?.videoList || []
  if (videoList?.length > 0) {
    return true
  }
  if (
    deviceDetail?.childDevice?.some(
      (item) => (item?.properties?.videoList || [])?.length > 0,
    )
  ) {
    return true
  }
  return false
}

export default useHaveVIdeo
