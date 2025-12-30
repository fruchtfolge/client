<template>
  <div>
    <div v-if="dataAvail" class="plotOverview">
      <div class="plotOverview-wrapper">
        <div v-if="arablePlots && arablePlots.length">
          <caption class="caption">
            Düngebedarfsermittlung Ackerland
          </caption>
          <div class="plotOverview-controls noprint">
            <input class="input search-plots" type="text" placeholder="Suche..." v-model="searchStringArab">
          </div>
          <table class="table-fert table">
            <thead>
              <tr>
                <th rowspan="2" style="text-align: left; width: 120px;">
                  Name
                </th>
                <th rowspan="2" style="text-align: left; width: 120px;">
                  Kultur
                </th>
                <th rowspan="2" style="text-align: right;">
                  Ertragsniveau 5 Jahre Ø Betrieb [dt/ha]
                </th>
                <th rowspan="2" style="text-align: right;">
                  N-Bedarfswert [kg N/ha]
                </th>
                <th v-show="showDetails" colspan="5" style="text-align: center;" @click="showDetails = !showDetails">
                  Zu- oder Abschläge [kg N/ha]
                </th>
                <th v-show="!showDetails" rowspan="2" style="text-align: right;" @click="showDetails = !showDetails">
                  Summe Zu- oder Abschläge [kg N/ha]
                </th>
                <th rowspan="2" style="text-align: right;">
                  N-Düngebedarf [kg N/ha]
                </th>
                <th v-if="hasPlotsRedArea" rowspan="2" style="text-align: right;">
                  N-Reduktion im roten Gebiet
                </th>
                <th v-if="hasPlotsRedArea" rowspan="2" style="text-align: right;">
                  N-Düngebedarf abzgl. Reduktion [kg N/ha]
                </th>
                <!--
                <th colspan="2" style="text-align: center;">
                  Planung [kg N/ha]
                </th>
                -->
              </tr>
              <tr>
                <th v-show="showDetails" style="text-align: right;">Ertrags-differenz</th>
                <th v-show="showDetails" style="text-align: right;">Nmin-Probe / Richtwert</th>
                <th v-show="showDetails" style="text-align: right;">Humus-gehalt</th>
                <th v-show="showDetails" style="text-align: right;">Org. Düngung der Vorjahre</th>
                <th v-show="showDetails" style="text-align: right;">Vorfrucht / ZF</th>
                <!--
                <th>
                  Org. Düngung
                </th>
                <th>
                  Min. Düngung
                </th>
                -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="(plot, i) in arablePlots" :key="i">
                <td style="width: 120px;" class="cell-text">
                  {{ plot.name }}
                </td>
                <td style="width: 120px;" class="cell-text">
                  {{ plot.selectedCrop }}
                </td>
                <td class="value-cell cell-number">
                  {{ plot.selectedOption.avgYield }}
                </td>
                <td class="value-cell cell-number">
                  {{ plot.selectedOption.nReq }}
                </td>
                <td v-show="showDetails" class="value-cell cell-number">
                  {{ plot.selectedOption.nYieldDiff }}
                </td>
                <td v-show="showDetails" class="value-cell cell-number">
                  {{ plot.selectedOption.nMinDiff }}
                </td>
                <td v-show="showDetails" class="value-cell cell-number">
                  {{ plot.selectedOption.humusContent }}
                </td>
                <td v-show="showDetails" class="value-cell cell-number">
                  {{ plot.selectedOption.nFertPrevYear }}
                </td>
                <td v-show="showDetails" class="value-cell cell-number">
                  {{ plot.selectedOption.nPrevCrop }}
                </td>
                <td v-show="!showDetails" class="value-cell cell-number">
                  {{ reductionOrAddition[i] }}
                </td>
                <td class="value-cell cell-number" style="font-weight: bold; padding-right: 10px;">
                  {{ plot.selectedOption.nSum  }}
                </td>
                <td v-if="hasPlotsRedArea" class="value-cell cell-number">
                  {{ plot.selectedOption.nReduction }}%
                </td>
                <td v-if="hasPlotsRedArea" class="value-cell cell-number" style="font-weight: bold; ">
                  {{ plot.selectedOption.reducedNSum || plot.selectedOption.nSum }}
                </td>
                <!--
                <td class="value-cell cell-number">
                  {{ orgN(plot) }}
                </td>
                <td class="value-cell cell-number" style="padding-right: 10px;">
                  {{ minN(plot) }}
                </td>
                -->
              </tr>
              <tr>
                <td colspan="2"><b>Summe (kg N/ha)</b></td>
                <td :colspan="`${showDetails ? 7 : 3}`"></td>
                <td class="value-cell cell-number" style="padding-right: 10px;"><b>{{ totalNSum }}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="greenlandPlots && greenlandPlots.length" style="margin-top: 40px;">
          <caption class="caption">
            Düngebedarfsermittlung Grünland und Feldfutter
          </caption>
          <div class="plotOverview-controls">
            <input class="input search-plots" type="text" placeholder="Suche..." v-model="searchStringGreen">
          </div>
          <table class="table-fert table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kultur</th>
                <th>Ertragsniveau 5 Jahr Ø Betrieb [dt TM/ha]</th>
                <th>Ertragsniveau RP 5 Jahr Ø Betrieb [% RP i.d. TM]</th>
                <th>N-Bedarfswert [kg N/ha]</th>
                <th>Zu- oder Abschlag Ertragsdifferenz [kg N/ha]</th>
                <th>Zu- oder Abschlag RP Differenz [kg N/ha]</th>
                <th>Abschlag org. Düngung der Vorjahre [kg N/ha]</th>
                <th>Abschlag N aus Bodenvorrat [kg N/ha]</th>
                <th>Abschlag N-Bindung Leguminosen [kg N/ha]</th>
                <th>Stickstoffdüngebedarf Vegetation [kg N/ha]</th>
                <th>Planung Org. Düngung [kg N/ha]</th>
                <th>Planung Min. Düngung [kg N/ha]</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(plot, i) in greenlandPlots" :key="i">
                <td style="width: 100px;" class="cell-text">
                  {{ plot.name }}
                </td>
                <td style="width: 100px;" class="cell-text">
                  {{ plot.selectedCrop }}
                </td>
                <td class="cell-number">
                  {{ plot.selectedOption.avgYield }}
                </td>
                <td class="cell-number">
                  {{ plot.selectedOption.avgRPperc }}
                </td>
                <td class="cell-number">
                  {{ plot.selectedOption.nReq }}
                </td>
                <td class="cell-number">
                  {{ plot.selectedOption.nYieldDiff }}
                </td>
                <td class="cell-number">
                  {{ plot.selectedOption.nRPDiff }}
                </td>
                <td class="cell-number">
                  {{ plot.selectedOption.nFertPrevYear }}
                </td>
                <td class="cell-number">
                  {{ plot.selectedOption.humusContent }}
                </td>
                <td class="cell-number">
                  {{ plot.selectedOption.nLegumeRed }}
                </td>
                <td class="cell-number" style="font-weight: bold; padding-right: 10px;">
                  {{ plot.selectedOption.nSum }}
                </td>
                <!--
                <td class="cell-number">
                  {{ orgN(plot) }}
                </td>
                <td class="cell-number" style="padding-right: 10px;">
                  {{ minN(plot) }}
                </td>
                -->
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
    <div v-if="!dataAvail && plotsAvail" style="text-align: center; margin-top: 100px;">
      <h3>
        Es wurde noch keine Anbauplanung für das Planungsjahr {{ curYear }} angelegt.
        <br><br>Klicken Sie auf den Link 'Anbauplanung' um loszulegen.
      </h3>
      <br>
      <button class="button" @click="$nuxt.$router.push({path: 'results'})">
        NEUE PLANUNG
      </button>
    </div>
    <div v-if="!dataAvail && !plotsAvail" style="text-align: center; margin-top: 100px;">
      <h3>Noch keine Schläge für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
      <h3>
        Sie können neue Schläge auf der Seite 'Karte' einzeichnen.
        <br>
        Alternativ können Sie Daten aus dem vorherigen Anbaujahr importieren.
      </h3>
      <button class="button" @click="$nuxt.$router.push({path: 'maps'})">
        ZUR KARTE
      </button>
      <button class="button" style="margin-left: 20px;" @click="importPrev">
        IMPORTIEREN
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      plots: null,
      crops: null,
      curYear: 2019,
      showDetails: false,
      searchStringArab: "",
      searchStringGreen: "",
      greenLandCropCodes: [
        459,
        421,
        422,
        423,
        424,
        425,
        426,
        427,
        429,
        430,
        431,
        432,
        433
      ],
      waiting: false
    }
  },
  computed: {
    plotsAvail() {
      if (this.plots && this.plots.length) return true
      return false
    },
    reductionOrAddition() {
      return this.arablePlots.map(plot => _.round((plot.selectedOption.nYieldDiff || 0) +
        (plot.selectedOption.nMinDiff || 0) +
        (plot.selectedOption.humusContent || 0) +
        (plot.selectedOption.nFertPrevYear || 0) +
        (plot.selectedOption.nPrevCrop || 0)
      ,1))
    },
    dataAvail() {
      let bool = true
      if (this.plots && this.plots.length) {
        this.plots.forEach(p => {
          if (!p.selectedOption) {
            bool = false
          }
        })
      } else {
        bool = false
      }
      return bool
    },
    filteredPlots() {
      const filtered = this.plots.filter(p => p.selectedOption.nReq)
      return filtered
    },
    greenlandPlots() {
      return this.filteredPlots.filter(
        p => this.greenLandCropCodes.indexOf(p.selectedOption.code) > -1 &&
          p.name.toLowerCase().includes(this.searchStringGreen.toLowerCase())
      )
    },
    arablePlots() {
      return this.filteredPlots.filter(
        p => this.greenLandCropCodes.indexOf(p.selectedOption.code) === -1 &&
          p.name.toLowerCase().includes(this.searchStringArab.toLowerCase())
      )
    },
    totalNSum() {
      return _.round(_.sum(this.plots.map(p => p.selectedOption.nSum)),2)
    },
    hasPlotsRedArea() {
      let flag = false
      if (this.curPlots && this.curPlots.length) {
        flag = this.curPlots.some(plot => plot.duevEndangered)
      }
      return flag
    }
  },
  created() {
    this.update()
    this.$bus.$on('changeCurrents', _.debounce(this.update, 200))
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
  },
  methods: {
    update() {
      this.$set(this, 'plots', this.$store.curPlots)
      this.$set(this, 'crops', this.$store.curCrops)
      this.$set(this, 'curYear', this.$store.curYear)
    },
    importPrev() {
      if (!this.waiting) this.$bus.$emit('importPrevYear')
      this.waiting = true
    },
    orgN(plot) {
      if (plot.selectedOption) {
        return _.round(plot.selectedOption.orgNAmount)
      }
      return 0
    },
    minN(plot) {
      if (plot.selectedOption) {
        return _.round(plot.selectedOption.minNAmount)
      }
      return 0
    }
  }
}
</script>

