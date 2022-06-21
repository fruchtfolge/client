export default class Setting {
  constructor(settings) {
    this._id = 'settings'
    this.type = 'settings'
    this.duev2020 = true
    this.zidId = ''
    this.zidPass = ''
    this.curYear = settings.curYear
    this.curScenario = settings.curScenario
    this.street = ''
    this.city = ''
  }
}
