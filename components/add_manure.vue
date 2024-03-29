<template lang="html">
  <div>
    <div class="blur">
      <div class="box">
        <div class="inputs">
          <h2 class="infoText">
            NEUEN DÜNGER HINZUFÜGEN
          </h2>
          <label class="label" for="add.manure.category">Kategorie</label>
          <select id="add.manure.category" v-model="category" class="dropdown select" @change="reset('category')">
            <option disabled value="">
              Kategorie
            </option>
            <option v-for="(option, i) in categories" :key="i" :value="option">
              {{ option }}
            </option>
          </select>
          <label class="label" for="add.manure.description">Bezeichnung</label>
          <select id="add.manure.description" v-model="description" class="dropdown select" @change="reset('description')">
            <option disabled value="">
              Bezeichnung
            </option>
            <option v-for="(option, i) in descriptions" :key="i" :value="option">
              {{ option }}
            </option>
          </select>
          <label class="label" for="add.manure.type">Gülle/Festmist</label>
          <select id="add.manure.type" v-model="manType" class="dropdown select">
            <option disabled value="">
              Gülle/Festmist
            </option>
            <option v-for="(option, i) in types" :key="i" :value="option">
              {{ option }}
            </option>
          </select>
          <label class="label" for="add.manure.amount">{{ amountLabel }}</label>
          <input id="add.manure.amount" v-model="amount" type="number" class="input" @keyup.enter="addManure">
        </div>
        <p v-if="curError" style="text-align: center; margin-top: 30px; color:red;">
          {{ curError }}
        </p>
        <button v-if="!curError" class="buttonOk button" @click="addManure">
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
import duevValues from '~/assets/js/duev_values.js'
import Manure from '~/constructors/Manure.js'
import notifications from '~/components/notifications'

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
  notifications: notifications,
  computed: {
    amountLabel() {
      if (this.category === 'Gärreste') return 'Menge in m³'
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
        this.saveSuccess()
      } catch (e) {
        console.log(e)
        this.showError()
      }
    },
    cancel() {
      this.$emit('closeAddManure')
    }
  }
}
</script>

<style scoped>
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
