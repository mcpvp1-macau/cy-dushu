const usePicutreSourceTypeOptions = () => {
  const { t, i18n } = useTranslation()
  const pictureSourceTypeOptions = useMemo(
    () => [
      {
        label: t('device.pictureFilter.all.title'),
        value: 'ALL',
      },
      {
        label: t('device.pictureFilter.screenshot.title'),
        value: 'SCREENSHOT',
      },
      {
        label: t('device.pictureFilter.photograph.title'),
        value: 'PHOTOGRAPH',
      },
    ],
    [i18n.language],
  )
  return pictureSourceTypeOptions
}

export default usePicutreSourceTypeOptions
