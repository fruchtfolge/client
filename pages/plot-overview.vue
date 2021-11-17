<template>
  <div>
    <div v-if="plots && plots.length > 0" class="plotOverview">
      <modal v-if="isModalOpen" :head="'SCHLÄGE LÖSCHEN'" :body="`Wollen Sie die ausgewählten ${selectedPlots.length} Schläge wirklich löschen?`" :buttonOk="'LÖSCHEN'" :callback="deleteSelectedPlots" @closeModal="isModalOpen = false" />
      <div class="plotOverview-wrapper">
        <div class="plotOverview-controls">
          <input class="input search-plots" type="text" placeholder="Suche..." v-model="searchString">
          <!--
          <button class="button delete-plots-btn" type="button" name="button" @click="selectedPlots.length ? isModalOpen = true : ''">AUSWAHL LÖSCHEN</button>
          <label class="duplicates-label" for="Duplicates">Nur Duplikate anzeigen</label>
          <input type="checkbox" name="Duplicates" v-model="showDuplicates">
        -->
        </div>
        <table class="table plotOverview-table">
          <thead>
            <tr>
              <th style="width: 40px;">
                <input type="checkbox" name="Select all" @click="handleSelectAll">
              </th>
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
                Nmin-Wert
              </th>
              <th style="width: 50px;">
                Klasse P<sub>2</sub>O<sub>5</sub>
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
            <tr v-for="(plot, i) in filteredPlots" :key="i">
              <td><input type="checkbox" v-model="plot.selected" :value="plot.selected"></td>
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
              <td contenteditable class="narrow-cells-number" @blur="save($event,plot,'nmin')">
                {{ plot.nmin }}
              </td>
              <td class="narrow-cells-number">
                <select v-model="plot.pSupplyStage" class="selection select" @change="save(null,plot,'pSupplyStage')">
                  <option v-for="(supplyStage) in pSupplyStages" :key="supplyStage" :value="supplyStage">
                    {{ supplyStage }}
                  </option>
                </select>
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
        <dropdown class="dropdown-container">
          <a
            class="dropdown-item"
            @click="showDuplicates = !showDuplicates"
          >{{ showDuplicates ? 'Nur Duplikate anzeigen ✓' : 'Nur Duplikate anzeigen'}}</a>
          <hr>
          <a
            class="dropdown-item"
            @click="selectedPlots.length ? isModalOpen = true : ''"
          >Ausgewählte Schläge löschen</a>
        </dropdown>
      </div>

    </div>
    <div v-else style="text-align: center; margin-top: 100px;">
      <h3>Noch keine Schläge für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
      <h3>
        Sie können neue Schläge auf der Seite 'Karte' einzeichnen.
        <br>
        Alternativ können Sie Daten aus dem vorherigen Anbaujahr importieren.
      </h3>
      <button style="background-color: white;" class="button" @click="$nuxt.$router.replace({path: 'maps'})">
        ZUR KARTE
      </button>
      <button style="margin-left: 20px; background-color: white;" class="button" @click="importPrev">
        IMPORTIEREN
      </button>
    </div>
  </div>
</template>

<script>
import notifications from '~/components/notifications'

export default {
  components: {
    modal: () => import('~/components/modal.vue'),
    dropdown: () => import('~/components/dropdown.vue')
  },
  computed: {
    selectedPlots() {
      return this.plots.filter(p => p.selected)
    },
    filteredPlots() {
      let filtered = this.plots
      if (this.showDuplicates) {
        const reference = []
        filtered = []
        this.plots.forEach(plot => {
          const match = reference.findIndex(p => plot.size === p.size && plot.name === p.name)
          if (match > -1) filtered.push(plot)
          else reference.push(plot)
        })
      }
      filtered = filtered.filter(p => p.name.toLowerCase().includes(this.searchString.toLowerCase()))
      return filtered
    }
  },
  data() {
    return {
      isModalOpen: false,
      plots: null,
      searchString: '',
      selectAll: false,
      showDuplicates: false,
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
      pSupplyStages: ['A', 'B', 'C', 'D', 'E'],
      selectedPlot: null,
      curYear: 2019,
      waiting: false
    }
  },
  notifications: notifications,
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
    handleSelectAll() {
      this.selectAll = !this.selectAll

      this.plots = this.plots.map(p => {
        const match = this.filteredPlots.indexOf(p)
        if (match > -1) p.selected = this.selectAll ? true : false
        return p
      })
    },
    update() {
      this.$set(this, 'plots', this.$store.curPlots)
      this.$set(this, 'curYear', this.$store.curYear)
    },
    importPrev() {
      if (!this.waiting) this.$bus.$emit('importPrevYear')
      this.waiting = true
    },
    async deleteSelectedPlots() {
      const plotsToDelete = this.selectedPlots.map(p => {
        p._deleted = true
        return p
      })
      try {
        await this.$db.bulkDocs(plotsToDelete)
        this.saveSuccess()
      } catch (e) {
        this.saveError()
        console.log(e)
      }
    },
    async save(e, data, prop) {
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

        this.saveSuccess()
      } catch (e) {
        this.saveError()
        console.log(e)
      }
    }
  }
}
</script>

<style>
.plotOverview-wrapper {
  /* float: left; */
  margin: auto;
  margin-top: 20px;
  max-width: 960px;
  min-width: 768px;
}

.plotOverview-controls {
  margin-bottom: 10px;
}

.search-plots {
  box-sizing: border-box;
  font-size: 16px;
  height: 36px;
  margin-right: 5px;
  width: 100%;
}

.duplicates-label {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 300;
}

.delete-plots-btn {
  width: 150px;
  background-color: white;
  border-color: #cccccc;
}

.plotOverview-table {
  margin: unset;
  width: unset;
  margin-top: 10px;
  max-width: 960px;
  min-width: 100%;
}
.plotOverview table input {
  -webkit-appearance: checkbox;
}
.plotOverview table select {
  padding-right: 0px;
}
</style>
