function getId() {
  const date = new Date()
  return date.toISOString()
}

module.exports = class Crop {
  constructor(properties) {
    // database info
    //this._id = getId()
    this.type = 'crop',
    this.year = properties.year,
    this.scenario = properties.scenario,
    this.active = properties.active || false,

    // general crop data
    this.name = properties.variety || properties.crop,
    this.crop = properties.crop,
    this.code = properties.code,
    this.cropGroup = properties.cropGroup,
    this.variety = properties.variety,
    this.subseqCrops = properties.subseqCrops,
    this.efaFactor = properties.efaFactor,
    this.legume = properties.legume,
    this.rootCrop = properties.rootCrop,
    this.minSoilQuality = properties.minSoilQuality,
    this.rotBreak = properties.rotBreak,
    this.maxShare = this.rotBreak === 0 ? 100 : 1 / this.rotBreak * 100,

    // contribution margin related data
    this.price = properties.price,
    this.yield = properties.yield,
    this.directCosts = properties.directCosts,
    this.otherCosts = properties.otherCosts,
    this.fixedCosts = properties.fixedCosts,
    this.workingSteps = properties.workingSteps || [],
    this.cultivationType = properties.cultivationType

    this.revenue = properties.revenue
    this.dirCostsFreeRev = properties.dirCostsFreeRev
    this.variableCosts = properties.variableCosts
    this.contributionMargin = properties.contributionMargin
  }
}
