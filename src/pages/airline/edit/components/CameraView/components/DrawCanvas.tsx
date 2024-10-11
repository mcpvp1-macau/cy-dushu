type PropsType = unknown

const DrawCanvas: FC<PropsType> = memo(() => {
  return (
    <canvas
      className="absolute left-0 top-0 right-0 bottom-0"
      width={400}
      height={250}
    />
  )
})

DrawCanvas.displayName = 'DrawCanvas'

export default DrawCanvas
