uniform vec4 color;         // 实线颜色
uniform vec4 gapColor;      // 虚线颜色
uniform float solidLength;  // 实线长度，单位：像素
uniform float gapLength;    // 虚线长度，单位：像素
uniform float u_polylineLength;  // 应用此材质的线长，单位：米。
uniform float u_pixelSizeInMeters;  // 每个像素的大小，单位：米。

czm_material czm_getMaterial(czm_materialInput materialInput) {
	czm_material material = czm_getDefaultMaterial(materialInput);
	vec2 st = materialInput.st;

	vec4 fragColor = color;
	float offset = solidLength + gapLength;
	if(mod(st.s * u_polylineLength / u_pixelSizeInMeters, offset) > solidLength) {
		fragColor = gapColor;
	}

	material.emission = fragColor.rgb;
	material.alpha = fragColor.a;
	return material;
}