/* tslint:disable */
/* eslint-disable */
/**
 * 切割凹多边形为多个凸多边形
 */
export function split_concave(polygon: Polygon, k: number): MultiPolygon;
/**
 * 获取多边形内的所有线段
 */
export function get_polygon_segments(polygon: Polygon, k: number, d: number): Segment[][];
/**
 * 获取多边形内的覆盖路径
 */
export function get_polygon_area_wayline(polygon: Polygon, k: number, d: number, start_point: Point): Polyline;
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

