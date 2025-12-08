/* tslint:disable */
/**
 * 获取多边形内的覆盖路径
 */
export function get_polygon_area_wayline(outer: Polygon, inner: MultiPolygon, d: number, start_point: Point): Polyline;
export function main_js(): void;
export interface Point {
    x: number;
    y: number;
}

export interface Segment {
    a: Point;
    b: Point;
}

export type Polygon = Point[];

export type MultiPolygon = Polygon[];

export type Polyline = Point[];

