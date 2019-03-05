<template>
  <div>
    <div v-if="curPlots && curPlots.length > 0 && crops" class="plotOverview">
      <table>
        <thead>
          <tr>
            <th style="min-width: 250px;">Name</th>
            <th>Größe</th>
            <th>Hof-Feld-Distanz</th>
            <th v-for="(year) in prevYears" :key='year' >{{year}}</th> <!--style="min-width: 200px;"-->
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot) in curPlots" :key='plot.id'>
            <td style="text-align: center;">{{ plot.name }}</td>
            <td style="text-align: center;">{{ plot.size }}</td>
            <td style="text-align: center;">{{ plot.distance }}</td>
            <td v-for="(year,m) in prevYears" :key='m' style="text-align: center;">
              <select v-model="plotsPrevCrops[plot.id][year]" @change="saveCropChange(plot,year)" class="selection">
                <option value=""></option>
                <option v-for="(crop) in crops" :key="crop.code" :value="crop.name">
                  {{crop.name}}
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
      Alternativ können Sie Daten aus dem vorherigen Anbaujahr importieren.</h3>
      <button @click="$nuxt.$router.replace({path: 'maps'})">ZUR KARTE</button>
      <button @click="importPrev" style="margin-left: 20px;">IMPORTIEREN</button>
    </div>
  </div>
</template>

<script>
import cultures from '~/assets/js/cultures'

export default {
  data() {
    return {
      curPlots: null,
      crops: null,
      selectedPlot: null,
      maxRotBreak: 3,
      prevYears: [2016,2017,2018],
      curYear: 2019,
      waiting: false
    }
  },
  computed: {
    plotsPrevCrops() {
      if (this.curPlots && this.curPlots.length > 0) {
        let o = {}
        const that = this
        function getName(id, year) {
          const plot = _.find(that.$store.plots, {id: id, year: year})
          if (plot && cultures[plot.crop]) {
            return cultures[plot.crop].variety
          }
        }

        this.curPlots.forEach(plot => {
          o[plot.id] = {}
          for (var i = 1; i < this.maxRotBreak + 1; i++) {
            o[plot.id][this.curYear - i] = getName(plot.id,this.curYear - i)
          }
        })
        return o
      }
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
      const store = this.$store
      this.$set(this, 'curPlots', store.curPlots)
      this.$set(this, 'curYear', store.curYear)
      if (store.crops) {
        const crops = _.uniqBy(store.crops,'code')
        const maxRotBreak = _.maxBy(crops,'rotBreak').rotBreak
        this.$set(this, 'crops', crops)
        this.$set(this, 'maxRotBreak', maxRotBreak)
        console.log(this.curYear, this.maxRotBreak);
        const prevYears = Array(this.curYear - (this.curYear - this.maxRotBreak)).fill(0).map((e,i)=>i+(this.curYear - this.maxRotBreak))
        console.log(prevYears);
        this.$set(this, 'prevYears', prevYears)
      }
    },
    async saveCropChange(plot,year) {
      try {
        // get plot from store
        let storedPlot = _.find(this.$store.plots, {id: plot.id, year: year, scenario: this.$store.curScenario})
        const newCrop = this.plotsPrevCrops[plot.id][year]
        let newCropCode = ''
        const crop = _.find(this.crops, {name: newCrop})
        if (crop) newCropCode = crop.code
        console.log(newCropCode,storedPlot);
        if (storedPlot) {
          storedPlot.crop = newCropCode
          await this.$db.put(storedPlot)
        } else {
          let newPlot = _.cloneDeep(plot)
          newPlot.crop = newCropCode
          newPlot.year = year
          delete newPlot._rev
          newPlot._id = this.uuidv4()
          await this.$db.put(newPlot)
        }
      } catch (e) {
        console.log(e);
      }
    },
    uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
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
.selection {
  min-width: 0px;
  width: 100px;
  font-size: 14px;
  text-align-last: center;
  font-family: 'Open Sans Light';
  letter-spacing: normal;
  border-width: 0px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='#444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-repeat: no-repeat;
  background-position: 100% 50%;
}
</style>
