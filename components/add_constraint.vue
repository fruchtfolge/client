<template lang="html">
  <div>
    <div class="blur">
      <div class="constraintBox box">
        <div class="inputs">
          <h2 class="infoText">
            NEUE NEBENBEDINGUNG HINZUFÜGEN
          </h2>
          <label class="label" for="add.constraint.crop1">Kultur</label>
          <select id="add.constraint.crop1" v-model="crop1" class="dropdown select">
            <option disabled value="">
              Kultur
            </option>
            <option v-for="(crop, i) in crops" :key="i" :value="crop">
              {{ crop.name }}
            </option>
            <!--
            <option :value="allCrops">
              Alle Kulturen
            </option>
            <option :value="allCropCombis">
              Alle Kombinationen aus Kulturen
            </option>
            <option :value="efa">
              Ökologische Vorrangfläche
            </option>
          -->
          </select>
          <label class="label" for="add.constraint.crop2">und Kultur (optional)</label>
          <select id="add.constraint.crop2" v-model="crop2" class="dropdown select">
            <option disabled value="">
              Kultur
            </option>
            <option value="" selected />
            <option v-for="(crop, i) in crops" :key="i" :value="crop">
              {{ crop.name }}
            </option>
          </select>
          <label class="label" for="add.constraint.crop4">soll(en) insgesamt weniger/mehr als</label>
          <select id="add.constraint.crop4" v-model="operator" class="dropdown select">
            <option disabled value="">
              maximal/mehr
            </option>
            <option value="<">
              weniger als
            </option>
            <option value=">">
              mehr als
            </option>
          </select>
          <label class="label" for="add.constraint.name">Fläche in {{ sizeType }} betragen.</label>
          <input id="add.constraint.name" v-model="area" type="number" class="input" @keyup.enter="addConstraint">
          <label class="label" for="add.constraint.crop4">Flächeneinheit</label>
          <select id="add.constraint.crop4" v-model="sizeType" class="dropdown select">
            <option value="ha">
              ha
            </option>
            <!--
            <option value="Prozent">
              Prozent der Gesamtfläche
            </option>
          -->
          </select>
        </div>
        <p v-if="!crop1" style="text-align: center; margin-top: 30px; color:red;">
          Bitte Kultur auswählen.
        </p>
        <div class="buttons-modal">
          <button v-if="crop1" class="buttonOk button" @click="addConstraint">
            ÜBERNEHMEN
          </button>
          <button class="buttonCancel button" @click="cancel">
            ABBRECHEN
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Constraint from '~/constructors/Constraint.js'
import notifications from '~/components/notifications'

export default {
  props: {
    crops: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      crop1: null,
      crop2: null,
      allCrops: {
        name: 'Alle Kulturen',
        code: 'allCrops'
      },
      allCropCombis: {
        name: 'Alle Kombinationen aus Kulturen',
        code: 'allCropCombis'
      },
      efa: {
        name: 'Ökologische Vorrangfläche',
        code: 'efa'
      },
      operator: '>',
      sizeType: 'ha',
      area: 0
    }
  },
  notifications: notifications,
  methods: {
    async addConstraint() {
      try {
        const settings = await this.$db.get('settings')

        const constraint = new Constraint({
          year: settings.curYear,
          scenario: settings.curScenario,
          crop1: this.crop1.name,
          crop2: this.crop2 ? this.crop2.name : '',
          crop1Code: this.crop1 ? this.crop1.code : '',
          crop2Code: this.crop2 ? this.crop2.code : '',
          operator: this.operator,
          sizeType: this.sizeType,
          area: this.area
        })
        // store new constraint in database
        // console.log(constraint)
        await this.$db.post(constraint)
        this.$emit('closeAddConstraint')
        this.saveSuccess()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    },
    cancel() {
      this.$emit('closeAddConstraint')
    }
  }
}
</script>

<style scoped>
.constraintBox {
  width: 400px;
  height: 580px;
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
  width: 130px;
}

.buttonOk:hover {
  background-color: #79ae98;
  color: white;
}

.buttonCancel {
  width: 130px;
}

.buttonCancel:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
