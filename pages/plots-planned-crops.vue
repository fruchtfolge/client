<template>
  <div>
    <loading v-if="loading" />
    <div v-if="!loading && curPlots && curPlots.length > 0" class="plotOverview">
      <table class="table plotPlanOverview-table">
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
            <th v-for="(year) in prevYears" :key="year" class="wide-cells">
              {{ year }}
            </th>
            <th style="width: 250px;">
              Planung {{ curYear }}
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
              <td :key="`${year}_${m}`" class="wide-cells">
                {{ plot[year] }}
              </td>
            </template>
            <td class="multi-select-crops">
              <multiselect
                v-model="plot.allowedCrops"
                :options="crops"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                :searchable="false"
                selectLabel="Enter zum auswählen"
                selectedLabel="Auwgewählt"
                deselectLabel="Enter zum entfernen"
                placeholder="Auwählen"
                :preselect-first="false"
                @input="changeAllowed(plot)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <dropdown class="dropdown-container">
        <a
          class="dropdown-item"
          @click="bulkSelect('selectAll')"
        >Alle auswählen</a>
        <hr>
        <a
          class="dropdown-item"
          @click="bulkSelect('unselectAll')"
        >Alle löschen</a>
      </dropdown>
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
import Multiselect from 'vue-multiselect'
import cultures from '~/assets/js/cultures'

export default {
  components: {
    Multiselect,
    loading: () => import('~/components/loading.vue'),
    dropdown: () => import('~/components/dropdown.vue')
  },
  data() {
    return {
      loading: true,
      curPlots: null,
      curCrops: null,
      crops: [],
      cultures: null,
      curScenario: 'Standard',
      selectedPlot: null,
      prevYears: [2018, 2019],
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
        if (this.curCrops) {
          const match = _.find(this.curCrops, ['code', plot.crop])
          if (match) {
            name = match.variety || match.name
          }
        }
        return name
      }
    },
    update() {
      // this.loading = true
      // set short timeout in order for Vue to render the loading bar
      setTimeout(() => {
        const store = this.$store
        this.$set(this, 'curPlots', store.curPlots)
        this.$set(this, 'curYear', store.curYear)
        this.$set(this, 'curCrops', store.curCrops)
        if (this.curCrops) {
          this.$set(this, 'crops', this.curCrops.map(c => c.name))
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
          for (let i = 1; i < 2 + 1; i++) {
            plot[this.curYear - i] = this.getCrop(plot.id, this.curYear - i)
          }
        })
      }
    },
    importPrev() {
      this.loading = true
      this.$bus.$emit('importPrevYear')
    },
    async changeAllowed(changedPlot) {
      try {
        console.log(changedPlot)
        // get plot from db
        const plot = await this.$db.get(changedPlot._id)
        // change allowed crops
        plot.allowedCrops = changedPlot.allowedCrops
        // store again
        await this.$db.put(plot)
      } catch (e) {
        console.log(e)
      }
    },
    async bulkSelect(type) {
      try {
        this.loading = true
        this.curPlots = this.curPlots.map(p => {
          if (type === 'selectAll') {
            p.allowedCrops = this.crops
          } else {
            p.allowedCrops = []
          }
          return p
        })
        await this.$db.bulkDocs(this.curPlots)
        this.loading = false
      } catch (e) {
        this.loading = false
        console.log(e)
      }
    }
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css">
</style>
<style>
.plotPlanOverview-table {
  /* float: left; */
  /* margin: 0; */
  margin-top: 20px;
  max-width: 100vw;
  min-width: 768px;
  table-layout: fixed;
}

.plotPlanOverview-table .wide-cells {
  padding-left: 10px;
}

.multiselect__tags {
  border-radius: 0px;
  border: none;
  background: none;
}

.multiselect__tag,
.multiselect__option--highlight,
.multiselect__option--highlight::after {
  background-color: rgb(121, 173, 151);
}

.multiselect__option--selected.multiselect__option--highlight,
.multiselect__option--selected.multiselect__option--highlight::after {
  background-color: rgb(198, 88, 59);
}

.multiselect,
.multiselect__input,
.multiselect__single,
.multi-select-crops {
  font-family: 'Open Sans';
  background: none;
  font-size: 14px;
}
</style>
