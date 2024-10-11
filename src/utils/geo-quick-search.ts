import { sortedIndex } from 'lodash';

/** 地图点快速筛选 */
class GeoQuickSearch<
  T extends Record<string | number, any> = Record<string | number, any>,
> {
  private delta = 0.001;
  private delta2 = 1;
  private box: T[][][];
  private rawData: T[];
  private xs: number[];
  private xys: number[][];

  constructor(data: T[]) {
    this.rawData = data;
    this.xs = [];
    this.box = [];
    this.xys = [];
    this.delta2 = 1 / this.delta; // 乘法比除法快
  }

  // O(nlogn)
  public init(lngKey: string, latKey: string) {
    for (const item of this.rawData) {
      const lng = Math.floor((item[lngKey] as number) * this.delta2);
      this.xs.push(lng);
    }
    this.xs = Array.from(new Set(this.xs)).toSorted();
    this.box = Array.from({ length: this.xs.length + 1 });
    this.xys = Array.from({ length: this.xs.length + 1 }).map(() => []);
    for (const item of this.rawData) {
      const lng = Math.floor((item[lngKey] as number) * this.delta2);
      const lat = Math.floor((item[latKey] as number) * this.delta2);
      const xIndex = sortedIndex(this.xs, lng);
      this.xys[xIndex].push(lat);
    }
    this.xys = this.xys.map((ys) => Array.from(new Set(ys)).toSorted());
    for (let i = 0; i < this.box.length; i++) {
      this.box[i] = Array.from({ length: this.xys[i].length + 1 }).map(
        () => [],
      );
    }
    for (const item of this.rawData) {
      const lng = Math.floor((item[lngKey] as number) * this.delta2);
      const lat = Math.floor((item[latKey] as number) * this.delta2);
      const xIndex = sortedIndex(this.xs, lng);
      const yIndex = sortedIndex(this.xys[xIndex], lat);
      this.box[xIndex][yIndex].push(item);
    }
  }

  private resolveLng(lng: number) {
    lng %= 360;
    if (lng < -180) {
      lng += 360;
    } else if (lng > 180) {
      lng -= 360;
    }
    return lng;
  }

  private resolveLat(lat: number) {
    lat %= 180;
    if (lat < -90) {
      lat += 180;
    } else if (lat > 90) {
      lat -= 180;
    }
    return lat;
  }

  // O(n)
  public search(lng0: number, lat0: number, lng1: number, lat1: number): T[] {
    lng0 = this.resolveLng(lng0);
    lat0 = this.resolveLat(lat0);
    lng1 = this.resolveLng(lng1);
    lat1 = this.resolveLat(lat1);

    if (lng0 > lng1 && lat0 > lat1) {
      return [
        ...this.search(lng0, lat0, 180, 90),
        ...this.search(-180, lat0, lng1, 90),
        ...this.search(lng0, -90, 180, lat1),
        ...this.search(-180, -90, lng1, lat1),
      ];
    }

    if (lng0 > lng1) {
      return [
        ...this.search(lng0, lat0, 180, lat1),
        ...this.search(-180, lat0, lng1, lat1),
      ];
    }

    if (lat0 > lat1) {
      return [
        ...this.search(lng0, lat0, lng1, 90),
        ...this.search(lng0, -90, lng1, lat1),
      ];
    }

    const x0 = Math.floor(lng0 * this.delta2);
    const y0 = Math.floor(lat0 * this.delta2);
    const x1 = Math.floor(lng1 * this.delta2);
    const y1 = Math.floor(lat1 * this.delta2);
    const x0Index = sortedIndex(this.xs, x0);
    const x1Index = sortedIndex(this.xs, x1);
    const result: T[] = [];
    for (let x = x0Index; x <= x1Index; x++) {
      const y0Index = sortedIndex(this.xys[x], y0);
      const y1Index = sortedIndex(this.xys[x], y1);
      for (let y = y0Index; y <= y1Index; y++) {
        result.push(...this.box[x][y]);
      }
    }
    return result;
  }
}

export default GeoQuickSearch;
