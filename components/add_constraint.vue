<template lang="html">
  <div>
    <div class="blur"></div>
    <div class="constraintBox">
      <div class="inputs">
        <h2 class="infoText">NEUE NEBENBEDINGUNG HINZUFÜGEN</h2>
        <label for="add.constraint.crop1">Kultur</label>
        <select class="dropdown" id="add.constraint.crop1" v-model="crop1">
          <option disabled value="">Kultur</option>
          <option v-for="(crop, i) in crops" :key="i" :value="crop">{{ crop.name }}</option>
          <option :value="allCrops">Alle Kulturen</option>
          <option :value="allCropCombis">Alle Kombinationen aus Kulturen</option>
          <option :value="efa">Ökologische Vorrangfläche</option>
        </select>
        <label for="add.constraint.crop2">und Kultur (optional)</label>
        <select class="dropdown" id="add.constraint.crop2" v-model="crop2">
          <option disabled value="">Kultur</option>
          <option value="" selected></option>
          <option v-for="(crop, i) in crops" :key="i" :value="crop">{{ crop.name }}</option>
        </select>
        <label for="add.constraint.crop4">weniger/mehr</label>
        <select class="dropdown" id="add.constraint.crop4" v-model="operator">
          <option disabled value="">weniger/mehr</option>
          <option value="<">weniger als</option>
          <option value=">">mehr als</option>
        </select>
          <label for="add.constraint.crop4">Flächeneinheit</label>
        <select class="dropdown" id="add.constraint.crop4" v-model="sizeType">
          <option value="ha">ha</option>
          <option value="Prozent">Prozent der Gesamtfläche</option>
        </select>
        <label for="add.constraint.name">Fläche in {{sizeType}}</label>
        <input type="number" id="add.constraint.name" class="input" v-model="area" @keyup.enter="addConstraint">
      </div>
      <p v-if="!crop1" style="text-align: center; margin-top: 30px; color:red;">Bitte Kultur auswählen.</p>
      <button v-if="crop1" class="buttonOk" @click="addConstraint">ÜBERNEHMEN</button>
      <button class="buttonCancel" @click="cancel">ABBRECHEN</button>
    </div>
  </div>
</template>

<script>
import Constraint from '~/constructors/Constraint.js'

export default {
  props: ['crops'],
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
        console.log(constraint);
        await this.$db.post(constraint)
        this.$emit('closeAddConstraint')
      } catch (e) {
        console.log(e);
      }
    },
    cancel() {
      this.$emit('closeAddConstraint')
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

.constraintBox {
  position: absolute;
  width: 400px;
  height: 580px;
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
