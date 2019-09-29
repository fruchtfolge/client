<template lang="html">
  <div>
    <div class="blur" />
    <div class="manureBox">
      <div class="inputs">
        <h2 class="infoText">
          NEUEN DÜNGER HINZUFÜGEN
        </h2>
        <label for="add.manure.category">Kategorie</label>
        <select id="add.manure.category" v-model="category" class="dropdown" @change="reset('category')">
          <option disabled value="">
            Kategorie
          </option>
          <option v-for="(option, i) in categories" :key="i" :value="option">
            {{ option }}
          </option>
        </select>
        <label for="add.manure.description">Bezeichnung</label>
        <select id="add.manure.description" v-model="description" class="dropdown" @change="reset('description')">
          <option disabled value="">
            Bezeichnung
          </option>
          <option v-for="(option, i) in descriptions" :key="i" :value="option">
            {{ option }}
          </option>
        </select>
        <label for="add.manure.type">Gülle/Festmist</label>
        <select id="add.manure.type" v-model="manType" class="dropdown">
          <option disabled value="">
            Gülle/Festmist
          </option>
          <option v-for="(option, i) in types" :key="i" :value="option">
            {{ option }}
          </option>
        </select>
        <label for="add.manure.amount">{{ amountLabel }}</label>
        <input id="add.manure.amount" v-model="amount" type="number" class="input" @keyup.enter="addManure">
      </div>
      <p v-if="curError" style="text-align: center; margin-top: 30px; color:red;">
        {{ curError }}
      </p>
      <button v-if="!curError" class="buttonOk" @click="addManure">
        ÜBERNEHMEN
      </button>
      <button class="buttonCancel" @click="cancel">
        ABBRECHEN
      </button>
    </div>
  </div>
</template>

<script>
import duevValues from '~/assets/js/duev_values.js'
import Manure from '~/constructors/Manure.js'

export default {
  data() {
    return {
      category: 'Gärreste',
      description: 'Biogasgärreste',
      manType: 'Gülle',
      amount: 1000,
      possTypes: [
        'Gülle',
        'Jauche. wenig Einstreu',
        'Festmist. wenig Einstreu',
        'Jauche. mittl. Einstreu',
        'Festmist. mittl. Einstreu',
        'Jauche. viel Einstreu',
        'Festmist. viel Einstreu'
      ]
    }
  },
  computed: {
    amountLabel() {
      if (this.category === 'Gärreste') return 'Menge in m3'
      return 'Anzahl Tierplätze'
    },
    categories() {
      return _.uniq(duevValues.map(v => v.category))
    },
    descriptions() {
      if (this.category) {
        return duevValues
          .filter(v => v.category === this.category)
          .map(v => v.description)
      }
      return []
    },
    types() {
      if (this.category && this.description) {
        const entry = _.find(
          duevValues,
          v =>
            v.category === this.category && v.description === this.description
        )
        return this.possTypes.filter(t => entry[t])
      }
      return []
    },
    curError() {
      if (!this.category) return 'Bitte wählen Sie eine Dungkategorie aus.'
      else if (!this.description)
        return 'Bitte wählen Sie eine Bezeichnung für den Dünger.'
      else if (!this.manType)
        return 'Bitte wählen Sie aus, ob es sich um Gülle oder Festmist handelt.'
      return ''
    }
  },
  methods: {
    reset(setting) {
      if (setting === 'category') {
        this.description = null
        this.manType = null
      } else if (setting === 'description') {
        this.manType = null
      }
    },
    async addManure() {
      try {
        const settings = await this.$db.get('settings')
        const duevSettings = _.find(
          duevValues,
          v =>
            v.category === this.category && v.description === this.description
        )

        const manure = new Manure({
          ...duevSettings,
          year: settings.curYear,
          scenario: settings.curScenario,
          manType: this.manType,
          amount: this.amount
        })
        // store new manure type in db
        // console.log(manure)
        await this.$db.post(manure)
        this.$emit('closeAddManure')
      } catch (e) {
        console.log(e)
      }
    },
    cancel() {
      this.$emit('closeAddManure')
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

.manureBox {
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
  background: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
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
