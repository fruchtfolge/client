export default class Manure {
  constructor(properties) {
    this.type = 'manure'
    this.year = properties.year
    this.scenario = properties.scenario

    this.category = properties.category
    this.description = properties.description
    this.amount = properties.amount
    this.manType = properties.manType

    this.nYear = properties.N
    this.pYear = properties.P2O5
    this.kYear = properties.K2O
    this.fertAmount = properties[this.manType]

    this.n = _.round(this.nYear / this.fertAmount, 1)
    this.p = _.round(this.pYear / this.fertAmount, 1)
    this.k = _.round(this.kYear / this.fertAmount, 1)

    this.sumFertAmount = _.round(this.amount * this.fertAmount, 1)
    this.sumN = _.round(this.nYear * this.amount, 1)
    this.sumP = _.round(this.pYear * this.amount, 1)
    this.sumK = _.round(this.kYear * this.amount, 1)

    this.minUsagePercent = this.manType.includes('Festmist')
      ? properties['Mist::N-Ausnutzung']
      : properties['Gülle::N-Ausnutzung']
  }
}
