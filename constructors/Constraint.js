export default class Constraint {
  constructor(properties) {
    this.type = 'constraint',
    this.year = properties.year,
    this.scenario = properties.scenario

    this.crop1 = properties.crop1
    this.crop2 = properties.crop2
    this.crop1Code = properties.crop1Code
    this.crop2Code = properties.crop2Code
    this.name = this.crop2 ? this.crop1 + ' + ' + this.crop2 : this.crop1
    this.operator = properties.operator
    this.sizeType = properties.sizeType
    this.area = properties.area
  }
}
