<template lang="html">
  <div>
    <div class="blur" />
    <div class="box">
      <div class="inputs">
        <h2 class="infoText">
          NEUE KULTUR HINZUFÜGEN
        </h2>
        <label for="add.crop.farmingType">Anbauverfahren</label>
        <select id="add.crop.farmingType" v-model="farmingType" class="dropdown">
          <option disabled value="">
            Anbauverfahren
          </option>
          <option v-for="(typeOption, i) in farmingTypes" :key="i" :value="typeOption">
            {{ typeOption }}
          </option>
        </select>
        <label for="add.crop.crop">Kultur</label>
        <select id="add.crop.crop" v-model="crop" class="dropdown">
          <option disabled value="">
            Kultur
          </option>
          <option v-for="(cropOption, i) in crops" :key="i" :value="cropOption">
            {{ cropOption }}
          </option>
        </select>
        <label for="add.crop.system">System</label>
        <select id="add.crop.system" v-model="system" class="dropdown">
          <option disabled value="">
            System
          </option>
          <option v-for="(systemOption, i) in systems" :key="i" :value="systemOption">
            {{ systemOption }}
          </option>
        </select>
        <label for="add.crop.variety">Sorte</label>
        <input
          id="add.crop.variety"
          v-model="variety"
          type="text"
          placeholder="Optional"
          class="input"
          @keyup.enter="addCrop"
        >
      </div>
      <p v-if="exists" style="text-align: center; margin-top: 30px; color:red;">
        Kultur bereits vorhanden. Bitte anderen Sortennamen wählen.
      </p>
      <button v-if="!exists" class="buttonOk" @click="addCrop">
        ÜBERNEHMEN
      </button>
      <button class="buttonCancel" @click="cancel">
        ABBRECHEN
      </button>
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
      const data = _.filter(ktblCrops, { farmingType: this.farmingType })
      let unique = _.uniqBy(data, 'crop')
      if (data && unique) {
        unique = unique.map(o => {
          return o.crop
        })
      }
      return unique
    },
    systems() {
      let data = _.filter(ktblCrops, {
        farmingType: this.farmingType,
        crop: this.crop
      })
      if (data) {
        data = data.map(o => {
          return o.system
        })
      }
      return data
    },
    curCrop() {
      const data = _.filter(ktblCrops, {
        farmingType: this.farmingType,
        crop: this.crop,
        system: this.system
      })
      if (data) {
        return data[0]
      } else {
        return data
      }
    },
    exists() {
      let bool = false
      if (this.$store && this.$store.curCrops && this.$store.curCrops.length) {
        this.$store.curCrops.forEach(crop => {
          if (this.variety && crop.name !== this.variety) {
            return (bool = false)
          } else if (crop.name === this.crop) {
            return (bool = true)
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
        let years = Array(settings.curYear - 2000)
          .fill(0)
          .map((e, i) => i + 2001)
        // check if crop already exists in current year (but not active), or exists for previous years
        const crops = await this.$db.find({
          selector: { name: this.variety || this.crop },
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
            id: `${this.curCrop.farmingType}::${this.curCrop.crop}::${
              this.curCrop.system
            }`,
            code: this.curCrop.code,
            years: years,
            scenario: settings.curScenario,
            farmingType: this.farmingType,
            region: settings.state_district,
            variety: this.variety
          })
          console.log(properties)
          const { data } = await this.$axios.post(
            'http://localhost:3001/crops/',
            properties,
            { progress: true }
          )

          await this.$db.bulkDocs(data)
        } else {
          // crop now has to be present, but not set to active -> activate
          const crop = _.find(this.$store.crops, c => {
            return (
              c.year === settings.curYear &&
              (c.variety === this.variety || c.crop === this.crop)
            )
          })
          console.log(crop)
          crop.active = true
          await this.$db.put(crop)
        }
        console.log(years)
      } catch (e) {
        console.log(e)
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
  background: #f5f5f5;
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
  border-color: #cccccc;
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
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='%23444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
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
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
