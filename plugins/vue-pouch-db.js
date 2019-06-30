import Vue from 'vue'
import PouchDB from 'pouchdb-browser'
import Find from 'pouchdb-find'
import LiveFind from 'pouchdb-live-find'
import pkg from '../package'

PouchDB.plugin(Find)
PouchDB.plugin(LiveFind)

// add global event bus
Vue.prototype.$bus = new Vue({})
// initate store
Vue.prototype.$store = {}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// listen to import previous year event
Vue.prototype.$bus.$on('importPrevYear', async () => {
  try {
    const curYear = Vue.prototype.$store.curYear
    const result = await Vue.prototype.$db.find({
      selector: {
        year: curYear - 1
      }
    })
    if (result && result.docs && result.docs.length > 0) {
      const data = result.docs.map(o => {
        o._id = uuidv4()
        delete o._rev
        // set year to new year, and shift crops one year back
        o.year = curYear
        o.prevCrop3 = o.prevCrop2
        o.prevCrop2 = o.prevCrop1
        o.prevCrop1 = o.crop
        o.crop = ''
        // delete calculated settings from previous year to enforce re-calculation
        delete o.selectedCrop
        delete o.recommendation
        delete o.curGrossMargin
        delete o.matrix
        o.catchCrop = false
        return o
      })
      await Vue.prototype.$db.bulkDocs(data)
    }
    console.log(result)
  } catch (e) {
    console.log(e)
  }
})

function updateCurrent() {
  if (Vue.prototype.$store.plots && Vue.prototype.$store.settings) {
    Vue.set(
      Vue.prototype.$store,
      'curPlots',
      Vue.prototype.$store.plots.filter(plot => {
        return (
          plot.year === Vue.prototype.$store.settings.curYear &&
          plot.scenario === Vue.prototype.$store.settings.curScenario
        )
      })
    )
  }
  if (Vue.prototype.$store.crops && Vue.prototype.$store.settings) {
    Vue.set(
      Vue.prototype.$store,
      'curCrops',
      Vue.prototype.$store.crops.filter(crop => {
        return (
          crop.year === Vue.prototype.$store.settings.curYear &&
          crop.active === true &&
          crop.scenario === Vue.prototype.$store.settings.curScenario
        )
      })
    )
  }
  if (Vue.prototype.$store.constraints && Vue.prototype.$store.settings) {
    Vue.set(
      Vue.prototype.$store,
      'curConstraints',
      Vue.prototype.$store.constraints.filter(constraint => {
        return (
          constraint.year === Vue.prototype.$store.settings.curYear &&
          constraint.scenario === Vue.prototype.$store.settings.curScenario
        )
      })
    )
  }
  if (Vue.prototype.$store.timeConstraints && Vue.prototype.$store.settings) {
    const match = Vue.prototype.$store.timeConstraints.filter(
      timeConstraints => {
        return (
          timeConstraints.year === Vue.prototype.$store.settings.curYear &&
          timeConstraints.scenario === Vue.prototype.$store.settings.curScenario
        )
      }
    )
    if (match.length > 0) {
      Vue.set(Vue.prototype.$store, 'curTimeConstraints', match[0])
    } else {
      Vue.set(Vue.prototype.$store, 'curTimeConstraints', null)
    }
  }
  Vue.prototype.$bus.$emit('changeCurrents')
}

export default ({ app }, inject) => {
  inject('version', pkg.version)
  inject('store', Vue.prototype.$store)
  inject('initalizeDB', database => {
    const db = new PouchDB(database, { auto_compaction: true })
    Vue.prototype.$db = db
    const debouncedUpdate = _.debounce(updateCurrent, 50)
    // console.log(debouncedUpdate())
    // store settings and keep updated
    Vue.prototype.$db
      .liveFind({
        selector: {
          type: 'settings'
        },
        aggregate: true
      })
      .on('update', (update, aggregate) => {
        Vue.set(Vue.prototype.$store, 'settings', aggregate[0])
        Vue.set(Vue.prototype.$store, 'curYear', aggregate[0].curYear)
        Vue.set(Vue.prototype.$store, 'curScenario', aggregate[0].curScenario)
        debouncedUpdate()
      })
      .on('error', err => {
        console.log(err)
      })

    // plots
    Vue.prototype.$db
      .liveFind({
        selector: {
          type: 'plot'
        },
        sort: [
          {
            name: 'asc'
          }
        ],
        aggregate: true
      })
      .on('update', (update, aggregate) => {
        Vue.set(Vue.prototype.$store, 'plots', aggregate)
        debouncedUpdate()
      })
      .on('error', err => {
        console.log(err)
      })

    // crops
    Vue.prototype.$db
      .liveFind({
        selector: {
          type: 'crop'
        },
        sort: [
          {
            name: 'asc'
          }
        ],
        aggregate: true
      })
      .on('update', (update, aggregate) => {
        Vue.set(Vue.prototype.$store, 'crops', aggregate)
        debouncedUpdate()
      })
      .on('error', err => {
        console.log(err)
      })

    // constraints
    Vue.prototype.$db
      .liveFind({
        selector: {
          type: 'constraint'
        },
        aggregate: true
      })
      .on('update', (update, aggregate) => {
        Vue.set(Vue.prototype.$store, 'constraints', aggregate)
        debouncedUpdate()
      })
      .on('error', err => {
        console.log(err)
      })

    // time constraints
    Vue.prototype.$db
      .liveFind({
        selector: {
          type: 'timeConstraints'
        },
        aggregate: true
      })
      .on('update', (update, aggregate) => {
        Vue.set(Vue.prototype.$store, 'timeConstraints', aggregate)
        debouncedUpdate()
      })
      .on('error', err => {
        console.log(err)
      })

    inject('db', Vue.prototype.$db)
  })
}
