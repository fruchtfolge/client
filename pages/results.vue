<template>
  <div class="">
    <loading v-if="loading" />
    <div v-else-if="resultsAvailable">
      <div class="result-wrapper">
        <table class="table result-table">
          <thead>
            <tr>
              <th style="min-width: 80px;" @click="sortPlots('name')">
                Name
              </th>
              <th style="width: 50px;" @click="sortPlots('size')">
                Größe [ha]
              </th>
              <th style="width: 50px;" @click="sortPlots('distance')">
                Distanz [km]
              </th>
              <th style="min-width: 50px;" @click="sortPlots('prevCrop1')">
                {{ curYear - 1 }}
              </th>
              <th style="width: 40px;" @click="sortPlots('prevCrop1')">
                Planung ZF
              </th>
              <th class="plot-selection" @click="sortPlots('selectedCrop')">
                Planung {{ curYear }}
              </th>
              <th v-if="manure" style="width: 80px;" @click="sortPlots('orgFert')">
                Org. Düngung
              </th>
              <th v-if="manure" style="width: 80px;" @click="sortPlots('orgFert')">
                N-Reduzierung
              </th>
              <th v-if="manure" style="width: 60px;" @click="sortPlots('prevCrop1')">
                Herbstdüngung
              </th>
              <th style="width: 80px;" @click="sortPlots('curGrossMargin')">
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
                <td class="narrow-cells-number">
                  {{ plot.size }}
                </td>
                <td class="narrow-cells-number">
                  {{ plot.distance }}
                </td>
                <td class="wide-cells" style="padding-left: 10px;">
                  {{ plot.prevCrop1 }}
                </td>
                <td class="narrow-cells-text">
                  <input v-model="plot.selectedOption.catchCrop" type="checkbox" style="-webkit-appearance: checkbox;" @change="saveCropChange(plot)">
                </td>
                <td class="wide-cells">
                  <select v-model="plot.selectedCrop" class="select selection" @change="saveCropChange(plot)">
                    <option v-for="(crop) in curCrops" :key="`${crop.name}_${plot._id}`" :value="crop.name">
                      {{ crop.name }}
                    </option>
                  </select>
                </td>
                <td v-if="manure" class="narrow-cells">
                  <select v-model="plot.selectedOption.manAmount" style="text-align-last: center;" class="select selection" @change="saveManureChange()">
                    <option v-for="(amount) in manAmounts" :key="`${plot._id}_${amount}`" :value="amount">
                      {{ amount }}m³
                    </option>
                  </select>
                </td>
                <td v-if="manure" class="narrow-cells">
                  <select v-model="plot.selectedOption.nReduction" style="text-align-last: center;" class="select selection" @change="saveManureChange()">
                    <option v-for="(reduction) in nReductions" :key="`${plot._id}_${reduction}`" :value="reduction">
                      {{ reduction * 100 }}%
                    </option>
                  </select>
                </td>
                <td v-if="manure" class="narrow-cells-text">
                  <input v-model="plot.selectedOption.autumnFert" type="checkbox" style="-webkit-appearance: checkbox;" @change="saveManureChange()">
                </td>
                <td class="narrow-cells-number" style="padding-right: 10px;" @click="showPlotInfo(plot)">
                  {{ format(plot.curGrossMargin) }}
                </td>
              </tr>
              <tr v-if="plot.id === selection" :key="`detail_${plot._id}`">
                <td :colspan="colspan" class="inner-table-wrapper" align="right">
                  <table class="inner-table table">
                    <thead>
                      <th />
                      <th>Ertragskorrektur</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Durchschnittsertrag</td>
                        <td style="text-align: center;">
                          {{
                            plot.selectedOption.amount
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td>Korrektur Bodenqualität</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'yieldCap', plot)">
                          {{
                            ((plot.selectedOption.yieldCap
                              * plot.selectedOption.amount)
                              - plot.selectedOption.amount).toFixed(2)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td>Korrektur Fruchtfolge</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'croppingFactor', plot)">
                          {{
                            ((plot.selectedOption.croppingFactor
                              * plot.selectedOption.amount)
                              - plot.selectedOption.amount).toFixed(2)
                          }}
                        </td>
                      </tr>
                      <tr v-if="plot.duevEndangered">
                        <td>Korrektur Rotes Gebiet</td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'yieldRed20', plot)">
                          {{
                            ((plot.selectedOption.yieldRed20
                              * plot.selectedOption.amount)
                              - plot.selectedOption.amount).toFixed(2)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold;">
                          Korrigierter Ertrag
                        </td>
                        <td style="text-align:center;font-weight: bold;">
                          {{
                            (plot.selectedOption.amount
                              * plot.selectedOption.yieldCap
                              * plot.selectedOption.croppingFactor
                              * plot.selectedOption.yieldRed20).toFixed(2)
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="table">
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
                            format(plot.selectedOption.price)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            plot.selectedOption.correctedAmount
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.selectedOption.revenue)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.selectedOption.revenue
                              * plot.selectedOption.size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Direktkosten
                        </td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'directCosts', plot)">
                          {{
                            format(plot.selectedOption.directCosts)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.selectedOption.directCosts
                              * plot.selectedOption.size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Davon Kosten Mineraldünger
                        </td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'directCosts', plot)">
                          {{
                            format(plot.selectedOption.fertCosts)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.selectedOption.fertCosts
                              * plot.selectedOption.size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Maschinenkosten
                        </td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'machineCosts', plot)">
                          {{
                            format(plot.selectedOption.variableCostsMech)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.selectedOption.variableCostsMech
                              * plot.selectedOption.size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Davon Kosten Düngeausbringung
                        </td>
                        <td style="text-align:center;" contenteditable="true" @blur="save($event,i,'machineCosts', plot)">
                          {{
                            format(plot.selectedOption.fertMachCosts)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.selectedOption.fertMachCosts
                              * plot.selectedOption.size)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Zwischenfruchtanbau
                        </td>
                        <td v-if="plot.selectedOption.catchCrop" style="text-align:center;" contenteditable="true" @blur="save($event,i,'catchCropCosts', plot)">
                          {{
                            format(plot.selectedOption.catchCropCosts / plot.size)
                          }}
                        </td>
                        <td v-else style="text-align:center;" contenteditable="true" @blur="save($event,i,'catchCropCosts', plot)">
                          {{
                            format(0)
                          }}
                        </td>
                        <td v-if="plot.selectedOption.catchCrop" style="text-align:center;">
                          {{
                            format(plot.selectedOption.catchCropCosts)
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
                        <td style="text-align:center;">
                          {{
                            format(plot.selectedOption.grossMarginHa)
                          }}
                        </td>
                        <td style="text-align:center;">
                          {{
                            format(plot.selectedOption.grossMarginHa
                              * plot.selectedOption.size)
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
                Summe Ackerbau
              </td>
              <td class="narrow-cells-number">
                {{ curTotLand }}
              </td>
              <td v-if="manure" colspan="7" />
              <td v-else colspan="4" />
              <td class="narrow-cells-number" style="font-weight: bold; padding-right: 10px;">
                {{ format(grossMarginArab) }}
              </td>
            </tr>
            <tr v-if="manure">
              <td colspan="3">
                Dungexport Frühjahr
              </td>
              <td colspan="2" />
              <td class="narrow-cells-number" colspan="4">
                {{ manExportVolSpring }}m³
              </td>
              <td class="narrow-cells-number" style="padding-right: 10px;">
                {{ format(manExportCostsSpring) }}
              </td>
            </tr>
            <tr v-if="manure">
              <td colspan="3">
                Dungexport Herbst
              </td>
              <td colspan="2" />
              <td class="narrow-cells-number" colspan="4">
                {{ manExportVolAutumn }}m³
              </td>
              <td class="narrow-cells-number" style="padding-right: 10px;">
                {{ format(manExportCostsAutumn) }}
              </td>
            </tr>
            <tr>
              <td colspan="1" style="font-weight: bold;">
                Summe
              </td>
              <td v-if="manure" colspan="8" />
              <td v-else colspan="5" />
              <td class="narrow-cells-number" style="font-weight: bold; padding-right: 10px;">
                {{ format(grossMarginCurYear) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="plots-wrapper">
          <select v-model="cropYearSwitcher" class="selection select crop-year-switcher" name="">
            <option value="selectedCrop">
              Planungsjahr
            </option>
            <option value="prevCrop1">
              Vorjahr
            </option>
          </select>
          <cropShares :shares="curShares" />
          <deviationOptimum :shares="shares" :plots="curPlots" :time="curTimeReq" :total="grossMarginCurYear" />
          <div style="width: 400px;">
            <carousel
              :perPage="1"
              :loop="true"
              :navigationEnabled="true"
              paginationColor="#e8e8e8"
            >
              <slide>
                <timeRequirement :shares="shares" :time="curTimeReq" />
              </slide>
              <slide>
                <grossMarginTimeline :plots="curPlots" />
              </slide>
              <slide v-if="manure">
                <storage :curStorage="curStorage.storage" />
              </slide>
            </carousel>
          </div>
          </carousel>
        </div>
      </div>
      <dropdown class="dropdown-container">
        <a
          class="dropdown-item"
          @click="solve(true)"
        >Erneut lösen</a>
        <hr>
        <download
          class="
            dropdown-item"
          :data="curPlots"
          :year="curYear"
        />
      </dropdown>
      <select v-model="resultMapSwitcher" class="selection select result-map-switcher " name="">
        <option value="Kulturen">
          Kulturen
        </option>
        <option value="Org. Düngung">
          Org. Düngung
        </option>
      </select>
      <resultsMap v-if="renderResultsMap" :data="curPlots" :shares="curShares" :selection="resultMapSwitcher" />
      </dropdown>
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
import { Carousel, Slide } from 'vue-carousel'
import cultures from '~/assets/js/cultures'
import notifications from '~/components/notifications'

export default {
  components: {
    Carousel,
    Slide,
    loading: () => import('~/components/loading.vue'),
    cropShares: () => import('~/components/crop_shares.vue'),
    grossMarginTimeline: () => import('~/components/gross_margin_timeline.vue'),
    timeRequirement: () => import('~/components/time_requirement.vue'),
    storage: () => import('~/components/storage.vue'),
    deviationOptimum: () => import('~/components/deviation_optimum.vue'),
    download: () => import('~/components/download.vue'),
    dropdown: () => import('~/components/dropdown.vue'),
    resultsMap: () => import('~/components/results_map.vue')
  },
  data() {
    return {
      loading: true,
      curPlots: undefined,
      curCrops: undefined,
      curStorage: undefined,
      plots: undefined,
      curYear: undefined,
      curScenario: 'Standard',
      infeasible: false,
      warnings: undefined,
      selection: undefined,
      renderResultsMap: false,
      totLand: 0,
      sortKey: '',
      cropYearSwitcher: 'selectedCrop',
      manure: undefined,
      shares: {},
      resultMapSwitcher: 'Kulturen',
      manAmounts: [0, 10, 15, 20, 25, 30, 40, 50, 60],
      nReductions: [0, 0.1, 0.2, 0.3, 0.4],
      sortOrder: 'desc',
      cropColor: {}
    }
  },
  computed: {
    curTotLand() {
      return _.round(this.totLand, 2)
    },
    manExportVolSpring() {
      let exports = 0
      if (this.curStorage && this.curStorage.exports) {
        exports += this.curStorage.exports.manure.reduce(
          (acc, ind, i) => (acc += i < 5 ? ind : 0)
        )
        exports += this.curStorage.exports.solid.reduce(
          (acc, ind, i) => (acc += i < 5 ? ind : 0)
        )
      }
      return exports
    },
    colspan() {
      if (this.manure) return 9
      else return 7
    },
    manExportCostsSpring() {
      const price = this.$store.settings.manPriceSpring
        ? this.$store.settings.manPriceSpring
        : 15
      return _.round(this.manExportVolSpring * price)
    },
    manExportVolAutumn() {
      let exports = 0
      if (this.curStorage && this.curStorage.exports) {
        exports += this.curStorage.exports.manure.reduce(
          (acc, ind, i) => (acc += i > 4 ? ind : 0)
        )
        exports += this.curStorage.exports.solid.reduce(
          (acc, ind, i) => (acc += i > 4 ? ind : 0)
        )
      }
      return exports
    },
    manExportCostsAutumn() {
      const price = this.$store.settings.manPriceAutumn
        ? this.$store.settings.manPriceAutumn
        : 15
      return _.round(this.manExportVolAutumn * price)
    },
    curTimeReq() {
      const time = this.curPlots
        .map(p => (p.selectedOption ? p.selectedOption.time : []))
        .reduce((acc, itt) => acc.map((m, i) => _.round(m + itt[i])))
      return time
    },
    curShares() {
      /*
      const colors = [
        '#018571',
        '#80cdc1',
        '#dfc27d',
        '#a6611a',
        '#BBE29D',
        '#9DD5C0',
        '#B5DCE1',
        '#D0D1D3',
        '#B5DCE1'
      ]
      */
      /*
      const cultures = {
        'Winterweizen - Brotweizen': '#79AE98',
        Kartoffeln: '#D6E5CD',
        Stärkekartoffeln: '#D6E5CD',
        Zuckerrüben: '#ECCB89',
        'Silomais (als Hauptfutter)': '#D48544',
        Winterraps: '#9B643B',
        Wintergerste: '#9DD5C0',
        Winterroggen: '#B5DCE1'
      }
      */
      const colors = [
        '#79ae98',
        '#d6e5cd',
        '#eccb89',
        '#d48544',
        '#9b643b',
        '#8db867',
        '#9dd5c0',
        '#a9dbd4',
        '#b5dce1',
        '#c3d1da',
        '#d0d1d3',
        '#daccc3',
        '#b5dce1'
      ]
      /*
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
      */
      // calculate crop shares
      const o = {}
      if (!this.curPlots) return o
      this.curPlots.forEach(plot => {
        const selectedCrop = plot[this.cropYearSwitcher] // plot.prevCrop1
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
        if (cultures[crop.name]) {
          crop.backgroundColor = cultures[crop.name]
        } else {
          crop.backgroundColor = colors[i]
        }
        return crop
      })
      return a
    },
    resultsAvailable() {
      let flag = false
      if (this.$store && this.curPlots && this.curPlots.length) {
        flag = this.curPlots.every(plot => plot.selectedOption)
      }
      return flag
    },
    grossMarginArab() {
      let sum = 0
      if (!this.curPlots) return 0
      this.curPlots.forEach(plot => {
        const name = plot.selectedCrop
        if (name && plot.selectedOption) {
          const plotData = plot.selectedOption
          sum += plotData.grossMargin
        }
      })
      return sum
    },
    grossMarginCurYear() {
      return (
        this.grossMarginArab -
        this.manExportCostsSpring -
        this.manExportCostsAutumn
      )
    }
  },
  created() {
    setTimeout(() => {
      this.update()
    }, 200)

    setTimeout(() => {
      this.renderResultsMap = true
    }, 2000)

    this.$bus.$on('changeCurrents', _.debounce(this.update, 200))
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
  },
  notifications: notifications,
  methods: {
    async solve(force) {
      this.loading = true
      try {
        // solve the model
        const { data } = await this.$axios.post(
          process.env.baseUrl + 'model/create/',
          { progress: true }
        )
        console.log(data)
        await this.storeResults(data, true)
      } catch (e) {
        console.log(e)
      }
    },
    async storeResults(data, newRun) {
      try {
        // console.log(data)
        if (data.model_status === 1 || data.model_status === 8) {
          this.warnings = data.warnings
          this.curPlots.forEach(plot => {
            // get recommendation for each plot from GAMS result
            plot.selectedOption = data.recommendation.find(
              p => p._id === plot._id
            )
            plot.recommendation = plot.selectedOption.name
            plot.curGrossMargin = plot.selectedOption.grossMargin
            plot.recommendedGrossMargin = plot.curGrossMargin
            plot.selectedCrop = plot.recommendation
            plot.recommendedCatchCrop = plot.catchCrop
          })
          const storage = this.curStorage || {
            _id: `${this.curYear}_storage`,
            type: 'storage',
            year: this.curYear,
            scenario: this.curScenario
          }
          storage.storage = data.storage
          storage.exports = data.exports
          await this.$db.put(storage)
          if (newRun) {
            this.$store.settings[
              'grossMargin' + this.curYear
            ] = this.grossMarginCurYear
            await this.$db.put(this.$store.settings)
          }
        } else {
          this.infeasible = true
          this.curPlots.forEach(plot => {
            plot.recommendation = ''
            plot.recommendedCatchCrop = false
            if (!plot.selectedCrop) {
              plot.selectedCrop = plot.prevCrop1
            }
          })
        }
        // save results in database
        await this.$db.bulkDocs(this.curPlots)
        if (!this.infeasible && (!this.warnings || !this.warnings.length)) {
          this.showSolved()
        } else if (!this.infeasible && this.warnings && this.warnings.length) {
          const warnings = this.warnings.join('\n')
          this.showWarnings({ message: warnings })
        } else {
          this.showInfeasible()
        }
      } catch (e) {
        this.showError()
        console.log(e)
      }
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
        this.totLand = 0
        this.curPlots = this.curPlots.map(plot => {
          this.totLand += plot.size
          plot.prevCrop1 = this.getName(plot.id, this.curYear - 1).name
          plot.prevCrop2 = this.getName(plot.id, this.curYear - 2).name
          plot.prevCrop3 = this.getName(plot.id, this.curYear - 3).name
          if (plot.selectedOption) {
            plot.curGrossMargin = plot.selectedOption.grossMargin
          } else {
            plot.curGrossMargin = 0
          }
          return plot
        })
      }
    },
    async save(e, i, type, plot) {
      try {
        const newValue = Number(e.target.innerText)
        const data = plot.selectedOption
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
        plot.selectedOption = data
        await this.$db.put(plot)
        this.saveSuccess()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    },
    async saveManureChange() {
      try {
        const req = this.curPlots.map(plot => {
          return {
            _id: plot._id,
            crop: plot.selectedCrop,
            manAmount: plot.selectedOption.manAmount,
            solidAmount: plot.selectedOption.solidAmount,
            nReduction: plot.selectedOption.nReduction,
            catchCrop: plot.selectedOption.catchCrop,
            autumnFert: plot.selectedOption.autumnFert
          }
        })
        console.log(req)
        const { data } = await this.$axios.post(
          process.env.baseUrl + 'model/update-manure/',
          req,
          { progress: true }
        )
        await this.storeResults(data)
        this.saveSuccess()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    },
    async saveCropChange(plot) {
      try {
        const _id = plot._id
        const crop = plot.selectedCrop
        const manAmount = plot.selectedOption.manAmount
        const solidAmount = plot.selectedOption.solidAmount
        const nReduction = plot.selectedOption.nReduction
        const catchCrop = plot.selectedOption.catchCrop
        const autumnFert = plot.selectedOption.autumnFert

        const doc = await this.$db.get(_id)
        // get new data from server
        const { data } = await this.$axios.post(
          process.env.baseUrl + 'model/update/',
          {
            _id,
            crop,
            manAmount,
            solidAmount,
            nReduction,
            catchCrop,
            autumnFert
          },
          { progress: true }
        )
        doc.selectedCrop = plot.selectedCrop
        doc.catchCrop = plot.selectedOption.catchCrop
        doc.selectedOption = data
        doc.curGrossMargin = data.grossMargin
        await this.$db.put(doc)
        this.saveSuccess()
      } catch (e) {
        this.showError()
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
    showPlotInfo(plot) {
      // console.log(plot)
      if (this.selection === plot.id) {
        this.selection = ''
      } else {
        this.selection = plot.id
      }
    },
    async update() {
      this.loading = true
      const store = this.$store
      // console.log('update')
      if (store) {
        this.$set(this, 'curPlots', store.curPlots)
        this.$set(this, 'curCrops', store.curCrops)
        this.$set(this, 'manure', store.curManure)
        this.$set(this, 'curStorage', store.curStorage)
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
        // console.log(this.manure)
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
  /* width: calc(100vw - 200px); */
  min-width: 1024px;
  display: flex;
  justify-content: space-around;
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
  max-width: 60vw;
  min-width: 620px;
  table-layout: fixed;
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

.align-dot {
  text-align: '.' center;
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

.excel-download {
  margin-top: 40px;
  text-align: center;
}

.VueCarousel-navigation-prev {
  background-image: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
  width: 24px;
  height: 24px;
  font-size: 0px;
  margin-right: -8px;
  transform-origin: left top;
  transform: translate(0%, -50%) rotate(90deg) !important;
}
.VueCarousel-navigation-next {
  background-image: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
  width: 24px;
  height: 24px;
  font-size: 0px;
  margin-right: -8px;
  transform-origin: left top;
  transform: translate(100%, 60%) rotate(-90deg) !important;
}

.VueCarousel-dot-container {
  margin-top: 0px !important;
}

.result-map-switcher {
  margin-top: 50px;
  width: 175px;
  margin-left: 25px;
  font-size: 18px;
  margin-bottom: 10px;
}

.crop-year-switcher {
  margin-top: 50px;
  width: 175px;
  margin-left: 25px;
  font-size: 18px;
  margin-bottom: 10px;
}
@media (max-width: 1250px) {
  .plot-selection {
    width: 125px;
  }
}
@media (min-width: 1251px) {
  .plot-selection {
    width: 150px;
  }
}
</style>
