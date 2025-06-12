uniform vec4 color;
uniform float offset; 		// 每一段间隔的宽度，单位：像素
uniform float lineWidth;  //线宽
uniform float u_polylineLength;   	// 应用此材质的线长，单位：米。
uniform float u_pixelSizeInMeters; 	// 每个像素的大小，单位：米。

czm_material czm_getMaterial(czm_materialInput materialInput) {
	czm_material material = czm_getDefaultMaterial(materialInput);
	vec2 st = materialInput.st;

	vec4 fragColor = color;
	fragColor.a = 0.0;

	float offset = 10.0;
	float texturePosition = mod(st.s * u_polylineLength / u_pixelSizeInMeters, offset);
  // 隔断线
	if(texturePosition < offset / 2.0 + lineWidth / 2.0 && texturePosition > offset / 2.0 - lineWidth / 2.0) {
		fragColor.a = 1.0;
	}
  // 细线
	if(st.t > 0.5 - lineWidth / 20.0 && st.t < 0.5 + lineWidth / 20.0) {
		fragColor.a = 1.0;
	}

	material.emission = fragColor.rgb;
	material.alpha = fragColor.a;
	return material;
}