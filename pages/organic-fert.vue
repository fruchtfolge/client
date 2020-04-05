<template>
  <div>
    <div>
      <addManure v-if="addManure" @closeAddManure="addManure = false" />
      <div v-if="manures" style="width: 100%;">
        <table class="table fert-tables">
          <caption class="caption">
            Nährstoffanfall
          </caption>
          <thead>
            <tr>
              <th colspan="3" />
              <th colspan="6">
                Nährstoffgehalte [kg/m³]
              </th>
              <th />
              <th style="background-color: #f5f5f5" />
            </tr>
            <tr>
              <th>Name</th>
              <th>Kategorie</th>
              <th>Menge [m³/a]</th>
              <th>N</th>
              <th>P<sub>2</sub>O<sub>5</sub></th>
              <th>K<sub>2</sub>O</th>
              <th>Mindestausnutzung N nach DüV [%]</th>
              <th>Stall- und Lagerverluste nach DüV [%]</th>
              <th>Mindestausnutzung N tatsächlich [%]</th>
              <th>Stall- und Lagerverluste tatsächlich [%]</th>
              <th style="background-color: #f5f5f5" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="manure in manures" :key="manure._id">
              <td>{{ manure.description }}</td>
              <td style="text-align: center;">
                {{ manure.manType }}
              </td>
              <td style="text-align: center;" contenteditable="true" @blur="save($event, 'sumFertAmount', manure._id)" @keydown.enter="$event.target.blur()">
                {{ manure.sumFertAmount }}
              </td>
              <td style="text-align: center;" contenteditable="true" @blur="save($event, 'n', manure._id)" @keydown.enter="$event.target.blur()">
                {{ manure.n }}
              </td>
              <td style="text-align: center;" contenteditable="true" @blur="save($event, 'p', manure._id)" @keydown.enter="$event.target.blur()">
                {{ manure.p }}
              </td>
              <td style="text-align: center;" contenteditable="true" @blur="save($event, 'k', manure._id)" @keydown.enter="$event.target.blur()">
                {{ manure.k }}
              </td>
              <td style="text-align: center;" contenteditable="true" @blur="save($event, 'minUsagePercent', manure._id)" @keydown.enter="$event.target.blur()">
                {{ manure.minUsagePercent }}
              </td>
              <td style="text-align: center;" contenteditable="true" @blur="save($event, 'storageLosses', manure._id)" @keydown.enter="$event.target.blur()">
                {{ manure.storageLosses || 20 }}
              </td>
              <td style="text-align: center;" contenteditable="true" @blur="save($event, 'minUsagePercentUser', manure._id)" @keydown.enter="$event.target.blur()">
                {{ manure.minUsagePercentUser || manure.minUsagePercent }}
              </td>
              <td style="text-align: center;" contenteditable="true" @blur="save($event, 'storageLossesUser', manure._id)" @keydown.enter="$event.target.blur()">
                {{ manure.storageLossesUser !== undefined ? manure.storageLossesUser : 20 }}
              </td>
              <td style="background-color: #f5f5f5">
                <input v-model="manure._deleted" style="-webkit-appearance: checkbox;" type="checkbox">
              </td>
            </tr>
            <tr v-if="hasManure">
              <td colspan="2">
                <b>Summe Gülle</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumManure.amount }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumManure.n }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumManure.p }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumManure.k }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumManure.minUsagePercent }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumManure.storageLosses || 20 }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumManure.minUsagePercentUser || sumManure.minUsagePercent }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumManure.storageLossesUser !== undefined ? sumManure.storageLossesUser : 20 }}</b>
              </td>
            </tr>
            <tr v-if="hasSolid">
              <td colspan="2">
                <b>Summe Festmist</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumSolid.amount }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumSolid.n }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumSolid.p }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumSolid.k }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumSolid.minUsagePercent }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumSolid.storageLosses || 20 }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumSolid.minUsagePercentUser || sumSolid.minUsagePercent }}</b>
              </td>
              <td style="text-align: center;">
                <b>{{ sumSolid.storageLossesUser !== undefined ? sumSolid.storageLossesUser : 20 }}</b>
              </td>
            </tr>
          </tbody>
        </table>
        <table v-if="hasManure" class="table fert-table">
          <caption class="caption">
            Gülle: Exportkosten und Lagerung
          </caption>
          <thead>
            <tr>
              <th>Bezeichnung</th>
              <th>Wert</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gülle Lagerkapazität [m³]</td>
              <td contenteditable="true" @blur="save($event, 'manStorage', 'settings')" @keydown.enter="$event.target.blur()">
                {{ settings.manStorage || sumManure.amount / 2 }}
              </td>
            </tr>
            <tr>
              <td>Gülle Exportkosten Frühjahr (bis Mai) [€/m³]</td>
              <td contenteditable="true" @blur="save($event, 'manPriceSpring', 'settings')" @keydown.enter="$event.target.blur()">
                {{ settings.manPriceSpring || 15 }}
              </td>
            </tr>
            <tr>
              <td>Gülle Exportkosten Herbst (ab Mai) [€/m³]</td>
              <td contenteditable="true" @blur="save($event, 'manPriceAutumn', 'settings')" @keydown.enter="$event.target.blur()">
                {{ settings.manPriceAutumn || 30 }}
              </td>
            </tr>
          </tbody>
        </table>
        <table v-if="hasSolid" class="table">
          <caption class="caption">
            Festmist: Exportkosten und Lagerung
          </caption>
          <thead>
            <tr>
              <th>Bezeichnung</th>
              <th>Wert</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mist Lagerkapazität [m³]</td>
              <td contenteditable="true" @blur="save($event, 'solidStorage', 'settings')" @keydown.enter="$event.target.blur()">
                {{ settings.solidStorage || sumSolid.amount / 4 }}
              </td>
            </tr>
            <tr>
              <td>Mist Exportkosten Frühjahr (bis Mai) [€/m³]</td>
              <td contenteditable="true" @blur="save($event, 'solidPriceSpring', 'settings')" @keydown.enter="$event.target.blur()">
                {{ settings.solidPriceSpring || 15 }}
              </td>
            </tr>
            <tr>
              <td>Mist Exportkosten Herbst (ab Mai) [€/m³]</td>
              <td contenteditable="true" @blur="save($event, 'solidPriceAutumn', 'settings')" @keydown.enter="$event.target.blur()">
                {{ settings.solidPriceAutumn || 30 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else style="text-align: center; margin-top: 100px;">
        <h3>Fügen Sie organischen Dünger durch Klicken auf den 'Hinzufügen'-Button hinzu.</h3>
      </div>
      <div style="text-align: center; margin-top: 40px;">
        <button class="addConstraint button" style="font-family: 'Open Sans Condensed';" @click="addManure = true">
          HINZUFÜGEN
        </button>
        <button v-if="manures" class="addConstraint button" style="font-family: 'Open Sans Condensed'; margin-left: 20px;" @click="remove">
          ENTFERNEN
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import notifications from '~/components/notifications'
import { sanitizeInput } from '~/components/helpers'

export default {
  components: {
    addManure: () => import('~/components/add_manure.vue')
  },
  data() {
    return {
      addManure: false,
      crops: null,
      constraints: null,
      manures: null,
      settings: null
    }
  },
  notifications: notifications,
  computed: {
    hasManure() {
      let flag = false
      if (this.manures) {
        this.manures.forEach(m => {
          if (m.manType.includes('Gülle') || m.manType.includes('Jauche'))
            flag = true
        })
      }
      return flag
    },
    sumManure() {
      if (this.hasManure) {
        return {
          amount: _.sumBy(this.manures, m => {
            if (m.manType.includes('Gülle') || m.manType.includes('Jauche'))
              return m.sumFertAmount
          }),
          n: this.calcAverageNut('n', 'Gülle', 'Jauche'),
          p: this.calcAverageNut('p', 'Gülle', 'Jauche'),
          k: this.calcAverageNut('k', 'Gülle', 'Jauche'),
          minUsagePercent: this.calcAverageNut(
            'minUsagePercent',
            'Gülle',
            'Jauche'
          ),
          storageLosses: this.calcAverageNut(
            'storageLosses',
            'Gülle',
            'Jauche'
          ),
          minUsagePercentUser: this.calcAverageNut(
            'minUsagePercentUser',
            'Gülle',
            'Jauche'
          ),
          storageLossesUser: this.calcAverageNut(
            'storageLossesUser',
            'Gülle',
            'Jauche'
          )
        }
      }
      return null
    },
    hasSolid() {
      let flag = false
      if (this.manures) {
        this.manures.forEach(m => {
          if (m.manType.includes('Festmist')) flag = true
        })
      }
      return flag
    },
    sumSolid() {
      if (this.hasSolid) {
        return {
          amount: _.sumBy(this.manures, m => {
            if (m.manType.includes('Festmist')) return m.sumFertAmount
          }),
          n: this.calcAverageNut('n', 'Festmist', 'Festmist'),
          p: this.calcAverageNut('p', 'Festmist', 'Festmist'),
          k: this.calcAverageNut('k', 'Festmist', 'Festmist'),
          minUsagePercent: this.calcAverageNut(
            'minUsagePercent',
            'Festmist',
            'Festmist'
          )
        }
      }
      return null
    }
  },
  created() {
    this.update()
    this.$bus.$on('changeCurrents', _.debounce(this.update, 200))
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
  },
  methods: {
    calcAverageNut(nut, type1, type2) {
      return _.round(
        _.sumBy(this.manures, m => {
          if (m.manType.includes(type1) || m.manType.includes(type2))
            return m[nut] * m.sumFertAmount
        }) /
          _.sumBy(this.manures, m => {
            if (m.manType.includes(type1) || m.manType.includes(type2))
              return m.sumFertAmount
          }),
        1
      )
    },
    update() {
      this.$set(this, 'manures', this.$store.curManure)
      this.$set(this, 'settings', this.$store.settings)
    },
    async save(e, type, id) {
      let newValue, doc
      try {
        doc = await this.$db.get(id)
      } catch (err) {
        console.log(err)
        this.showError()
      }
      try {
        // get new value that was entered into the table cell
        newValue = sanitizeInput(e.target.innerText)
        if (doc[type] === newValue) return
      } catch (err) {
        this.noNumber()
        e.target.innerText = doc[type]
        return
      }
      try {
        doc[type] = newValue
        await this.$db.put(doc)
        this.saveSuccess()
      } catch (err) {
        console.log(err)
        this.showError()
      }
    },
    async remove() {
      try {
        const deleted = this.manures.filter(manure => manure._deleted)
        if (deleted && deleted.length) {
          await this.$db.bulkDocs(deleted)
          this.saveSuccess()
        } else {
          this.showInfo({
            title: 'NICHTS AUSGEWÄHLT',
            message:
              'Setzen Sie einen Haken in der Tabelle rechts neben der Gülle- bzw. Festmistart die Sie löschen möchten. Klicken Sie anschließend auf den "Entfernen"-Button'
          })
        }
      } catch (e) {
        this.showError()
        console.log(e)
      }
    }
  }
}
</script>
<style>
.fert-tables {
  width: 100%;
}
</style>
