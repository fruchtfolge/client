<template>
  <div class="">
    <loading v-if="loading" />
    <div v-else-if="resultsAvailable">
      <div id="result-wrapper" class="result-wrapper">
        <table class="table result-table">
          <thead>
            <tr>
              <th style="min-width: 80px; text-align: left;" @click="sortPlots('name')">
                {{ sortKey === "name" ? sortIndicator : "" }}Name
              </th>
              <th style="width: 50px; text-align: right;" @click="sortPlots('size')">
                {{ sortKey === "size" ? sortIndicator : "" }}Größe [ha]
              </th>
              <th style="width: 55px; text-align: right;" @click="sortPlots('distance')">
                {{ sortKey === "distance" ? sortIndicator : "" }}Distanz [km]
              </th>
              <th style="min-width: 50px; text-align: left;" @click="sortPlots('prevCrop1')">
                {{ sortKey === "prevCrop1" ? sortIndicator : "" }}{{ curYear - 1 }}
              </th>
              <th style="width: 40px;" @click="sortPlots('selectedOption.catchCrop')">
                {{ sortKey === "selectedOption.catchCrop" ? sortIndicator : "" }}Planung ZF
              </th>
              <th style="text-align: left;" class="plot-selection" @click="sortPlots('selectedCrop')">
                {{ sortKey === "selectedCrop" ? sortIndicator : "" }}Planung {{ curYear }}
              </th>
              <th v-if="hasManure" style="width: 50px; text-align: left;" @click="sortPlots('orgFert')">
                {{ sortKey === "orgFert" ? sortIndicator : "" }}Gülle
              </th>
              <th v-if="hasSolid" style="width: 50px; text-align: left;" @click="sortPlots('orgFert')">
                {{ sortKey === "orgFert" ? sortIndicator : "" }}Festmist
              </th>
              <th v-if="curManure && hasPlotsRedArea" style="width: 80px; text-align: right;" @click="sortPlots('nReduction')">
                {{ sortKey === "nReduction" ? sortIndicator : "" }}N-Reduzierung
              </th>
              <th v-if="curManure" style="width: 50px;" @click="sortPlots('selectedOption.autumnFert')">
                {{ sortKey === "selectedOption.autumnFert" ? sortIndicator : "" }}Herbst-düng-ung
              </th>
              <th style="width: 80px; text-align: right;" @click="sortPlots('curGrossMargin')">
                {{ sortKey === "curGrossMargin" ? sortIndicator : "" }}Deckungs-beitrag
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(plot,i) in curPlots">
              <tr :key="`data_${plot._id}`">
                <td class="wide-cells">
                  {{ plot.name }}
                </td>
                <td class="value-cell narrow-cells-number">
                  {{ plot.size.toFixed(1) }}
                </td>
                <td class="value-cell narrow-cells-number">
                  {{ plot.distance.toFixed(1) }}
                </td>
                <td class="wide-cells" style="padding-left: 10px;">
                  {{ plot.prevCrop1 }}
                </td>
                <td style="border-right: 1px solid #f5f5f5;" class="editable narrow-cells-text">
                  <input v-model="plot.selectedOption.catchCrop" type="checkbox" style="-webkit-appearance: checkbox;" @change="saveCropChange(plot)">
                </td>
                <td style="border-right: 1px solid #f5f5f5;" class="editable wide-cells">
                  <select v-model="plot.selectedCrop" class="select selection" @change="saveCropChange(plot)">
                    <option v-for="(crop) in curCrops" :key="`${crop._id}_${plot._id}`" :value="crop.name">
                      {{ crop.name }}
                    </option>
                  </select>
                </td>
                <td v-if="hasManure" style="border-right: 1px solid #f5f5f5;" class="editable narrow-cells">
                  <select v-model="plot.selectedOption.manAmount" style="text-align-last: center; font-family: 'IBM Plex Mono', monospace; font-weight: 400;" class="select selection" @change="saveManureChange()">
                    <option v-for="(amount) in manAmounts" :key="`${plot._id}_${amount}`" :value="amount">
                      {{ amount }}m³
                    </option>
                  </select>
                </td>
                <td v-if="hasSolid" style="border-right: 1px solid #f5f5f5;" class="editable narrow-cells">
                  <select v-model="plot.selectedOption.solidAmount" style="text-align-last: center; font-family: 'IBM Plex Mono', monospace; font-weight: 400;" class="select selection" @change="saveManureChange()">
                    <option v-for="(amount) in solidAmounts" :key="`${plot._id}_solid_${amount}`" :value="amount">
                      {{ amount }}m³
                    </option>
                  </select>
                </td>
                <td v-if="curManure && hasPlotsRedArea" style="border-right: 1px solid #f5f5f5;" class="editable narrow-cells">
                  <select v-if="plot.duevEndangered" v-model="plot.selectedOption.nReduction" style="text-align-last: center; font-family: 'IBM Plex Mono', monospace; font-weight: 400;" class="select selection" @change="saveManureChange()">
                    <option v-for="(reduction) in nReductions" :key="`${plot._id}_${reduction}`" :value="reduction">
                      {{ reduction * 100 }}%
                    </option>
                  </select>
                  <select v-else style="text-align-last: center;" class="select selection" title="N-Reduzierung nur bei Flächen im roten Gebiet möglich">
                    <option>
                      0%
                    </option>
                  </select>
                </td>
                <td v-if="curManure" style="border-right: 1px solid #f5f5f5;" class="editable narrow-cells-text">
                  <input v-model="plot.selectedOption.autumnFert" type="checkbox" style="-webkit-appearance: checkbox;" @change="saveManureChange()">
                </td>
                <td class="narrow-cells-number menu-indicator" :class="{'menu-indicator-hover': plot.id !== selection}" style="padding-right: 10px;" @click="showPlotInfo(plot)">
                  {{ plot.id === selection ? "↑ " : "" }}{{ format(plot.curGrossMargin) }}
                </td>
              </tr>
              <tr v-if="plot.id === selection" style="background-color: white;" :key="`detail_${plot._id}`">
                <td :colspan="colspan" class="inner-table-wrapper" align="right">
                  <table class="inner-table table">
                    <thead>
                      <th colspan="2" style="text-align: right; padding-right: 5px;">Ertragskorrektur [t/ha]</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Durchschnittsertrag</td>
                        <td style="text-align: right;" class="value-cell">
                          {{
                            plot.selectedOption.amount
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td>Korrektur Bodenqualität</td>
                        <td style="text-align:right;" class="editable" contenteditable="true" @blur="save($event,i,'yieldCap', plot)">
                          {{
                            ((plot.selectedOption.yieldCap
                              * plot.selectedOption.amount)
                              - plot.selectedOption.amount).toFixed(2)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td>Korrektur Fruchtfolge</td>
                        <td style="text-align:right;" contenteditable="true" class="editable" @blur="save($event,i,'croppingFactor', plot)">
                          {{
                            ((plot.selectedOption.croppingFactor
                              * plot.selectedOption.amount)
                              - plot.selectedOption.amount).toFixed(2)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td>Korrektur Düngereduzierung (nach DüV)</td>
                        <td style="text-align:right;" class="editable" contenteditable="true" @blur="save($event,i,'nYieldRed', plot)">
                          {{
                            ((plot.selectedOption.nYieldRed
                              * plot.selectedOption.amount)
                              - plot.selectedOption.amount).toFixed(2)
                          }}
                        </td>
                      </tr>
                      <tr style="font-weight: 600;" class="highlightRow">
                        <td>
                          Korrigierter Ertrag
                        </td>
                        <td style="text-align:right;font-weight: bold;" class="value-cell">
                          {{
                            plot.selectedOption.correctedAmount ? (plot.selectedOption.correctedAmount).toFixed(2) : 0
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="table inner-table-gm" style="background: #f9f9f9;">
                    <thead>
                      <th />
                      <th style="text-align: right; padding-right: 5px;">Preis [€/ha]</th>
                      <th style="text-align: right; padding-right: 5px;">Menge [t/ha]</th>
                      <th style="text-align: right; padding-right: 5px;">Summe [€/ha]</th>
                      <th style="text-align: right; padding-right: 5px;">Summe</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Leistungen</td>
                        <td style="text-align:right;" class="editable" contenteditable="true" @blur="save($event,i,'price', plot)">
                          {{
                            plot.selectedOption.price.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            plot.selectedOption.correctedAmount.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            plot.selectedOption.revenue.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            (plot.selectedOption.revenue
                              * plot.selectedOption.size).toFixed(1)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Direktkosten
                        </td>
                        <td style="text-align:right;" class="editable" contenteditable="true" @blur="save($event,i,'directCosts', plot)">
                          {{
                            plot.selectedOption.directCosts.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            (plot.selectedOption.directCosts
                              * plot.selectedOption.size).toFixed(1)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Davon Kosten Mineraldünger
                        </td>
                        <td style="text-align:right;" class="editable" contenteditable="true" @blur="save($event,i,'directCosts', plot)">
                          {{
                            plot.selectedOption.fertCosts.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            (plot.selectedOption.fertCosts
                              * plot.selectedOption.size).toFixed(1)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Maschinenkosten
                        </td>
                        <td style="text-align:right;" class="editable" contenteditable="true" @blur="save($event,i,'machineCosts', plot)">
                          {{
                            plot.selectedOption.variableCostsMech.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            (plot.selectedOption.variableCostsMech
                              * plot.selectedOption.size).toFixed(1)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Davon Kosten Düngeausbringung
                        </td>
                        <td style="text-align:right;" class="editable"  contenteditable="true" @blur="save($event,i,'machineCosts', plot)">
                          {{
                            plot.selectedOption.fertMachCosts.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            (plot.selectedOption.fertMachCosts
                              * plot.selectedOption.size).toFixed(1)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          Zwischenfruchtanbau
                        </td>
                        <td style="text-align:right;" class="editable" contenteditable="true" @blur="save($event,i,'catchCropCosts', plot)">
                          {{
                            plot.selectedOption.catchCropCosts.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            (plot.selectedOption.catchCropCosts * plot.size).toFixed(1)
                          }}
                        </td>
                      </tr>
                      <tr style="font-weight: 600;" class="highlightRow">
                        <td colspan="3">
                          Deckungsbeitrag
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            plot.selectedOption.grossMarginHa.toFixed(1)
                          }}
                        </td>
                        <td style="text-align:right;" class="value-cell">
                          {{
                            (plot.selectedOption.grossMarginHa
                              * plot.selectedOption.size).toFixed(1)
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>
            <tr class="highlightRow">
              <td colspan="1">
                Summe Ackerbau
              </td>
              <td class="value-cell narrow-cells-number">
                {{ curTotLand }}
              </td>
              <td :colspan="colspan - 3" />
              <td class="value-cell narrow-cells-number" style="padding-right: 10px;">
                {{ format(grossMarginArab) }}
              </td>
            </tr>
            <tr v-if="hasManure">
              <td :colspan="colspan - 5">
                Gülleexport Frühjahr
              </td>
              <td class="value-cell narrow-cells-number" colspan="4">
                {{ manExportVolSpring }}m³
              </td>
              <td class="value-cell narrow-cells-number" style="padding-right: 10px;">
                {{ format(manExportCostsSpring) }}
              </td>
            </tr>
            <tr v-if="hasManure">
              <td :colspan="colspan - 5">
                Gülleexport Herbst
              </td>
              <td class="value-cell narrow-cells-number" colspan="4">
                {{ manExportVolAutumn }}m³
              </td>
              <td class="value-cell narrow-cells-number" style="padding-right: 10px;">
                {{ format(manExportCostsAutumn) }}
              </td>
            </tr>
            <tr v-if="hasSolid">
              <td :colspan="colspan - 5">
                Festmistexport Frühjahr
              </td>
              <td class="value-cell narrow-cells-number" colspan="4">
                {{ solidExportVolSpring }}m³
              </td>
              <td class="value-cell narrow-cells-number" style="padding-right: 10px;">
                {{ format(solidExportCostsSpring) }}
              </td>
            </tr>
            <tr v-if="hasSolid">
              <td :colspan="colspan - 5">
                Festmistexport Herbst
              </td>
              <td class="value-cell narrow-cells-number" colspan="4">
                {{ solidExportVolAutumn }}m³
              </td>
              <td class="value-cell narrow-cells-number" style="padding-right: 10px;">
                {{ format(solidExportCostsAutumn) }}
              </td>
            </tr>
            <tr class="highlightRow" style="font-weight: 600;">
              <td colspan="1" style="font-weight: bold;">
                Summe
              </td>
              <td :colspan="colspan - 2" />
              <td class="value-cell narrow-cells-number" style="font-weight: bold; padding-right: 10px; ">
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
              <slide v-if="curManure">
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
          :gmArab="grossMarginArab"
          :costsManureSpring="manExportCostsSpring"
          :costsManureAutumn="manExportCostsAutumn"
          :volManureSpring="manExportVolSpring"
          :volManureAutumn="manExportVolAutumn"
          :gmTotal="grossMarginCurYear"
          :curShares="curShares"
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
import { sanitizeInput } from '~/components/helpers'

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
      curManure: undefined,
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
      shares: {},
      resultMapSwitcher: 'Kulturen',
      solidAmounts: [0, 5, 10, 12, 15, 20],
      manAmounts: [0, 10, 15, 20, 25, 30, 40, 50, 60],
      nReductions: [0, 0.1, 0.2, 0.3, 0.4],
      sortOrder: 'desc',
      cropColor: {}
    }
  },
  computed: {
    sortIndicator() {
      return this.sortOrder === 'desc' ? "↓" : "↑"
    },
    curTotLand() {
      return _.round(this.totLand, 2)
    },
    hasPlotsRedArea() {
      let flag = false
      if (this.curPlots && this.curPlots.length) {
        flag = this.curPlots.some(plot => plot.duevEndangered)
      }
      return flag
    },
    colspan() {
      let columns = 7
      if (this.hasManure && this.hasSolid) columns += 3
      else if (this.hasManure || this.hasSolid) columns += 2
      if (this.hasPlotsRedArea) columns += 1
      return columns
    },
    hasManure() {
      let flag = false
      if (this.curManure) {
        this.curManure.forEach(m => {
          if (m.manType.includes('Gülle') || m.manType.includes('Jauche'))
            flag = true
        })
      }
      return flag
    },
    hasSolid() {
      let flag = false
      if (this.curManure) {
        this.curManure.forEach(m => {
          if (m.manType.includes('Festmist')) flag = true
        })
      }
      return flag
    },
    manExportVolSpring() {
      let exports = 0
      if (this.curStorage && this.curStorage.exports) {
        exports += this.curStorage.exports.manure.reduce(
          (acc, ind, i) => (acc += i < 5 ? ind : 0)
        )
      }
      return exports
    },
    manExportCostsSpring() {
      const price = this.$store.settings.manPriceSpring
        ? this.$store.settings.manPriceSpring
        : 15
      return _.round(this.manExportVolSpring * price)
    },
    solidExportVolSpring() {
      let exports = 0
      if (this.curStorage && this.curStorage.exports) {
        exports += this.curStorage.exports.solid.reduce(
          (acc, ind, i) => (acc += i < 5 ? ind : 0)
        )
      }
      return exports
    },
    solidExportCostsSpring() {
      const price = this.$store.settings.solidPriceSpring
        ? this.$store.settings.solidPriceSpring
        : 15
      return _.round(this.solidExportVolSpring * price)
    },
    manExportVolAutumn() {
      let exports = 0
      if (this.curStorage && this.curStorage.exports) {
        exports += this.curStorage.exports.manure.reduce(
          (acc, ind, i) => (acc += i > 4 ? ind : 0)
        )
      }
      return exports
    },
    solidExportVolAutumn() {
      let exports = 0
      if (this.curStorage && this.curStorage.exports) {
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
    solidExportCostsAutumn() {
      const price = this.$store.settings.solidPriceAutumn
        ? this.$store.settings.solidPriceAutumn
        : 15
      return _.round(this.solidExportVolAutumn * price)
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
      if (this.$store && this.curPlots && this.curPlots.length && this.curCrops && this.curCrops.length) {
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
        this.manExportCostsAutumn -
        this.solidExportCostsSpring -
        this.solidExportCostsAutumn
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
        this.showInfeasible()
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
        const newValue = sanitizeInput(e.target.innerText)
        const data = plot.selectedOption
        const amount = data.amount
        console.log(newValue,data,amount)
        if (type === 'yieldCap' || type === 'croppingFactor') {
          data[type] = (newValue + amount) / amount
        } else {
          data[type] = newValue
        }
        // recalculate gross margin
        const price = data.price
        const directCosts = data.directCosts
        const variableCosts = data.variableCosts
        const distanceCosts = data.distanceCosts || 0
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
        console.log(data.grossMargin, revenue, directCosts, variableCosts, distanceCosts)
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
            crop: this.curCrops.find(c => plot.selectedCrop === c.name)._id,
            manAmount: plot.selectedOption.manAmount,
            solidAmount: plot.selectedOption.solidAmount,
            nReduction: plot.selectedOption.nReduction,
            catchCrop: plot.selectedOption.catchCrop,
            autumnFert: plot.selectedOption.autumnFert
          }
        })

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
        const crop = this.curCrops.find(c => plot.selectedCrop === c.name)._id
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
        this.$set(this, 'curManure', store.curManure)
        this.$set(this, 'curStorage', store.curStorage)
        this.$set(this, 'curYear', store.curYear)
        this.$set(this, 'curScenario', store.curScenario)
        if (
          this.curPlots &&
          this.curPlots.length &&
          store.curCrops &&
          store.curCrops.length &&
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
        // console.log(this.curManure)
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
<style scoped>
.loading {
  top: 480px;
}

.menu-indicator {
  background-color: white;
  cursor: pointer;
}

.menu-indicator-hover:hover:before {
  content: "↓";
}


.selection {
  font-size: 12px;
}
.result-wrapper {
  /* width: calc(100vw - 200px); */
  /* min-width: 1024px; */
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.plots-wrapper {
  /* width: 100%; */
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.result-table {
  /* float: left; */
  /* margin: 0; */
  margin-top: 20px;
  /* margin-left: 20px; */
  max-width: 60vw;
  min-width: 580px;
  table-layout: fixed;
  font-size: 12px;
}

.result-table th {
  height: 60px;
  hyphens: auto;
  color: white;
  font-size: 13px;
}

.result-table thead th {
  padding-left: 10px;
  padding-right: 5px;
  cursor: ns-resize;
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
  min-width: 300px;
  max-width: 0px;
  background: #f9f9f9;
}

.inner-table td {
  padding-right: 5px;
}

.inner-table th {
  height: 25px;
}

.inner-table-gm td {
  padding-right: 5px;
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
@media (min-width: 1451px) {
  .plot-selection {
    width: 175px;
  }
}
</style>
