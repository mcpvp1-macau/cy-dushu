import * as Cesium from 'cesium'

/**
 * 自定义顺序进行primitives的渲染，目前需要无地球且透明的cesium，且仅支持可添加进primitives的图元或其他。
 * 对于点、标牌、标注等本来就不会被遮挡的则可以放置于一个PrimitiveCollection中添加绘制
 *
 * @example
 * const ocrc = new OrderCesiumRenderController(viewer)
 * ocrc.orderPrimitives.push(primitive)
 * ocrc.orderPrimitives.push(tileset)
 * ocrc.orderPrimitives.push(model)
 */
class OrderCesiumRenderController {
  private _viewer: Cesium.Viewer
  // 原始的图元显示状态，用于在渲染时和渲染后恢复
  private _rawPrimitiveShowing: boolean[] = []
  /**排序后的图元列表，将按照顺序覆盖渲染，每一个元素代表一个层级 */
  private _orderPrimitives: any[]
  private _frameBuffers: any[] = []

  constructor(viewer: Cesium.Viewer) {
    this._viewer = viewer
    this._viewer.scene.primitives.destroyPrimitives = false
    this._orderPrimitives = new Proxy<
      (Cesium.Primitive | Cesium.PrimitiveCollection)[]
    >([], {
      get: (target, p: any, receiver) => {
        return Reflect.get(target, p, receiver)
      },
      set: (target, p: any, newValue, receiver) => {
        const preLength = target.length
        const result = Reflect.set(target, p, newValue, receiver)
        const newLength = target.length
        if (preLength !== newLength) {
          this.clearFrameBuffer()
          for (let i = 0; i < newLength - 1; i++) {
            // @ts-ignore
            const context = this._viewer.scene._context
            // @ts-ignore
            const fbo = new Cesium.Framebuffer({
              context: context,
              colorTextures: [
                // @ts-ignore
                new Cesium.Texture({
                  context: context,
                  width: this._viewer.scene.drawingBufferWidth,
                  height: this._viewer.scene.drawingBufferHeight,
                  pixelFormat: Cesium.PixelFormat.RGBA,
                }),
              ],
            })
            this._frameBuffers.push(fbo)
          }
          this.updateScenePrimitives()
          this.generatePostProcess()
        }

        return result
      },
    })
    this.startRender()
  }

  private preRenderHandler = () => {
    const length = this._orderPrimitives.length
    if (!length) return

    this.clearFrameBuffer()
    this._rawPrimitiveShowing = this._orderPrimitives.map((p) => p.show)
    for (let i = 0; i < length; i++) {
      this._orderPrimitives.forEach((p) => (p.show = false))
      this._orderPrimitives[i].show = this._rawPrimitiveShowing[i]

      // 最后一个层级不渲染到自定义的fbo
      if (i !== length - 1) {
        // @ts-ignore
        const context = this._viewer.scene._context
        // @ts-ignore
        const fbo = new Cesium.Framebuffer({
          context: context,
          colorTextures: [
            // @ts-ignore
            new Cesium.Texture({
              context: context,
              width: this._viewer.scene.drawingBufferWidth,
              height: this._viewer.scene.drawingBufferHeight,
              pixelFormat: Cesium.PixelFormat.RGBA,
            }),
          ],
        })
        this._frameBuffers[i]?.destroy()
        this._frameBuffers[i] = fbo
        const process = this._viewer.scene.postProcessStages
        const preEnableValues: boolean[] = []
        for (let i = 0; i < process.length; i++) {
          preEnableValues[i] = process.get(i).enabled
          process.get(i).enabled = false
        }
        this.renderToFbo(fbo)
        for (let i = 0; i < process.length; i++) {
          process.get(i).enabled = preEnableValues[i]
        }
      }
    }
  }

  private postRenderHandler = () => {
    this._orderPrimitives.forEach(
      (p, i) => (p.show = this._rawPrimitiveShowing[i]),
    )
  }

