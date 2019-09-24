<template>
  <div>
    <div v-if="dataAvail" class="plotOverview">
      <table>
        <thead>
          <tr>
            <th>
              Name
            </th>
            <th>Kultur</th>
            <th>Ertragsniveau 3 Jahr Ø Betrieb [dt/ha]</th>
            <th>N-Bedarfswert [kg N/ha]</th>
            <th>Zu- oder Abschlag Ertragsdifferenz [kg N/ha]</th>
            <th>Abschlag Nmin-Probe/Richtwert [kg N/ha]</th>
            <th>Abschlag Standort/Humus [kg N/ha]</th>
            <th>Abschlag org. Düngung der Vorjahre [kg N/ha]</th>
            <th>Abschlag Vorfrucht/ZF [kg N/ha]</th>
            <th>Stickstoffdüngebedarf Vegetation [kg N/ha]</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot, i) in plots" :key="i">
            <td style="text-align: center;">
              {{ plot.name }}
            </td>
            <td style="text-align: center;">
              {{ plot.selectedCrop }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].avgYield }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nReq }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nYieldDiff }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nMinDiff }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].humusContent }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nFertPrevYear }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nPrevCrop }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].sum }}
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
      nData: {},
      curYear: 2019,
      waiting: false
    }
  },
  computed: {
    dataAvail() {
      let bool = true
      if (this.nData && this.plots && this.plots.length) {
        this.plots.forEach(p => {
          if (!p.matrix) {
            console.log(p)
            bool = false
          }
        })
      } else {
        bool = false
      }
      return bool
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
      this.calcData()
    },
    calcData() {
      if (!this.plots) return
      this.plots.forEach(plot => {
        // use crop that was acutally grown over selected crop
        // const cropCode = plot.crop ? plot.crop : plot.selectedCrop
        const data = plot.matrix[this.curYear][plot.selectedCrop]
        data.sum = this.nData[plot._id] = data
      })
    },
    importPrev() {
      this.waiting = true
      this.$bus.$emit('importPrevYear')
    }
  }
}
</script>

<style>
.plotOverview table input {
  -webkit-appearance: checkbox;
}
</style>
