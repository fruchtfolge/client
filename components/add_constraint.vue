<template lang="html">
  <div>
    <div class="blur" />
    <div class="constraintBox box">
      <div class="inputs">
        <h2 class="infoText">
          NEUE NEBENBEDINGUNG HINZUFÜGEN
        </h2>
        <label for="add.constraint.crop1">Kultur</label>
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
        <label for="add.constraint.crop2">und Kultur (optional)</label>
        <select id="add.constraint.crop2" v-model="crop2" class="dropdown select">
          <option disabled value="">
            Kultur
          </option>
          <option value="" selected />
          <option v-for="(crop, i) in crops" :key="i" :value="crop">
            {{ crop.name }}
          </option>
        </select>
        <label for="add.constraint.crop4">soll(en) insgesamt weniger/mehr als</label>
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
        <label for="add.constraint.name">Fläche in {{ sizeType }} betragen.</label>
        <input id="add.constraint.name" v-model="area" type="number" class="input" @keyup.enter="addConstraint">
        <label for="add.constraint.crop4">Flächeneinheit</label>
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
      <button v-if="crop1" class="buttonOk button" @click="addConstraint">
        ÜBERNEHMEN
      </button>
      <button class="buttonCancel button" @click="cancel">
        ABBRECHEN
      </button>
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
  background: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
  background-position: 100% 50%;
  background-repeat: no-repeat;
  border-color: rgb(193, 187, 187);
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
