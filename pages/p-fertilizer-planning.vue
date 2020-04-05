<template>
  <div>
    <div v-if="dataAvail" class="plotOverview">
      <table class="table-fert table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Kultur</th>
            <th>Ertragsniveau 3 Jahr Ø Betrieb [dt/ha]</th>
            <th>Erntereste abgefahren</th>
            <th>P<sub>2</sub>O<sub>5</sub> Gehalt im Boden</th>
            <th>Bodenart</th>
            <th>Gehaltsklasse P<sub>2</sub>O<sub>5</sub></th>
            <th>Faktorempfehlung [/]</th>
            <th>P<sub>2</sub>O<sub>5</sub> Entzug kg / ha</th>
            <th>P<sub>2</sub>O<sub>5</sub> Empfehlung kg / ha</th>
            <th>Planung Org. Düngung [kg P/ha]</th>
            <th>Planung Min. Düngung [kg P/ha]</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot, i) in filteredPlots" :key="i">
            <td style="width: 100px;" class="cell-text">
              {{ plot.name }}
            </td>
            <td style="width: 100px;" class="cell-text">
              {{ plot.selectedCrop }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.avgYield }}
            </td>
            <td style="text-align: center;">
              <input v-model="plot.selectedOption.pHarvestLeft" type="checkbox" name="" value="">
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.p2o5Soil }}
            </td>
            <td class="cell-text" style="padding-left: 10px;">
              {{ plot.soilType }}
            </td>
            <td class="cell-number">
              {{ plot.pSupplyStage || 'C' }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.p2o5Factor }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.pReq }}
            </td>
            <td class="cell-number" style="font-weight: bold;">
              {{ plot.selectedOption.pSum }}
            </td>
            <td class="cell-number">
              {{ orgP(plot) }}
            </td>
            <td class="cell-number" style="padding-right: 10px;">
              {{ minP(plot) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else style="text-align: center; margin-top: 100px;">
      <h3>Noch keine Schläge für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
      <h3>
        Sie können neue Schläge auf der Seite 'Karte' einzeichnen.
        <br>
        Alternativ können Sie Daten aus dem vorherigen Anbaujahr importieren.
      </h3>
      <button @click="$nuxt.$router.replace({path: 'maps'})">
        ZUR KARTE
      </button>
      <button style="margin-left: 20px;" @click="importPrev">
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
      waiting: false
    }
  },
  computed: {
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
      this.waiting = true
      this.$bus.$emit('importPrevYear')
    },
    orgP(plot) {
      if (plot.selectedOption) {
        return _.round(plot.selectedOption.orgPAmount)
      }
      return 0
    },
    minP(plot) {
      if (plot.selectedOption) {
        return _.round(plot.selectedOption.minPAmount)
      }
      return 0
    }
  }
}
</script>

<style>
.plotOverview table input {
  -webkit-appearance: checkbox;
}
.table-fert {
  table-layout: fixed;
  min-width: 800px;
  max-width: 1024px;
}
.table-fert th {
  padding-left: 2px;
  padding-right: 2px;
}
.cell-text {
  text-align: left;
}
.cell-number {
  text-align: right;
}
</style>
