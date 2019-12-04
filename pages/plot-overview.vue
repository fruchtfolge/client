<template>
  <div>
    <div v-if="plots && plots.length > 0" class="plotOverview">
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
            <th style="width: 50px;">
              Bodenqualität (SQR)
            </th>
            <th style="width: 150px;">
              Bodenart
            </th>
            <th style="width: 80px;">
              Humusgehalt
            </th>
            <th style="width: 50px;">
              Hackfruchtfähig
            </th>
            <th style="width: 50px;">
              Rotes Gebiet
            </th>
            <th style="width: 50px;">
              Dauergrünland
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot, i) in plots" :key="i">
            <td contenteditable class="wide-cells" @blur="save($event,plot,'name')">
              {{ plot.name }}
            </td>
            <td
              contenteditable
              class="narrow-cells-number"
              @blur="save(e,plot,'size')"
            >
              {{ plot.size }}
            </td>
            <td contenteditable class="narrow-cells-number" @blur="save($event,plot,'distance')">
              {{ plot.distance }}
            </td>
            <td contenteditable class="narrow-cells-number" @blur="save($event,plot,'quality')">
              {{ plot.quality }}
            </td>
            <td style="text-align: center;">
              <select v-model="plot.soilType" style="width: 150px;" class="selection select wide-cells" @change="save(null,plot,'soilType')">
                <option v-for="(soilType) in soilTypes" :key="soilType" :value="soilType">
                  {{ soilType }}
                </option>
              </select>
            </td>
            <td style="text-align: center;">
              <select v-model="plot.humusContent" class="selection select" @change="save(null,plot,'humusContent')">
                <option v-for="(humusContent) in humusContents" :key="humusContent" :value="humusContent">
                  {{ humusContent }}
                </option>
              </select>
            </td>
            <td class="narrow-cells-checkbox">
              <input type="checkbox" :checked="plot.rootCrops" @change="save($event,plot,'rootCrops')">
            </td>
            <td class="narrow-cells-checkbox">
              <input type="checkbox" :checked="plot.duevEndangered" @change="save($event,plot,'duevEndangered')">
            </td>
            <td class="narrow-cells-checkbox">
              <input type="checkbox" :checked="plot.permPast" @change="save($event,plot,'permPast')">
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
      <button style="margin-left: 20px;" class="button" @click="importPrev">
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
      soilTypes: [
        'Reinsande (ss)',
        'Lehmsande (ls)',
        'Schluffsande (us)',
        'Sandlehme (sl)',
        'Normallehme (ll)',
        'Tonlehme (tl)',
        'Lehmschluffe (lu)',
        'Tonschluffe (tu)',
        'Schlufftone (ut)',
        'Moore (mo)'
      ],
      humusContents: [
        '1 - <2%',
        '2 - <3%',
        '3 - <4%',
        '4 - <6%',
        '6 - <8%',
        '8 - <11,5%',
        '11,5 - <15%',
        '15 - <30%',
        '≥30%'
      ],
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
    },
    async save(e, data, prop) {
      console.log(e)
      try {
        let newValue = ''
        if (e && prop === 'name') {
          newValue = e.target.innerText
        } else if (
          (e && (prop === 'rootCrops' || prop === 'permPast')) ||
          prop === 'duevEndangered'
        ) {
          newValue = e.target.checked
        } else if (e) {
          newValue = Number(e.target.innerText)
        } else {
          newValue = data[prop]
        }
        // get doc
        const plot = await this.$db.get(data._id)
        plot[prop] = newValue
        await this.$db.put(plot)
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style>
.plotOverview-table {
  /* float: left; */
  /* margin: 0; */
  margin-top: 20px;
  max-width: 80vw;
  min-width: 768px;
  table-layout: fixed;
}

.plotOverview table input {
  -webkit-appearance: checkbox;
}
</style>
