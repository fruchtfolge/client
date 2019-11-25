<template>
  <div>
    <loading v-if="loading" />
    <div v-if="!loading && curPlots && curPlots.length > 0" class="plotOverview">
      <table class="table plotOverview-table">
        <thead>
          <tr>
            <th style="width: 125px;">
              Name
            </th>
            <th style="width: 50px;">
              Größe
            </th>
            <th style="width: 50px;">
              Hof-Feld-Distanz
            </th>
            <th v-for="(year) in prevYears" :key="year" style="width: 125px;">
              {{ year }}
            </th>
            <th style="width: 125px;">
              {{ curYear }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot) in curPlots" :key="plot._id">
            <td class="wide-cells">
              {{ plot.name }}
            </td>
            <td class="narrow-cells-number">
              {{ plot.size }}
            </td>
            <td class="narrow-cells-number">
              {{ plot.distance }}
            </td>
            <template v-for="(year,m) in prevYears">
              <td :key="`${year}_${m}`" style="wide-cells">
                {{ plot[year] }}
              </td>
            </template>
            <td>
              <select v-model="plot[year]" class="selection select" @change="saveCropChange(plot,year)">
                <option v-for="(crop) in crops" :key="`${crop.code}_${crop.name}`" :value="crop.name">
                  {{ crop.name }}
                </option>
              </select>
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
      <button class="button" @click="$nuxt.$router.replace({path: 'maps'})">
        ZUR KARTE
      </button>
      <button class="button" style="margin-left: 20px;" @click="importPrev">
        IMPORTIEREN
      </button>
    </div>
  </div>
</template>

<script>
import cultures from '~/assets/js/cultures'

export default {
  components: {
    loading: () => import('~/components/loading.vue')
  },
  data() {
    return {
      loading: true,
      curPlots: null,
      crops: null,
      cultures: null,
      curScenario: 'Standard',
      selectedPlot: null,
      prevYears: [2018, 2019],
      curYear: 2020,
      waiting: false
    }
  },
  created() {},
  mounted() {
    this.cultures = cultures
    this.update()
    this.$bus.$on('changeCurrents', _.debounce(this.update, 200))
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
  },
  methods: {
    getPlot(id, year) {
      const plot = _.find(this.$store.plots, {
        id: id,
        year: year,
        scenario: this.curScenario
      })
      return plot
    },
    getCrop(id, year) {
      const plot = this.getPlot(id, year)
      if (plot && cultures[plot.crop]) {
        // check if crop has a different name from the farmer
        let name = cultures[plot.crop].variety
        if (this.crops) {
          const match = _.find(this.crops, ['code', plot.crop])
          if (match) {
            name = match.variety || match.name
          }
        }
        return name
      }
    },
    update() {
      this.loading = true
      // set short timeout in order for Vue to render the loading bar
      setTimeout(() => {
        const store = this.$store
        this.$set(this, 'curPlots', store.curPlots)
        this.$set(this, 'curYear', store.curYear)

        // add presonal crops to default NRW crops
        if (store.crops) {
          const crops = _.uniqBy(
            store.crops.filter(c => {
              return c.scenario === this.curScenario && c.active
            }),
            'code'
          )

          this.$set(this, 'crops', crops)
          console.log(this.curYear, this.maxRotBreak)
        }
        // create array of previous years
        const prevYears = Array(this.curYear - (this.curYear - 2))
          .fill(0)
          .map((e, i) => i + (this.curYear - 2))

        this.$set(this, 'prevYears', prevYears)
        // add previous crops to each crop object
        this.plotsPrevCrops()
        // hide loading menu when finished
        this.loading = false
      }, 1)
    },
    plotsPrevCrops() {
      if (this.curPlots && this.curPlots.length > 0) {
        this.curPlots.forEach(plot => {
          for (let i = 1; i < this.maxRotBreak + 1; i++) {
            plot[this.curYear - i] = this.getCrop(plot.id, this.curYear - i)
            plot[this.curYear - i + 'catchCrop'] = this.getCatchCrop(
              plot.id,
              this.curYear - i
            )
          }
        })
      }
    },
    importPrev() {
      this.loading = true
      this.$bus.$emit('importPrevYear')
    }
  }
}
</script>

<style>
.plotOverview-table {
  /* float: left; */
  /* margin: 0; */
  margin-top: 20px;
  max-width: 100vw;
  min-width: 768px;
  table-layout: fixed;
}

.plotOverview table input {
  -webkit-appearance: checkbox;
}
</style>
