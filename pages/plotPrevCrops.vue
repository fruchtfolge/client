<template>
  <div>
    <loading v-if="loading" />
    <div v-if="!loading && curPlots && curPlots.length > 0" class="plotOverview">
      <table>
        <thead>
          <tr>
            <th style="min-width: 250px;">
              Name
            </th>
            <th>Größe</th>
            <th>Hof-Feld-Distanz</th>
            <template v-for="(year) in prevYears">
              <th :key="year + 'ZF'">
                ZF
              </th>
              <th :key="year">
                {{ year }}
              </th> <!--style="min-width: 200px;"-->
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot) in curPlots" :key="plot.id">
            <td style="text-align: center;">
              {{ plot.name }}
            </td>
            <td style="text-align: center;">
              {{ plot.size }}
            </td>
            <td style="text-align: center;">
              {{ plot.distance }}
            </td>
            <template v-for="(year,m) in prevYears">
              <td :key="'ZF' + m" style="text-align: center;">
                <input type="checkbox" :checked="plot[year + 'catchCrop']" @change="saveCatchCrop($event,plot,year)">
              </td>

              <td :key="m" style="text-align: center;">
                <select v-model="plot[year]" class="selection" @change="saveCropChange(plot,year)">
                  <option v-for="(crop) in crops" :key="crop.code + crop.name" :value="crop.name">
                    {{ crop.name }}
                  </option>
                  <!--
                  <option value="" />
                  <option v-for="(culture) in cultures" :key="culture.variety + culture.code" :value="culture.variety">
                    {{ culture.variety }}
                  </option>
                -->
                </select>
              </td>
            </template>
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
      maxRotBreak: 3,
      prevYears: [2016, 2017, 2018],
      curYear: 2019,
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
    getCatchCrop(id, year) {
      const plot = this.getPlot(id, year)
      if (plot) {
        return plot.catchCrop
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
          let maxRotBreak = _.maxBy(crops, 'rotBreak').rotBreak
          if (maxRotBreak < 3) maxRotBreak = 3
          this.$set(this, 'crops', crops)
          this.$set(this, 'maxRotBreak', maxRotBreak)
          console.log(this.curYear, this.maxRotBreak)
        } else {
          this.$set(this, 'maxRotBreak', 3)
        }
        // create array of previous years
        const prevYears = Array(
          this.curYear - (this.curYear - this.maxRotBreak)
        )
          .fill(0)
          .map((e, i) => i + (this.curYear - this.maxRotBreak))

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
    async saveCropChange(plot, year) {
      try {
        // get plot from store
        const storedPlot = _.find(this.$store.plots, {
          id: plot.id,
          year: year,
          scenario: this.$store.curScenario
        })

        const newCrop = plot[year]
        let newCropCode = ''
        const crop = _.find(this.crops, { name: newCrop })
        if (crop) {
          newCropCode = crop.code
        } else {
          newCropCode = _.find(this.crops, { variety: newCrop }).code
        }
        console.log(newCropCode, storedPlot, newCrop)

        if (storedPlot) {
          storedPlot.crop = newCropCode
          await this.$db.put(storedPlot)
        } else {
          const newPlot = _.cloneDeep(plot)
          newPlot.crop = newCropCode
          newPlot.year = year
          delete newPlot._rev
          newPlot._id = this.uuidv4()
          await this.$db.put(newPlot)
        }
      } catch (e) {
        console.log(e)
      }
    },
    async saveCatchCrop(e, plot, year) {
      try {
        // find given plot
        const storedPlot = _.find(this.$store.plots, {
          id: plot.id,
          year: year,
          scenario: this.$store.curScenario
        })
        console.log(storedPlot, e)
        // if found, get plot from db
        if (storedPlot) {
          const data = await this.$db.get(storedPlot._id)
          data.catchCrop = e.target.checked
          // save in db
          await this.$db.put(data)
        }
      } catch (e) {
        console.log(e)
      }
    },
    uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
        c
      ) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
    importPrev() {
      this.loading = true
      this.$bus.$emit('importPrevYear')
    }
  }
}
</script>

<style>
.plotOverview table input {
  -webkit-appearance: checkbox;
}
.selection {
  min-width: 0px;
  width: 100px;
  font-size: 14px;
  text-align-last: center;
  font-family: 'Open Sans Light';
  letter-spacing: normal;
  border-width: 0px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='%23444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-repeat: no-repeat;
  background-position: 100% 50%;
}
</style>
