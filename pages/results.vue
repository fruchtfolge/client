<template>
  <div class="">
    <div v-if="loading" class="blur loading">
      <div class="spinner-container">
        <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        <h2 style="text-align: center;">Daten werden geladen ... <br> Der Vorgang kann einige Minuten in Anspruch nehmen</h2>
      </div>
    </div>
    <div v-else-if="resultsAvailable">
      <div class="result-wrapper">
        <table class="result-table">
          <thead>
            <tr>
              <th style="min-width: 150px;" @click="sortPlots('name')">Name</th>
              <th @click="sortPlots('size')">Größe</th>
              <th @click="sortPlots('distance')">Hof-Feld-Distanz</th>
              <th style="min-width: 100px;" @click="sortPlots('prevCrop1')">{{ curYear - 1 }}</th>
              <th style="min-width: 100px;" @click="sortPlots('selectedCrop')">Empfehlung {{ curYear }}</th>
              <th @click="sortPlots('curGrossMargin')">Deckungsbeitrag</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(plot,i) in curPlots">
              <tr :key="plot.id">
                <td style="text-align: center;">{{ plot.name }}</td>
                <td style="text-align: center;">{{ plot.size }}</td>
                <td style="text-align: center;">{{ plot.distance }}</td>
                <td style="text-align: center;">{{ plot.prevCrop1 }}</td>
                <td style="text-align: center;">
                  <select v-model="plot.selectedCrop" @change="saveCropChange(plot)" class="selection">
                    <option v-for="(crop) in plot.matrix[curYear]" :key="crop.grossMarginNoCropEff" :value="crop.code">
                      {{crop.name}}
                    </option>
                  </select>
                </td>
                <td style="text-align: center;" @click="showPlotInfo(plot.id)">
                  {{ format(plot.curGrossMargin) }}
                </td>
              </tr>
              <tr v-show="plot.id === selection" :key="plot._id">
                <td colspan="6" class="inner-table-wrapper" align="right">
                  <table class="inner-table">
                    <thead>
                      <th></th>
                      <th>Ertragskorrektur</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Durchschnittsertrag</td>
                        <td style="text-align: center;">{{
                          plot.matrix[curYear][plot.selectedCrop].amount
                        }}</td>
                      </tr>
                      <tr>
                        <td>Korrektur Bodenqualität</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'yieldCap', plot)">{{
                          ((plot.matrix[curYear][plot.selectedCrop].yieldCap
                               * plot.matrix[curYear][plot.selectedCrop].amount)
                               - plot.matrix[curYear][plot.selectedCrop].amount).toFixed(2)
                        }}</td>
                      </tr>
                      <tr>
                        <td>Korrektur Fruchtfolge</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'croppingFactor', plot)">{{
                          ((plot.matrix[curYear][plot.selectedCrop].croppingFactor
                               * plot.matrix[curYear][plot.selectedCrop].amount)
                               - plot.matrix[curYear][plot.selectedCrop].amount).toFixed(2)
                        }}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold;">Korrigierter Ertrag</td>
                        <td style="text-align:center;font-weight: bold;">{{
                          (plot.matrix[curYear][plot.selectedCrop].amount
                          * plot.matrix[curYear][plot.selectedCrop].yieldCap
                          * plot.matrix[curYear][plot.selectedCrop].croppingFactor).toFixed(2)
                        }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <table>
                    <thead>
                      <th></th>
                      <th>Preis [1/ha]</th>
                      <th>Menge [1/ha]</th>
                      <th>Summe [1/ha]</th>
                      <th>Summe</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Leistungen</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'price', plot)">{{
                          format(plot.matrix[curYear][plot.selectedCrop].price)
                        }}</td>
                        <td style="text-align:center;">{{
                          plot.matrix[curYear][plot.selectedCrop].correctedAmount
                        }}</td>
                        <td style="text-align:center;">{{
                          format(plot.matrix[curYear][plot.selectedCrop].revenue)
                        }}</td>
                        <td style="text-align:center;">{{
                          format(plot.matrix[curYear][plot.selectedCrop].revenue
                          * plot.matrix[curYear][plot.selectedCrop].size)
                        }}</td>
                      </tr>
                      <tr>
                        <td colspan="3">Direktkosten</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'directCosts', plot)">{{
                          format(plot.matrix[curYear][plot.selectedCrop].directCosts)
                        }}</td>
                        <td style="text-align:center;">{{
                          format(plot.matrix[curYear][plot.selectedCrop].directCosts
                          * plot.matrix[curYear][plot.selectedCrop].size)
                        }}</td>
                      </tr>
                      <tr>
                        <td colspan="3">Maschinenkosten</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'machineCosts', plot)">{{
                          format(plot.matrix[curYear][plot.selectedCrop].variableCosts)
                        }}</td>
                        <td style="text-align:center;">{{
                          format(plot.matrix[curYear][plot.selectedCrop].variableCosts
                          * plot.matrix[curYear][plot.selectedCrop].size)
                        }}</td>
                      </tr>
                      <tr>
                        <td colspan="3">Transportkosten</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'distanceCosts', plot)">{{
                          format(plot.matrix[curYear][plot.selectedCrop].distanceCosts)
                        }}</td>
                        <td style="text-align:center;">{{
                          format(plot.matrix[curYear][plot.selectedCrop].distanceCosts
                          * plot.matrix[curYear][plot.selectedCrop].size)
                        }}</td>
                      </tr>
                      <tr>
                        <td colspan="3">Deckungsbeitrag</td>
                        <td style="text-align:center;">{{
                          format(plot.matrix[curYear][plot.selectedCrop].grossMarginHa)
                        }}</td>
                        <td style="text-align:center;">{{
                          format(plot.matrix[curYear][plot.selectedCrop].grossMarginHa
                          * plot.matrix[curYear][plot.selectedCrop].size)
                        }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>
            <tr>
              <td colspan="5" style="font-weight: bold;">Summe</td>
              <td style="text-align: center;font-weight: bold;">{{format(grossMarginCurYear)}}</td>
            </tr>
          </tbody>
        </table>
        <div class="plots-wrapper">
          <cropShares :shares="curShares"/>
          <deviationOptimum :shares="shares" :plots="curPlots" :total="grossMarginCurYear"/>
          <grossMarginTimeline :plots="curPlots"/>
          <timeRequirement :shares="shares"/>
          <button type="button" name="button" @click="solve(true)" style="margin-top: 20px;">ZURÜCKSETZEN</button>
          <button type="button" name="button" @click="solve(false)" style="margin-left: 20px;">ERNEUT LÖSEN</button>
        </div>
      </div>
    </div>
    <div v-else style="text-align: center; margin-top: 80px;">
      <h3>Noch keine Schläge und Kulturen für das gewählte Planungsjahr vorhanden.<br>
      Bitte fürgen Sie mindestens einen Schlag und eine Kultur hinzu.</h3>
    </div>
  </div>
</template>
<script>
import cultures from '~/assets/js/cultures'
import model from '~/assets/js/createModel.js'

export default {
  data() {
    return {
      loading: true,
      curPlots: undefined,
      plots: undefined,
      curYear: undefined,
      infeasible: false,
      selection: undefined,
      sortKey: '',
      sortOrder: 'desc',
      cropColor: {}
    }
  },
  computed: {
    curShares() {
      const colors =["#294D4A", "#4A6D7C", "#7690A5", "#79ae98", "#BBE29D", "#9DD5C0", '#B5DCE1', "#D0D1D3", "#B5DCE1"]
      // calculate crop shares
      let o = {}
      this.curPlots.forEach(plot => {
        const selectedCrop = plot.selectedCrop
        if (!o[selectedCrop]) {
          o[selectedCrop] = {
            data: plot.size,
            name: plot.matrix[this.curYear][selectedCrop].name
          }
        }
        else o[selectedCrop].data += plot.size
      })
      // sort crop shares by descending size
      let a = []
      Object.keys(o).forEach((crop,i) => {
        o[crop].data = _.round(o[crop].data,2)
        a.push(o[crop])
      })
      a = _.orderBy(a,['data'],['desc'])
      a = a.map((crop,i) => {
        crop.backgroundColor = colors[i]
        return crop
      })
      return a
    },
    shares() {
      const plots = this.$store.plots.filter(plot => {
        return plot.scenario === this.$store.curScenario
      })
      const shares = {}
      plots.forEach(plot => {
        if (!shares[plot.year]) shares[plot.year] = {}
        let crop = plot.crop
        if (plot.year === this.curYear) crop = plot.selectedCrop
        if (!crop) return
        if (!shares[plot.year][crop]) {
          shares[plot.year][crop] = plot.size
        } else {
          shares[plot.year][crop] += plot.size
        }
      })
      return shares
    },
    resultsAvailable() {
      if (this.curPlots && this.curPlots[0].matrix && this.curPlots[0].matrix[this.curYear] ) {
        return true
      }
      return false
    },
    grossMarginCurYear() {
      const year = this.curYear
      let sum = 0
      this.curPlots.forEach(plot => {
        let code = plot.selectedCrop
        if (code) {
          const plotData = plot.matrix[year][code]
          const grossMargin = plotData.grossMargin
          sum += grossMargin
        }
      })
      return sum
    }
  },
  async created() {
    setTimeout(() => {
      this.update()
    },200)

    this.$bus.$on('changeCurrents', _.debounce(this.update, 200))
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
  },
  notifications: {
    showSolved: {
      title: 'ERFOLGREICH',
      message: 'Die Optimierung war erfolgreich und hat eine Lösung gefunden.',
      type: 'success'
    },
    showInfeasible: {
      title: 'UNMÖGLICH',
      message: 'Die Optimierung konnte keine Lösunge finden. Versuchen Sie, Restriktionen aufzuweichen.',
      type: 'error'
    }
  },
  methods: {
    async solve(force) {
      this.loading = true
      await this.$nextTick()
      // ugliest hack in existance: for some reason $nextTick is not triggering when
      // loading is set to true... so do a set timeout of 1ms to trigger the loading animation
      setTimeout(async () => {
        try {
          const store = this.$store
          if (!store.plots[0].matrix || force) {
            // add matrix of gross margins per crop and year to all plots
            store.plots = await model.buildMatrix(store.plots,store.crops,store.curYear)
            // update current plots with newly created gross margins
            store.curPlots = store.plots.filter(plot => {
              return plot.year === store.settings.curYear &&
                plot.scenario === store.settings.curScenario
            })
          }
          // create single farm model from user data in GAMS format
          const gams = model.createInclude(store)
          console.log({a: gams});
          // solve the model
          const { data } = await this.$axios.post('http://localhost:3001/model/', {model: gams},{ progress: true })
          console.log(data);
          if (data.model_status === 1) {
            store.curPlots.forEach(plot => {
              plot.recommendation = data.recommendation[plot._id]
              plot.selectedCrop = plot.recommendation
            })
          } else {
            this.infeasible = true
            store.curPlots.forEach(plot => {
              plot.recommendation = ''
              if (!plot.selectedCrop) {
                plot.selectedCrop = Object.keys(plot.matrix[this.curYear])[0]
              }
            })
          }
          // save results in database
          await this.$db.bulkDocs(store.plots)
          if (!this.infeasible) {
            this.showSolved()
          } else {
            this.showInfeasible()
          }
        } catch (e) {
          console.log(e)
        }
      }, 1)

    },
    sortPlots(column) {
      if (this.sortKey === column) {
        this.sortOrder === 'asc' ? this.sortOrder = 'desc' : this.sortOrder = 'asc'
      }
      this.sortKey = column
      this.curPlots = _.orderBy(this.curPlots,[column],[this.sortOrder])
    },
    updatePrevCrops() {
      if (this.curPlots && this.curPlots.length > 0) {
        this.curPlots = this.curPlots.map(plot => {
          plot.prevCrop1 = this.getName(plot.id,this.curYear - 1).name
          plot.prevCrop2 = this.getName(plot.id,this.curYear - 2).name
          plot.prevCrop3 = this.getName(plot.id,this.curYear - 3).name
          if (plot.matrix && plot.matrix[this.curYear] && plot.matrix[this.curYear][plot.selectedCrop]) {
            plot.curGrossMargin = plot.matrix[this.curYear][plot.selectedCrop].grossMargin
          } else {
            plot.curGrossMargin = 0
          }
          return plot
        })
      }
    },
    async save(e,i,type,plot) {
      try {
        const newValue = Number(e.target.innerText)
        const data = plot.matrix[this.curYear][plot.selectedCrop]
        const amount = data.amount

        if (type === 'yieldCap' || type === 'croppingFactor') {
          data[type] = (newValue + amount)/amount
        } else {
          data[type] = newValue
        }
        // recalculate gross margin
        const price = data.price
        const directCosts = data.directCosts
        const variableCosts = data.variableCosts
        const distanceCosts = data.distanceCosts
        const croppingFactor = data.croppingFactor
        const yieldCap = data.yieldCap

        data.correctedAmount = _.round(amount * croppingFactor * yieldCap, 2)
        let correctedAmount = data.correctedAmount
        data.revenue = _.round(price * correctedAmount, 2)
        data.revenueNoCropEff = _.round(price * amount, 2)
        let revenueNoCropEff = data.revenueNoCropEff
        data.grossMarginNoCropEff = _.round((revenueNoCropEff - directCosts - variableCosts - distanceCosts), 2)
        let revenue = data.revenue
        data.grossMarginHa = _.round(revenue - directCosts - variableCosts - distanceCosts, 2)
        data.grossMargin = _.round((revenue - directCosts - variableCosts - distanceCosts) * plot.size)
        // update plot
        plot.matrix[this.curYear][plot.selectedCrop] = data
        await this.$db.put(plot)
      } catch (e) {
        console.log(e)
      }
    },
    async saveCropChange(plot) {
      try {
        const id = plot._id
        const doc = await this.$db.get(id)
        doc.selectedCrop = plot.selectedCrop
        doc.curGrossMargin = plot.matrix[this.curYear][plot.selectedCrop].grossMargin
        await this.$db.put(doc)
      } catch (e) {
        console.log(e)
      }
    },

    getName(id, year) {
      const plot = _.find(this.$store.plots, {id: id, year: year})
      if (plot && cultures[plot.crop]) {
        return {
          name: cultures[plot.crop].variety,
          code: plot.crop
        }
      } else {
        return {
          name: '',
          code: ''
        }
      }
    },

    showPlotInfo(id) {
      if (this.selection === id) {
        this.selection = ''
      } else {
        this.selection = id
      }
    },

    async update() {
      this.loading = true
      const store = this.$store
      console.log('update');
      if (store) {
        this.$set(this, 'curPlots', store.curPlots)
        this.$set(this, 'curYear', store.curYear)
        if (this.curPlots && (!this.curPlots[0].matrix
          || !this.curPlots[0].matrix[store.curYear] || !this.curPlots[0].recommendation)
          && !this.infeasible) {
          await this.solve(true)
          await this.$nextTick()
        } else if (this.curPlots && this.curPlots[0].matrix
          && this.curPlots[0].matrix[store.curYear] && this.curPlots[0].recommendation) {
          // this.$bus.$off('changeCurrents')
          this.loading = false
        } else {
          this.loading = false
        }
        // update prev crops
        this.updatePrevCrops()
      }
    },

    format(number) {
      const formatter =  new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
      })
      return formatter.format(number)
    }
  },
  components: {
    cropShares: () => import('~/components/cropShares.vue'),
    grossMarginTimeline: () => import('~/components/grossMarginTimeline.vue'),
    timeRequirement: () => import('~/components/timeRequirement.vue'),
    deviationOptimum: () => import('~/components/deviation_optimum.vue')
  }
}
</script>
<style>
.loading {
  top: 480px;
}

.result-wrapper {
  width: calc(100% - 260px);
  display: inline-flex;
}

.plots-wrapper {
  width: 100%;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.result-table {
  float: left;
  margin: 0;
  margin-top: 20px;
  margin-left: 20px;
  max-width: 50vw;
}

.expand-enter-active, .expand-leave-active {
  transition: height .5s ease-in-out;
  overflow: hidden;
}

.expand-enter, .expand-leave-to {
  height: 0;
}

.result-table tr {
  background-color: #ECECEC;
}

.result-table tr:nth-child(4n+1), .result-table tr:nth-child(4n+2) {
  background-color: #F5F5F5;
}
.inner-table-wrapper {
  padding: 20px;
}
.inner-table {
  min-width: 0px;
  max-width: 0px;
}

.inner-table th {
  height: 25px;
}
.inner-table tr:nth-child(odd) {
  background-color: #F5F5f5;
}
.inner-table tr:nth-child(even) {
  background-color: #ECECEC;
}
.selection {
  font-size: 14px;
  text-align-last: center;
  font-family: 'Open Sans Light';
  letter-spacing: normal;
  border-width: 0px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='#444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-repeat: no-repeat;
  background-position: 100% 50%;
}
</style>
