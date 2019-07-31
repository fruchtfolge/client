import * as MapboxDraw from '@mapbox/mapbox-gl-draw'
import { area } from '@turf/turf'

const PolygonMode = MapboxDraw.modes.draw_polygon

const _clickAnywhere = PolygonMode.clickAnywhere

PolygonMode.clickAnywhere = function(state, e) {
  const result = _clickAnywhere.apply(this, [state, e])

  if (state.polygon) {
    this.map.fire('draw.liveUpdate', {
      curSize: area(state.polygon.toGeoJSON()) / 10000,
      curPos: state.currentVertexPosition
    })
  }

  return result
}

export default PolygonMode