<style scoped>

.caption {
  text-align: center;
  width: 100%;
  display: block;
  line-height: 30px;
  font-weight: 300;
  font-size: 14px;
  margin-bottom: 10px;
}

.search-plots {
  box-sizing: border-box;
  border: 1px solid #ececec;
  font-size: 16px;
  height: 36px;
  margin-right: 5px;
  width: 100%;
}

.plotOverview {
  overflow-x: scroll;
}
.plotOverview-wrapper {
  /* float: left; */
  margin: auto;
  margin-top: 20px;
  max-width: 960px;
  min-width: 768px;
}

.plotOverview-controls {
  margin-bottom: 10px;
}

.plotOverview table input {
  -webkit-appearance: checkbox;
}

.table-fert {
  table-layout: fixed;
  margin: unset;
  width: unset;
  margin-top: 10px;
  max-width: 960px;
  min-width: 100%;
  /*
  width: 800px;
  min-width: 800px;
  max-width: 1100px;
  margin: 20px auto 0px auto;
  */
  font-size: 12px;
}

.table-fert th {
  font-size: 10px;
  padding-left: 2px;
  padding-right: 2px;
  padding-left: 10px;
  padding-right: 10px;
}

.cell-text {
  text-align: left;
}

.cell-number {
  text-align: right;
}
</style>
