<template>
  <div>
    <div>
      <addManure v-if="addManure" @closeAddManure="addManure = false" />
      <div v-if="manures" style="width: 100%;">
        <table>
          <thead>
            <tr>
              <th colspan="3" />
              <th colspan="3">
                Nährstoffgehalte [kg/m<sup>3</sup>]
              </th>
              <th />
              <th style="background-color: #f5f5f5" />
            </tr>
            <tr>
              <th>Name</th>
              <th>Kategorie</th>
              <th>Menge [m<sup>3</sup>/a]</th>
              <th>N</th>
              <th>P<sub>2</sub>O<sub>5</sub></th>
              <th>K<sub>2</sub>O</th>
              <th>Mindestausnutzung N [%]</th>
              <th style="background-color: #f5f5f5" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="manure in manures" :key="manure._id">
              <td>{{ manure.description }}</td>
              <td style="text-align: center;">
                {{ manure.manType }}
              </td>
              <td style="text-align: center;">
                {{ manure.sumFertAmount }}
              </td>
              <td style="text-align: center;">
                {{ manure.n }}
              </td>
              <td style="text-align: center;">
                {{ manure.p }}
              </td>
              <td style="text-align: center;">
                {{ manure.k }}
              </td>
              <td style="text-align: center;">
                {{ manure.minUsagePercent }}
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
              <td />
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
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else style="text-align: center; margin-top: 100px;">
        <h3>Fügen Sie organischen Dünger durch Klicken auf den 'Hinzufügen'-Button hinzu.</h3>
      </div>
      <div style="text-align: center; margin-top: 40px;">
        <button class="addConstraint" style="font-family: 'Open Sans Condensed';" @click="addManure = true">
          HINZUFÜGEN
        </button>
        <button v-if="manures" class="addConstraint" style="font-family: 'Open Sans Condensed'; margin-left: 20px;" @click="remove">
          ENTFERNEN
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {
    addManure: () => import('~/components/add_manure.vue')
  },
  data() {
    return {
      addManure: false,
      crops: null,
      constraints: null,
      manures: null
    }
  },
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
      if (this.hasManure) {
        return {
          amount: _.sumBy(this.manures, m => {
            if (
              m.manType.includes('Festmist') ||
              m.manType.includes('Festmist')
            )
              return m.sumFertAmount
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
      console.log(this.manures)
    },
    async remove() {
      try {
        if (this.manures) {
          const deleted = this.manures.filter(manure => manure._deleted)
          await this.$db.bulkDocs(deleted)
        } else {
          console.log('Nothing to delete.')
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style>
</style>
