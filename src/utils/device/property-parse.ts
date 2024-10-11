export const enumProperty = (
  properties: Record<string, any>,
  deviceModelProperties: any[],
  identifier: string,
) => {
  if (!(identifier in properties)) {
    return ''
  }
  const value = properties[identifier]
  const model = deviceModelProperties.find(
    ({ identifier: id }) => id === identifier,
  )
  if (!model) {
    return ''
  }
  if ('enum' === model.dataType.type) {
    return model.dataType.specs[value] ?? ''
  }
  return ''
}
