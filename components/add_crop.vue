<template lang="html">
  <div>
    <div class="blur"></div>
    <div class="box">
      <div class="inputs">
        <h2 class="infoText">NEUE KULTUR HINZUFÜGEN</h2>
        <label for="add.crop.farmingType">Anbauverfahren</label>
        <select class="dropdown" id="add.crop.farmingType" v-model="farmingType">
          <option disabled value="">Anbauverfahren</option>
          <option v-for="(farmingType, i) in farmingTypes" :key="i" :value="farmingType">{{ farmingType }}</option>
        </select>
        <label for="add.crop.crop">Kultur</label>
        <select class="dropdown" id="add.crop.crop" v-model="crop">
          <option disabled value="">Kultur</option>
          <option v-for="(crop, i) in crops" :key="i" :value="crop">{{ crop }}</option>
        </select>
        <label for="add.crop.system">System</label>
        <select class="dropdown" id="add.crop.system" v-model="system">
          <option disabled value="">System</option>
          <option v-for="(system, i) in systems" :key="i" :value="system">{{ system }}</option>
        </select>
        <label for="add.crop.variety">Sorte</label>
        <input type="text" id="add.crop.variety" placeholder="Optional" class="input" v-model="variety" @keyup.enter="addCrop">
      </div>
      <p v-if="exists" style="text-align: center; margin-top: 30px; color:red;">Kultur bereits vorhanden. Bitte anderen Sortennamen wählen.</p>
      <button v-if="!exists" class="buttonOk" @click="addCrop">ÜBERNEHMEN</button>
      <button class="buttonCancel" @click="cancel">ABBRECHEN</button>
    </div>
  </div>
</template>

<script>
import ktblCrops from '~/assets/js/crops.js'

export default {
  data() {
    return {
      farmingType: 'konventionell/integriert',
      crop: 'Ackergras - Anwelksilage',
      system: 'Ballen',
      cropGroup: 'Gras',
      variety: '',
      farmingTypes: ['konventionell/integriert', 'ökologisch']
    }
  },
  computed: {
    crops() {
      const data = _.filter(ktblCrops, {farmingType: this.farmingType})
      let unique = _.uniqBy(data, 'crop')
      if (data) {
        unique = unique.map(o => {return o.crop})
        return unique
      }
    },
    systems() {
      let data = _.filter(ktblCrops, {farmingType: this.farmingType, crop: this.crop})
      if (data) {
        data = data.map(o => {return o.system})
        return data
      }
    },
    curCrop() {
      let data = _.filter(ktblCrops, {farmingType: this.farmingType, crop: this.crop, system: this.system})
      if (data) {
        return data[0]
      }
    },
    exists() {
      let bool = false
      if (this.$store && this.$store.curCrops && this.$store.curCrops.length) {
        this.$store.curCrops.forEach(crop => {
          if (this.variety && crop.name !== this.variety) {
            return bool = false
          } else if (crop.name === this.crop) {
            return bool = true
          }
        })
      }
      return bool
    }
  },
  methods: {
    async addCrop() {
      try {
        const settings = await this.$db.get('settings')
        // create array of years from 2001 - present for timeline of crops
        let years = Array(settings.curYear - 2000).fill(0).map((e,i)=>i+2001)
        // check if crop already exists in current year (but not active), or exists for previous years
        const crops = await this.$db.find({
          selector: {name: this.variety || this.crop},
          fields: ['name', 'year']
        })
        // filter out years that are already present in the database (to ensure no duplicates)
        years = years.filter(year => {
          const match = _.find(crops.docs, ['year', year])
          if (match) return false
          else return true
        })
        // create crops for missing years (if any)
        if (years.length > 0) {
          const properties = Object.assign(this.curCrop, {
            year: settings.curYear,
            years: years,
            scenario: settings.curScenario,
            farmingType: this.farmingType,
            region: settings.state_district,
            variety: this.variety
          })
          console.log(properties)
          const { data } = await this.$axios.post('http://localhost:3001/crops/', properties,{ progress: true })
          
          await this.$db.bulkDocs(data)
        }
        console.log(years);

      } catch (e) {
        console.log(e);
      }

      this.$emit('closeAddCrop')
    },
    cancel() {
      this.$emit('closeAddCrop')
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

.box {
  position: absolute;
  width: 400px;
  height: 500px;
  top: calc(50vh - 120px);
  margin-top: -250px;
  left: 50%;
  margin-left: -200px;
  background-color: white;
  border: 1px solid;
  border-color: #CCCCCC;
  z-index: 99;
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
