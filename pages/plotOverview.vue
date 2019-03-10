<template>
  <div>
    <div v-if="plots && plots.length > 0" class="plotOverview">
      <table>
        <thead>
          <tr>
            <th style="min-width: 250px;">
              Name
            </th>
            <th>Größe</th>
            <th>Hof-Feld-Distanz</th>
            <th>Bodenqualität (SQR)</th>
            <th>Bodenart</th>
            <th>Humusgehalt</th>
            <th>Hackfruchtfähig</th>
            <th>Dauergrünland</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot, i) in plots" :key="i">
            <td style="text-align: center;">
              {{ plot.name }}
            </td>
            <td style="text-align: center;">
              {{ plot.size }}
            </td>
            <td style="text-align: center;">
              {{ plot.distance }}
            </td>
            <td style="text-align: center;">
              {{ plot.quality }}
            </td>
            <td style="text-align: center;">
              {{ plot.soilType }}
            </td>
            <td style="text-align: center;">
              {{ plot.humusContent }}
            </td>
            <td style="text-align: center;">
              <input type="checkbox" :checked="plot.rootCrops">
            </td>
            <td style="text-align: center;">
              <input type="checkbox" :checked="plot.permPast">
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
      selectedPlot: null,
      curYear: 2019,
      waiting: false
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
    changePlot(plot) {
      this.selectedPlot = plot
    },
    update() {
      this.$set(this, 'plots', this.$store.curPlots)
      this.$set(this, 'curYear', this.$store.curYear)
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
