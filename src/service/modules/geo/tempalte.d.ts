declare namespace API_GEO_SERACH {
  // ----------------- domain ----------------
  namespace domain {}
  // ------------------ req ------------------
  namespace req {}
  // ------------------ res ------------------
  namespace res {
    type RoadDataRes = GeoJSON.FeatureCollection<GeoJSON.LineString>
    type AOIDataRes = GeoJSON.FeatureCollection<GeoJSON.Polygon>
    type POIDataRes = GeoJSON.FeatureCollection<GeoJSON.Point>
  }
}