  private generatePostProcess() {
    let importPassColorTexture = ''
    let usePassColorTexture = ''
    let uniforms: Record<string, Function> = {}

    for (let i = 0; i < this._frameBuffers.length; i++) {
      importPassColorTexture += `uniform sampler2D passColorTexture${i};\n`
      usePassColorTexture += `vec4 texture${i} = texture(passColorTexture${i}, v_textureCoordinates);
			blendColor(outColor, texture${i});\n`

      uniforms[`passColorTexture${i}`] = () =>
        this._frameBuffers[i].getColorTexture(0)
    }

    const fs = `
		uniform sampler2D colorTexture;  // 颜色纹理
		in vec2 v_textureCoordinates;  // 纹理坐标
		${importPassColorTexture}

		void blendColor(inout vec4 background, vec4 foreground) {
    	float alpha = foreground.a + background.a * (1.0 - foreground.a);
			vec3 rgb;
			if(alpha == 0.0){
				rgb = vec3(0.0);
			}
			else{
				rgb = (foreground.rgb * foreground.a + background.rgb * background.a * (1.0 - foreground.a)) / alpha;
			}

    	background = vec4(rgb, alpha);
		}

		void main(void)
		{
			vec4 outColor = vec4(0.0);

			${usePassColorTexture}

			vec4 color = texture(colorTexture, v_textureCoordinates);
			blendColor(outColor, color);

			out_FragColor = outColor;
		}`

    // ${usePassColorTexture}

    const customPostProcessStage = new Cesium.PostProcessStage({
      fragmentShader: fs,
      uniforms: uniforms,
    })

    this.viewer.postProcessStages.removeAll()
    this.viewer.postProcessStages.add(customPostProcessStage)
  }

  /** 同步orderPrimitives到scene */
  private updateScenePrimitives() {
    this._viewer.scene.primitives.removeAll()
    this._orderPrimitives.forEach((p) => this.viewer.scene.primitives.add(p))
  }

  private renderToFbo(fbo: any) {
    const scene = this._viewer.scene as any

    const frameState = scene._frameState
    const context = scene.context
    const us = context.uniformState

    const view = scene._defaultView
    scene._view = view

    scene.updateFrameState()
    frameState.passes.render = true
    const renderTilesetPassState = new (Cesium as any).Cesium3DTilePassState({
      pass: (Cesium as any).Cesium3DTilePass.RENDER,
    })
    frameState.tilesetPassState = renderTilesetPassState

    let backgroundColor = scene.backgroundColor || Cesium.Color.BLACK
    frameState.backgroundColor = backgroundColor
    frameState.atmosphere = scene.atmosphere
    us.update(frameState)

    scene._computeCommandList.length = 0
    scene._overlayCommandList.length = 0

    const viewport = view.viewport
    viewport.x = 0
    viewport.y = 0
    viewport.width = context.drawingBufferWidth
    viewport.height = context.drawingBufferHeight

    const passState = view.passState
    // 最终绘制到传入的fbo
    passState.framebuffer = fbo
    passState.blendingEnabled = undefined
    passState.scissorTest = undefined
    passState.viewport = Cesium.BoundingRectangle.clone(
      viewport,
      passState.viewport,
    )

    scene.updateEnvironment()
    scene.updateAndExecuteCommands(passState, backgroundColor)
    scene.resolveFramebuffers(passState)
    passState.framebuffer = undefined

    context.endFrame()

    return fbo
  }

  /** 销毁并清空framebBuffers */
  private clearFrameBuffer() {
    this._frameBuffers.forEach((fbo) => fbo.destroy())
    this._frameBuffers = []
  }

  destroy() {
    this.stopRender()
    this._orderPrimitives.length = 0
    this.clearFrameBuffer()
  }

  stopRender() {
    this._viewer.scene.preRender.removeEventListener(this.preRenderHandler)
    this._viewer.scene.postRender.removeEventListener(this.postRenderHandler)
  }

  startRender() {
    this._viewer.scene.preRender.addEventListener(this.preRenderHandler)
    this._viewer.scene.postRender.addEventListener(this.postRenderHandler)
  }

  get orderPrimitives() {
    return this._orderPrimitives
  }

  get viewer() {
    return this._viewer
  }
}

export default OrderCesiumRenderController
