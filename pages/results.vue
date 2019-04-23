<template>
  <div class="">
    <loading v-if="loading" />
    <div v-else-if="resultsAvailable">
      <div class="result-wrapper">
        <table class="result-table">
          <thead>
            <tr>
              <th style="width: 125px;" @click="sortPlots('name')">
                Name
              </th>
              <th style="width: 50px;" @click="sortPlots('size')">
                Größe
              </th>
              <th style="width: 50px;" @click="sortPlots('distance')">
                Distanz
              </th>
              <th style="min-width: 100px;" @click="sortPlots('prevCrop1')">
                {{ curYear - 1 }}
              </th>
              <th style="width: 50px;" @click="sortPlots('prevCrop1')">
                Planung ZF
              </th>
              <th style="min-width: 100px;" @click="sortPlots('selectedCrop')">
                Planung {{ curYear }}
              </th>
              <th @click="sortPlots('curGrossMargin')">
                Deckungsbeitrag
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(plot,i) in curPlots">
              <tr :key="`data_${plot._id}`">
                <td class="wide-cells">
                  {{ plot.name }}
                </td>
                <td class="narrow-cells">
                  {{ plot.size }}
                </td>
                <td class="narrow-cells">
                  {{ plot.distance }}
                </td>
                <td class="wide-cells">
                  {{ plot.prevCrop1 }}
                </td>
                <td class="narrow-cells">
                  <input type="checkbox" style="-webkit-appearance: checkbox;" :checked="plot.catchCrop" @change="saveCatchCropChange($event,plot)">
                </td>
                <td class="wide-cells">
                  <select v-model="plot.selectedCrop" class="selection" @change="saveCropChange(plot)">
                    <option v-for="(crop) in plot.matrix[curYear]" :key="`${crop.name}_${plot._id}`" :value="crop.name">
                      {{ crop.name }}
                    </option>
                  </select>
                </td>
                <td v-if="plot.catchCrop" style="text-align: center;" @click="showPlotInfo(plot.id)">
                  {{ format(plot.curGrossMargin - plot.matrix.catchCropCosts) }}
                </td>
                <td v-else style="text-align: center;" @click="showPlotInfo(plot.id)">
                  {{ format(plot.curGrossMargin) }}
                </td>
              </tr>
              <tr v-if="plot.id === selection" :key="`detail_${plot._id}`">
                <td colspan="7" class="inner-table-wrapper" align="right">
                  <table class="inner-table">
                    <thead>
                      <th />
                      <th>Ertragskorrektur</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Durchschnittsertrag</td>
                        <td style="text-align: center;">
                          {{
                            plot.matrix[curYear][plot.selectedCrop].amount
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td>Korrektur Bodenqualität</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'yieldCap', plot)">
                          {{
                            ((plot.matrix[curYear][plot.selectedCrop].yieldCap
                              * plot.matrix[curYear][plot.selectedCrop].amount)
                              - plot.matrix[curYear][plot.selectedCrop].amount).toFixed(2)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td>Korrektur Fruchtfolge</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'croppingFactor', plot)">
                          {{
                            ((plot.matrix[curYear][plot.selectedCrop].croppingFactor
                              * plot.matrix[curYear][plot.selectedCrop].amount)
                              - plot.matrix[curYear][plot.selectedCrop].amount).toFixed(2)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold;">
                          Korrigierter Ertrag
                        </td>
                        <td style="text-align:center;font-weight: bold;">
                          {{
                            (plot.matrix[curYear][plot.selectedCrop].amount
                              * plot.matrix[curYear][plot.selectedCrop].yieldCap
                              * plot.matrix[curYear][plot.selectedCrop].croppingFactor).toFixed(2)
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table>
                    <thead>
                      <th />
                      <th>Preis [1/ha]</th>
                      <th>Menge [1/ha]</th>
                      <th>Summe [1/ha]</th>
                      <th>Summe</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Leistungen</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'price', plot)">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].price)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            plot.matrix[curYear][plot.selectedCrop].correctedAmount
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].revenue)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].revenue
                              * plot.matrix[curYear][plot.selectedCrop].size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Direktkosten
                        </td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'directCosts', plot)">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].directCosts)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].directCosts
                              * plot.matrix[curYear][plot.selectedCrop].size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Maschinenkosten
                        </td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'machineCosts', plot)">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].variableCosts)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].variableCosts
                              * plot.matrix[curYear][plot.selectedCrop].size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Transportkosten
                        </td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'distanceCosts', plot)">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].distanceCosts)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].distanceCosts
                              * plot.matrix[curYear][plot.selectedCrop].size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Zwischenfruchtanbau
                        </td>
                        <td v-if="plot.catchCrop" style="text-align:center;" contenteditable="true" @blur="save($event,i,'catchCropCosts', plot)">
                          {{
                            format(plot.matrix.catchCropCosts / plot.size)
                          }}
                        </td>
                        <td v-else style="text-align:center;" contenteditable="true" @blur="save($event,i,'catchCropCosts', plot)">
                          {{
                            format(0)
                          }}
                        </td>
                        <td v-if="plot.catchCrop" style="text-align:center;">
                          {{
                            format(plot.matrix.catchCropCosts)
                          }}
                        </td>
                        <td v-else style="text-align:center;">
                          {{
                            format(0)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Deckungsbeitrag
                        </td>
                        <td v-if="plot.catchCrop" style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].grossMarginHa - (plot.matrix.catchCropCosts / plot.size))
                          }}
                        </td>
                        <td v-else style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].grossMarginHa)
                          }}
                        </td>
                        <td v-if="plot.catchCrop" style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].grossMarginHa
                              * plot.matrix[curYear][plot.selectedCrop].size - plot.matrix.catchCropCosts)
                          }}
                        </td>
                        <td v-else style="text-align:center;">
                          {{
                            format(plot.matrix[curYear][plot.selectedCrop].grossMarginHa
                              * plot.matrix[curYear][plot.selectedCrop].size)
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>
            <tr>
              <td colspan="1" style="font-weight: bold;">
                Summe
              </td>
              <td>{{ totLand }}</td>
              <td colspan="4" />
              <td style="text-align: center;font-weight: bold;">
                {{ format(grossMarginCurYear) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="plots-wrapper">
          <cropShares :shares="curShares" />
          <deviationOptimum :shares="shares" :plots="curPlots" :time="curTimeReq" :total="grossMarginCurYear" />
          <grossMarginTimeline :plots="curPlots" />
          <timeRequirement :shares="shares" />
          <button type="button" name="button" style="margin-top: 20px;" @click="solve(true)">
            ZURÜCKSETZEN
          </button>
          <button type="button" name="button" style="margin-left: 20px;" @click="solve(false)">
            ERNEUT LÖSEN
          </button>
        </div>
      </div>
      <download class="excel-download" :data="curPlots" :year="curYear" />
    </div>
    <div v-else style="text-align: center; margin-top: 80px;">
      <h3>
        Noch keine Schläge und Kulturen für das gewählte Planungsjahr vorhanden.<br>
        Bitte fürgen Sie mindestens einen Schlag und eine Kultur hinzu.
      </h3>
    </div>
  </div>
</template>
<script>
import cultures from '~/assets/js/cultures'
import model from '~/assets/js/createModel.js'

export default {
  components: {
    loading: () => import('~/components/loading.vue'),
    cropShares: () => import('~/components/cropShares.vue'),
    grossMarginTimeline: () => import('~/components/grossMarginTimeline.vue'),
    timeRequirement: () => import('~/components/timeRequirement.vue'),
    deviationOptimum: () => import('~/components/deviation_optimum.vue'),
    download: () => import('~/components/download.vue')
  },
  data() {
    return {
      loading: true,
      curPlots: undefined,
      plots: undefined,
      curYear: undefined,
      curScenario: 'Standard',
      infeasible: false,
      warnings: undefined,
      selection: undefined,
      totLand: 0,
      sortKey: '',
      shares: {},
      sortOrder: 'desc',
      cropColor: {}
    }
  },
  computed: {
    curTimeReq() {
      const months = [
        ['JAN1', 'JAN2'],
        ['FEB1', 'FEB2'],
        ['MRZ1', 'MRZ2'],
        ['APR1', 'APR2'],
        ['MAI1', 'MAI2'],
        ['JUN1', 'JUN2'],
        ['JUL1', 'JUL2'],
        ['AUG1', 'AUG2'],
        ['SEP1', 'SEP2'],
        ['OKT1', 'OKT2'],
        ['NOV1', 'NOV2'],
        ['DEZ1', 'DEZ2']
      ]
      const catchCropMonths = ['AUG2', 'SEP1', 'SEP2', 'FEB2']
      if (!this.$store || !this.$store.curCrops) return []

      const data = months.map(month => {
        let time = 0
        this.$store.curCrops.forEach(crop => {
          const share = this.shares[this.curYear][crop.name]
          let steps = crop.workingSteps.filter(o => {
            return month[0] === o.month || month[1] === o.month
          })
          if (steps && steps.length > 0 && share) {
            steps = steps.map(step => {
              return _.sumBy(step.steps, 'time')
            })
            time += _.sum(steps) * share
          }
        })
        this.curPlots.forEach(plot => {
          if (
            plot.catchCrop &&
            (catchCropMonths.indexOf(month[0]) > -1 ||
              catchCropMonths.indexOf(month[1]) > -1)
          ) {
            // Source: Own regression made from KTBL - Verfahrensrechner Pflanze data
            // Based on crop "Zwischenfrucht Senf"
            time +=
              (0.04827586207 * plot.distance - 0.1 * plot.size + 4.191724138) /
              catchCropMonths.length
          }
        })
        return _.round(time, 2)
      })
      return data
    },
    curShares() {
      const colors = [
        '#294D4A',
        '#4A6D7C',
        '#7690A5',
        '#79ae98',
        '#BBE29D',
        '#9DD5C0',
        '#B5DCE1',
        '#D0D1D3',
        '#B5DCE1'
      ]
      // calculate crop shares
      const o = {}
      if (!this.curPlots) return o
      this.curPlots.forEach(plot => {
        const selectedCrop = plot.selectedCrop
        if (!selectedCrop) return
        if (!o[selectedCrop]) {
          o[selectedCrop] = {
            data: plot.size,
            name: selectedCrop
          }
        } else o[selectedCrop].data += plot.size
      })
      // sort crop shares by descending size
      let a = []
      Object.keys(o).forEach((crop, i) => {
        o[crop].data = _.round(o[crop].data, 2)
        a.push(o[crop])
      })
      a = _.orderBy(a, ['data'], ['desc'])
      a = a.map((crop, i) => {
        crop.backgroundColor = colors[i]
        return crop
      })
      return a
    },
    resultsAvailable() {
      let flag = false
      if (this.$store && this.curPlots && this.curPlots.length) {
        flag = true
        this.curPlots.forEach(plot => {
          if (!plot.matrix || !plot.matrix[this.curYear]) {
            flag = false
          }
        })
      }
      return flag
    },
    grossMarginCurYear() {
      const year = this.curYear
      let sum = 0
      if (!this.curPlots) return 0
      this.curPlots.forEach(plot => {
        const name = plot.selectedCrop
        if (name && plot.matrix[year] && plot.matrix[year][name]) {
          const plotData = plot.matrix[year][name]
          sum += plotData.grossMargin
          if (plot.catchCrop) {
            sum += -plot.matrix.catchCropCosts
          }
        }
      })
      return sum
    }
  },
  created() {
    setTimeout(() => {
      this.update()
    }, 200)

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
    showWarnings: {
      title: 'ANPASSUNG NÖTIG',
      message: 'Nicht alle Restriktionen konnten eingehalten werden',
      type: 'warn'
    },
    showInfeasible: {
      title: 'UNMÖGLICH',
      message:
        'Die Optimierung konnte keine Lösunge finden. Versuchen Sie, Restriktionen aufzuweichen.',
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
            store.plots = await model.buildMatrix(
              store.plots,
              store.crops,
              store.curYear,
              store.curScenario
            )
            // update current plots with newly created gross margins
            store.curPlots = store.plots.filter(plot => {
              return (
                plot.year === store.settings.curYear &&
                plot.scenario === store.settings.curScenario
              )
            })
          }
          // create single farm model from user data in GAMS format
          const gams = model.createInclude(store)
          console.log({ a: gams })
          // solve the model
          const { data } = await this.$axios.post(
            process.env.baseUrl + 'model/',
            { model: gams },
            { progress: true }
          )
          console.log(data)
          if (data.model_status === 1) {
            this.warnings = data.warnings
            store.curPlots.forEach(plot => {
              plot.recommendation = data.recommendation[plot._id]
              plot.selectedCrop = plot.recommendation
              plot.catchCrop = data.catchCrop[plot._id]
              plot.recommendedCatchCrop = data.catchCrop[plot._id]
            })
          } else {
            this.infeasible = true
            store.curPlots.forEach(plot => {
              plot.recommendation = ''
              plot.recommendedCatchCrop = false
              if (!plot.selectedCrop) {
                plot.selectedCrop = Object.keys(plot.matrix[this.curYear])[0]
              }
            })
          }
          // save results in database
          await this.$db.bulkDocs(store.plots)
          if (!this.infeasible && !this.warnings) {
            this.showSolved()
          } else if (!this.infeasible && this.warnings) {
            const warnings = this.warnings.join('\n')
            this.showWarnings({ message: warnings })
          } else {
            this.showInfeasible()
          }
        } catch (e) {
          console.log(e)
        }
      }, 1)
    },
    calcShares() {
      if (!this.$store.plots) return []
      const plots = this.$store.plots.filter(plot => {
        return plot.scenario === this.$store.curScenario
      })
      const shares = {}
      if (!plots) return {}
      plots.forEach(plot => {
        if (!shares[plot.year]) shares[plot.year] = {}
        let crop
        if (plot.year === this.curYear) {
          crop = plot.selectedCrop
        } else {
          const cropCode = plot.crop
          const cropData = _.find(this.$store.crops, ['code', cropCode])
          if (!cropData) return
          crop = cropData.name
        }
        if (!shares[plot.year][crop]) {
          shares[plot.year][crop] = plot.size
        } else {
          shares[plot.year][crop] += plot.size
        }
      })
      this.shares = shares
    },
    sortPlots(column) {
      if (this.sortKey === column) {
        this.sortOrder === 'asc'
          ? (this.sortOrder = 'desc')
          : (this.sortOrder = 'asc')
      }
      this.sortKey = column
      this.curPlots = _.orderBy(this.curPlots, [column], [this.sortOrder])
    },
    updatePrevCrops() {
      if (this.curPlots && this.curPlots.length > 0) {
        let debugBounds = ''
        this.totLand = 0
        this.curPlots = this.curPlots.map(plot => {
          this.totLand += plot.size
          debugBounds += `v_binCropPlot.fx('${plot.selectedCrop}','${
            plot._id
          }') = 1;\n`
          if (plot.catchCrop) {
            debugBounds += `v_binCatchCrop.fx('${plot.selectedCrop}','${
              plot._id
            }') = 1;\n`
          }

          plot.prevCrop1 = this.getName(plot.id, this.curYear - 1).name
          plot.prevCrop2 = this.getName(plot.id, this.curYear - 2).name
          plot.prevCrop3 = this.getName(plot.id, this.curYear - 3).name
          if (
            plot.matrix &&
            plot.matrix[this.curYear] &&
            plot.matrix[this.curYear][plot.selectedCrop]
          ) {
            plot.curGrossMargin =
              plot.matrix[this.curYear][plot.selectedCrop].grossMargin
          } else {
            plot.curGrossMargin = 0
          }
          return plot
        })
        console.log({ a: debugBounds })
      }
    },
    async save(e, i, type, plot) {
      try {
        const newValue = Number(e.target.innerText)
        const data = plot.matrix[this.curYear][plot.selectedCrop]
        const amount = data.amount

        if (type === 'yieldCap' || type === 'croppingFactor') {
          data[type] = (newValue + amount) / amount
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
        const correctedAmount = data.correctedAmount
        data.revenue = _.round(price * correctedAmount, 2)
        data.revenueNoCropEff = _.round(price * amount, 2)
        const revenueNoCropEff = data.revenueNoCropEff
        data.grossMarginNoCropEff = _.round(
          revenueNoCropEff - directCosts - variableCosts - distanceCosts,
          2
        )
        const revenue = data.revenue
        data.grossMarginHa = _.round(
          revenue - directCosts - variableCosts - distanceCosts,
          2
        )
        data.grossMargin = _.round(
          (revenue - directCosts - variableCosts - distanceCosts) * plot.size
        )
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
        doc.curGrossMargin =
          plot.matrix[this.curYear][plot.selectedCrop].grossMargin
        await this.$db.put(doc)
      } catch (e) {
        console.log(e)
      }
    },

    async saveCatchCropChange(e, plot) {
      try {
        const id = plot._id
        const doc = await this.$db.get(id)
        doc.catchCrop = e.target ? e.target.checked : false
        await this.$db.put(doc)
      } catch (e) {
        console.log(e)
      }
    },

    getName(id, year) {
      const plot = _.find(this.$store.plots, { id: id, year: year })
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
      console.log('update')
      if (store) {
        this.$set(this, 'curPlots', store.curPlots)
        this.$set(this, 'curYear', store.curYear)
        this.$set(this, 'curScenario', store.curScenario)
        if (
          this.curPlots &&
          this.curPlots.length &&
          store.curCrops &&
          !this.resultsAvailable &&
          !this.infeasible
        ) {
          await this.solve(true)
          return
        }
        // update prev crops
        this.updatePrevCrops()
        // update shares
        this.calcShares()
        this.loading = false
      }
    },

    format(number) {
      const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
      })
      return formatter.format(number)
    }
  }
}
</script>
<style>
.loading {
  top: 480px;
}

.result-wrapper {
  width: calc(100vw - 200px);
  min-width: 1024px;
  display: inline-flex;
}

.plots-wrapper {
  /* width: 100%; */
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
  min-width: 600px;
  table-layout: fixed;
}
.wide-cells {
  width: 125px;
  text-align: left;
  overflow-x: hidden;
}

.narrow-cells {
  width: 50px;
  text-align: center;
  overflow-x: hidden;
}

.expand-enter-active,
.expand-leave-active {
  transition: height 0.5s ease-in-out;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}

.result-table tr {
  background-color: #ececec;
}

.result-table tr:nth-child(odd) {
  background-color: #f5f5f5;
}

/*
.result-table tr:nth-child(4n + 1),
.result-table tr:nth-child(4n + 2) {
  background-color: #f5f5f5;
}
*/

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
  background-color: #f5f5f5;
}

.inner-table tr:nth-child(even) {
  background-color: #ececec;
}
.selection {
  font-size: 14px;
  text-align-last: left;
  font-family: 'Open Sans Light';
  letter-spacing: normal;
  border-width: 0px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='%23444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-repeat: no-repeat;
  background-position: 80px 50%;
}

.excel-download {
  margin-top: 40px;
  text-align: center;
}
</style>
