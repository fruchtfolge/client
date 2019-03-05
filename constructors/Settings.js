export default class Setting {
  constructor(settings) {
    this._id = 'settings'
    this.type = 'settings'
    this.zidId = ''
    this.zidPass = ''
    this.curYear = settings.curYear,
    this.curScenario = settings.curScenario,
    this.street = ''
    this.postcode = ''
    this.city = ''
  }
}
