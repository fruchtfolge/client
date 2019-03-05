<template lang="html">
  <div>
    <div class="blur" :class="{ plotLoading: loading }">
      <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
    <div class="plotBox">
      <div class="inputs">
        <h2 class="infoText">NEUEN SCHLAG HINZUFÜGEN</h2>
        <label for="add.plot.name">Name</label>
        <input type="text" id="add.plot.name" class="input" v-model="name" @keyup.enter="addPlot">
        <label for="add.plot.prevCrop1">Hauptfrucht {{ curYear - 1 }}</label>
        <select class="dropdown" id="add.plot.prevCrop1" v-model="prevCrop1">
          <option v-for="(crop, i) in crops" :key="i" :value="crop">{{ crop }}</option>
        </select>
        <label for="add.plot.prevCrop2">Hauptfrucht {{ curYear - 2 }}</label>
        <select class="dropdown" id="add.plot.prevCrop2" v-model="prevCrop2">
          <option v-for="(prevCrop, i) in crops" :key="i" :value="prevCrop">{{ prevCrop }}</option>
        </select>
        <label for="add.plot.prevCrop3">Hauptfrucht {{ curYear - 3 }}</label>
        <select class="dropdown" id="add.plot.prevCrop3" v-model="prevCrop3">
          <option v-for="(prevCrop, i) in crops" :key="i" :value="prevCrop">{{ prevCrop }}</option>
        </select>
      </div>
      <button class="buttonOk" @click="addPlot">ÜBERNEHMEN</button>
      <button class="buttonCancel" @click="cancel">ABBRECHEN</button>
    </div>
  </div>
</template>

<script>
import { area } from '@turf/turf'
import createPlot from '~/assets/js/createPlot'
import ktblCrops from '~/assets/js/crops.js'

export default {
  props: ['plotData'],
  data() {
    return {
      curYear: 2019,
      name: 'Unbenannt',
      loading: false,
      prevCrop1: '',
      prevCrop2: '',
      prevCrop3: ''
    }
  },
  notifications: {
    showPlotSucc: {
      title: 'SCHLAG HINZUGEFÜGT',
      message: 'Der Schlag wurde gespeichert.',
      type: 'success'
    },
    showPlotErr: {
      title: 'FEHLER',
      message: 'Beim Hinzufügen des Schlags ist ein Fehler aufgetreten.',
      type: 'error'
    }
  },
  computed: {
    crops() {
      let unique = _.uniqBy(ktblCrops, 'cropGroup')
      if (unique.length > 0) {
        unique = unique.map(o => {return o.cropGroup})
        console.log(unique);
        return unique.sort()
      }
    },
    systems() {
      let data = _.filter(ktblCrops, {farmingType: this.farmingType, crop: this.crop})
      if (data) {
        data = data.map(o => {return o.system})
        return data
      }
    }
  },
  created() {
    if (this.$store.curYear) this.curYear = this.$store.curYear
  },
  methods: {
    async addPlot() {
      this.loading = true
      const settings = await this.$db.get('settings')
      const size = this.getSize(this.plotData.features[0])
      try {
        const properties = {
          name: this.name,
          geometry: this.plotData.features[0],
          size: size,
          settings: settings
        }
        console.log(properties)
        const { data } = await this.$axios.post('http://localhost:3001/plots/', properties,{ progress: true })
        this.$bus.$emit('drawPlot', data.geometry)
        // store new plot in database
        await this.$db.put(data)
        this.showPlotSucc()
        this.$emit('closeAddPlot')
        this.loading = false
      } catch (e) {
        this.showPlotErr()
        this.loading = false
        console.log(e);
      }
      //const settings = await this.$db.get('settings')
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
.blur {
  background: #F5F5F5;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 95;
  transition: all 0.8s ease-in-out;
  opacity: 0.95;
  visibility: visible;
}

.plotBox {
  position: absolute;
  width: 400px;
  height: 500px;
  top: calc(50% -60px);
  margin-top: -250px;
  left: 50%;
  margin-left: -200px;
  background-color: white;
  border: 1px solid;
  border-color: #CCCCCC;
  z-index: 99;
}

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
  padding-bottom: 15px;
  letter-spacing: 0.2em;
  font-weight: normal;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
}

.dropdown {
  margin-bottom: 15px;
  width: 320px;
  height: 33px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='#444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-position: 100% 50%;
  background-repeat: no-repeat;
  padding-right: 25px;
}

.input {
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
  background-color: rgba(0,0,0,0.05);
}
</style>
