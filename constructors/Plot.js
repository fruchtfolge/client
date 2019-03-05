function getId() {
  const date = new Date()
  return date.toISOString()
}

export default class Plot {
  constructor(properties) {
    this._id = getId()
    this.type = 'plot',
    this.name = properties.name || 'Unbenannt',
    this.id = properties.id || this._id,
    this.year = properties.year,
    this.scenario = properties.scenario,
    this.geometry = properties.geometry,
    this.geometry.properties._id = this._id,
    this.size = properties.size,
    this.center = properties.center,
    this.quality = properties.quality,
    this.soilType = properties.soilType,
    this.distance = properties.distance,
    this.region = properties.region,
    this.cropGroup = properties.cropGroup,
    this.crop = properties.crop,
    this.permPast = properties.permPast || false,
    this.rootCrops = properties.rootCrops || true
  }
}
