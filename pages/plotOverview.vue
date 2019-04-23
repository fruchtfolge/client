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
            <td contenteditable style="text-align: center;" @blur="save($event,plot,'name')">
              {{ plot.name }}
            </td>
            <td
              contenteditable
              style="center;"
              @blur="save(e,plot,'size')"
            >
              {{ plot.size }}
            </td>
            <td contenteditable style="text-align: center;" @blur="save($event,plot,'distance')">
              {{ plot.distance }}
            </td>
            <td contenteditable style="text-align: center;" @blur="save($event,plot,'quality')">
              {{ plot.quality }}
            </td>
            <td style="text-align: center;">
              <select v-model="plot.soilType" class="selection" @change="save(null,plot,'soilType')">
                <option v-for="(soilType) in soilTypes" :key="soilType" :value="soilType">
                  {{ soilType }}
                </option>
              </select>
            </td>
            <td style="text-align: center;">
              <select v-model="plot.humusContent" class="selection" @change="save(null,plot,'humusContent')">
                <option v-for="(humusContent) in humusContents" :key="humusContent" :value="humusContent">
                  {{ humusContent }}
                </option>
              </select>
            </td>
            <td style="text-align: center;">
              <input type="checkbox" :checked="plot.rootCrops" @change="save($event,plot,'rootCrops')">
            </td>
            <td style="text-align: center;">
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
        } else if (e && (prop === 'rootCrops' || prop === 'permPast')) {
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
.plotOverview table input {
  -webkit-appearance: checkbox;
}
.selection {
  min-width: 0px;
  width: 100px;
  font-size: 14px;
  text-align-last: center;
  font-family: 'Open Sans';
  font-weight: 300;
  letter-spacing: normal;
  border-width: 0px;
  background: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: 100% 50%;
}
</style>
