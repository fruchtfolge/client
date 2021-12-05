<template lang="html">
  <div>
    <div class="blur">
      <div v-if="loading" class="lds-spinner">
        <div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div />
      </div>
      <div v-else class="box">
        <div class="inputs">
          <h2 class="infoText">
            NEUEN SCHLAG HINZUFÜGEN
          </h2>
          <h2 style="margin-bottom: 0px;" class="infoText">
            {{ displaySize }} ha
          </h2>
          <label class="label" for="add.plot.name">Name</label>
          <input id="add.plot.name" v-model="name" type="text" class="input" @keyup.enter="addPlot">
          <label class="label" for="add.plot.prevCrop1">Hauptfrucht {{ curYear - 1 }}</label>
          <select id="add.plot.prevCrop1" v-model="prevCrop1" class="select dropdown">
            <option v-for="(crop, i) in crops" :key="i" :value="crop.code">
              {{ crop.name }}
            </option>
            <option value="" />
            <option v-for="(culture) in cultures" :key="culture.code" :value="culture.variety">
              {{ culture.variety }}
            </option>
          </select>
          <label class="label" for="add.plot.prevCrop2">Hauptfrucht {{ curYear - 2 }}</label>
          <select id="add.plot.prevCrop2" v-model="prevCrop2" class="select dropdown">
            <option v-for="(prevCrop, i) in crops" :key="i" :value="prevCrop.code">
              {{ prevCrop.name }}
            </option>
            <option value="" />
            <option v-for="(culture) in cultures" :key="culture.code" :value="culture.variety">
              {{ culture.variety }}
            </option>
          </select>
          <label class="label" for="add.plot.prevCrop3">Hauptfrucht {{ curYear - 3 }}</label>
          <select id="add.plot.prevCrop3" v-model="prevCrop3" class="select dropdown">
            <option v-for="(prevCrop, i) in crops" :key="i" :value="prevCrop.code">
              {{ prevCrop.name }}
            </option>
            <option value="" />
            <option v-for="(culture) in cultures" :key="culture.code" :value="culture.variety">
              {{ culture.variety }}
            </option>
          </select>
        </div>
        <button class="button buttonOk" @click="addPlot">
          ÜBERNEHMEN
        </button>
        <button class="button buttonCancel" @click="cancel">
          ABBRECHEN
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import area from '@turf/area'
import cultures from '~/assets/js/cultures.js'
import notifications from '~/components/notifications'

export default {
  props: {
    plotData: {
      type: Object,
      required: true
    }
  },
  computed: {
    displaySize() {
      return _.round(this.size,2).toLocaleString()
    }
  },
  data() {
    return {
      curYear: 2019,
      name: 'Unbenannt',
      crops: [],
      size: 0,
      loading: false,
      prevCrop1: '',
      prevCrop2: '',
      prevCrop3: ''
    }
  },
  notifications: notifications,
  created() {
    this.cultures = cultures
    if (this.$store.crops) {
      this.crops = _.uniqBy(this.$store.crops, 'code')
    }
    if (this.$store.curYear) this.curYear = this.$store.curYear
    // use official size values from IACS data if available
    // fallback to calculating area in WGS84, which will distort sizes (FIX)
    if (this.plotData.features[0].properties && this.plotData.features[0].properties.area) {
      this.size = this.plotData.features[0].properties.area
    } else {
      this.size = this.getSize(this.plotData.features[0])
    }

    // add previous crops if available
    this.addPrevCrop(this.curYear - 1)
    this.addPrevCrop(this.curYear - 2)
    this.addPrevCrop(this.curYear - 3)
  },
  methods: {
    addPrevCrop(year) {
      if (this.plotData.features[0].properties[`code_${year}`]) {
        const prevCropCode = this.plotData.features[0].properties[`code_${year}`]
        const yearDiff = this.curYear - year
        this[`prevCrop${yearDiff}`] = prevCropCode
      }
    },
    async addPlot() {
      this.loading = true
      const settings = await this.$db.get('settings')
      try {
        const properties = {
          name: this.name,
          geometry: this.plotData.features[0],
          prevCrop1: this.prevCrop1,
          prevCrop2: this.prevCrop2,
          prevCrop3: this.prevCrop3,
          size: this.size,
          settings: settings
        }
        console.log(properties)

        const { data } = await this.$axios.post(
          process.env.baseUrl + 'plots/',
          properties,
          {
            progress: true
          }
        )
        this.$bus.$emit('drawPlot', data[0].geometry)
        // store new plots in database
        await this.$db.bulkDocs(data)
        this.showPlotSucc()
        this.$emit('closeAddPlot')
        this.loading = false
      } catch (e) {
        this.showPlotErr()
        this.loading = false
        console.log(e)
      }
      // const settings = await this.$db.get('settings')
      //
    },
    getSize(geometry) {
      const m2 = area(geometry)
      return Number((m2 / 10000).toFixed(2))
    },
    cancel() {
      this.$emit('closeAddPlot')
    }
  }
}
</script>

<style scoped>
.plotLoading {
  z-index: 101;
}

.inputs {
  width: 320px;
  position: relative;
  left: 50%;
  top: 30px;
  margin-left: -160px;
}

.label {
  font-size: 12px;
  position: relative;
  left: 0px;
  margin-left: 0px;
  display: inline-block;
  margin-top: 0px;
  top: 0px;
  margin-bottom: 5px;
}
.infoText {
  text-align: center;
  font-size: 18px;
  letter-spacing: 0.2em;
  font-weight: normal;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
}

.dropdown {
  font-size: 14px;
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  letter-spacing: 0px;
  margin-bottom: 15px;
  width: 320px;
  height: 33px;
}

.input {
  font-size: 14px;
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  letter-spacing: 0px;
  margin-bottom: 15px;
  width: 312px;
  height: 33px;
  padding-right: 0px;
}

.buttonOk {
  position: absolute;
  bottom: 35px;
  left: 45px;
  width: 130px;
}

.buttonOk:hover {
  background-color: #79ae98;
  color: white;
}

.buttonCancel {
  position: absolute;
  bottom: 35px;
  right: 45px;
  width: 130px;
}

.buttonCancel:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
