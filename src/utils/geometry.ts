type Vertex = [number, number] | number[];

/** 计算多边形的质心 */
export const polygonCentroid = (vertices: Vertex[]): Vertex => {
  const n = vertices.length;
  let A = 0; // Signed area of the polygon
  let Cx = 0;
  let Cy = 0;

  for (let i = 0; i < n; i++) {
    const [x_i, y_i] = vertices[i];
    const [x_next, y_next] = vertices[(i + 1) % n];
    const crossProduct = x_i * y_next - x_next * y_i;
    A += crossProduct;
    Cx += (x_i + x_next) * crossProduct;
    Cy += (y_i + y_next) * crossProduct;
  }

  A *= 0.5;
  Cx /= 6 * A;
  Cy /= 6 * A;

  return [Cx, Cy];
};
