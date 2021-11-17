<template lang="html">
  <div>
    <div class="blur">
      <div class="box">
        <div class="inputs">
          <h2 class="infoText">
            NEUE KULTUR HINZUFÜGEN
          </h2>
          <label for="add.crop.farmingType">Anbauverfahren</label>
          <select id="add.crop.farmingType" v-model="farmingType" class="dropdown select">
            <option disabled value="">
              Anbauverfahren
            </option>
            <option v-for="(typeOption, i) in farmingTypes" :key="i" :value="typeOption">
              {{ typeOption }}
            </option>
          </select>
          <label for="add.crop.crop">Kultur</label>
          <select id="add.crop.crop" v-model="crop" class="dropdown select">
            <option disabled value="">
              Kultur
            </option>
            <option v-for="(cropOption, i) in crops" :key="i" :value="cropOption">
              {{ cropOption }}
            </option>
          </select>
          <label for="add.crop.system">System</label>
          <select id="add.crop.system" v-model="system" class="dropdown select">
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
        <button v-if="!exists" class="buttonOk button" @click="addCrop">
          ÜBERNEHMEN
        </button>
        <button class="buttonCancel button" @click="cancel">
          ABBRECHEN
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ktblCrops from '~/assets/js/crops.js'
import notifications from '~/components/notifications'

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
  notifications: notifications,
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
          if (
            (crop.name === this.crop || crop.name === this.variety) &&
            crop.variety === this.variety
          ) {
            bool = true
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
          // console.log(properties)
          const { data } = await this.$axios.post(
            process.env.baseUrl + 'crops/',
            properties,
            {
              progress: true
            }
          )

          await this.$db.bulkDocs(data)
          this.showCropSucc()
        } else {
          // crop now has to be present, but not set to active -> activate
          const crop = _.find(this.$store.crops, c => {
            return (
              c.year === settings.curYear &&
              (c.variety === this.variety || c.crop === this.crop)
            )
          })
          // console.log(crop)
          crop.active = true
          await this.$db.put(crop)
          this.showCropSucc()
        }
        // console.log(years)
      } catch (e) {
        this.showError()
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
.box {
  width: 400px;
  height: 500px;
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
