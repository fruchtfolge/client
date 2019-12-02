<template>
  <div>
    <div v-if="dataAvail" class="plotOverview">
      <table class="table-fert table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Kultur</th>
            <th>Ertragsniveau 3 Jahr Ø Betrieb [dt/ha]</th>
            <th>N-Bedarfswert [kg N/ha]</th>
            <th>Zu- oder Abschlag Ertragsdifferenz [kg N/ha]</th>
            <th>Abschlag Nmin-Probe/Richtwert [kg N/ha]</th>
            <th>Abschlag Standort / Humus [kg N/ha]</th>
            <th>Abschlag org. Düngung der Vorjahre [kg N/ha]</th>
            <th>Abschlag Vorfrucht / ZF [kg N/ha]</th>
            <th>Stickstoffdüngebedarf Vegetation [kg N/ha]</th>
            <th>Planung Org. Düngung [kg N/ha]</th>
            <th>Planung Min. Düngung [kg N/ha]</th>
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
            <td class="cell-number">
              {{ plot.selectedOption.nReq }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nYieldDiff }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nMinDiff }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.humusContent }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nFertPrevYear }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nPrevCrop }}
            </td>
            <td class="cell-number" style="font-weight: bold;">
              {{ plot.selectedOption.nSum }}
            </td>
            <td class="cell-number">
              {{ orgN(plot) }}
            </td>
            <td class="cell-number" style="padding-right: 10px;">
              {{ minN(plot) }}
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
    orgN(plot) {
      if (plot.selectedOption) {
        return _.round(plot.selectedOption.orgNAmount)
      }
      return 0
    },
    minN(plot) {
      if (plot.selectedOption) {
        return _.round(plot.selectedOption.minNAmount * 0.27)
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
