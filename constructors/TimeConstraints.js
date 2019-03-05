export default class Constraint {
  constructor(properties) {
    this._id = properties.year + properties.scenario + 'timeConstraints'
    this.type = 'timeConstraints'
    this.year = properties.year
    this.scenario = properties.scenario

    this.data = properties.data
    this.options = properties.options
    this.chartType = properties.type
  }
}
