<template lang="html">
  <div class="cropsTable">
    <table class="table">
      <thead>
        <tr>
          <th>Leistungs-/Kostenart</th>
          <th colspan="2">
            Menge
          </th>
          <th colspan="2">
            Preis
          </th>
          <th colspan="2">
            Betrag
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Revenues-->
        <tr v-for="(source, i) in cm.revenues" :key="`revenues_${i}`">
          <td>{{ source.name }}</td>
          <td contenteditable="true" @blur="update($event, 'revenues', i, 'amount')" @keydown.enter="$event.target.blur()">
            {{ source.amount.value }}
          </td>
          <td>{{ source.amount.unit }}</td>
          <td contenteditable="true" @blur="update($event, 'revenues', i, 'price')" @keydown.enter="$event.target.blur()">
            {{ source.price.value }}
          </td>
          <td>{{ source.price.unit }}</td>
          <td>{{ source.total.value }}</td>
          <td>{{ source.total.unit }}</td>
        </tr>
        <tr class="highlightRow">
          <td colspan="5">
            Summe Leistung
          </td>
          <td>{{ revenues }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Direct Costs-->
        <tr v-for="(source, i) in cm.directCosts" :key="`directCosts_${i}`">
          <td>{{ source.name }}</td>
          <td contenteditable="true" @blur="update($event, 'directCosts', i, 'amount')" @keydown.enter="$event.target.blur()">
            {{ source.amount.value }}
          </td>
          <td>{{ source.amount.unit }}</td>
          <td contenteditable="true" @blur="update($event, 'directCosts', i, 'price')" @keydown.enter="$event.target.blur()">
            {{ source.price.value }}
          </td>
          <td>{{ source.price.unit }}</td>
          <td>{{ source.total.value }}</td>
          <td>{{ source.total.unit }}</td>
        </tr>
        <tr class="highlightRow">
          <td colspan="5">
            Summe Direktkosten
          </td>
          <td>{{ directCosts }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Other Variable Costs-->
        <tr v-for="(source, i) in cm.variableCosts" :key="`variableCosts_${i}`">
          <td>{{ source.name }}</td>
          <td contenteditable="true" @blur="update($event, 'variableCosts', i, 'amount')" @keydown.enter="$event.target.blur()">
            {{ source.amount.value }}
          </td>
          <td>{{ source.amount.unit }}</td>
          <td contenteditable="true" @blur="update($event, 'variableCosts', i, 'price')" @keydown.enter="$event.target.blur()">
            {{ source.price.value }}
          </td>
          <td>{{ source.price.unit }}</td>
          <td>{{ source.total.value }}</td>
          <td>{{ source.total.unit }}</td>
        </tr>
        <tr class="highlightRow">
          <td colspan="5">
            Summe variable Kosten
          </td>
          <td>{{ variableCosts }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Contribution Margin-->
        <tr class="highlightRow">
          <td colspan="5">
            Deckungsbeitrag
          </td>
          <td>{{ contributionMargin }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Fix Costs-->
        <tr v-for="(source, i) in cm.fixCosts" :key="`fixCosts_${i}`">
          <td>{{ source.name }}</td>
          <td contenteditable="true" @blur="update($event, 'fixCosts', i, 'amount')" @keydown.enter="$event.target.blur()">
            {{ source.amount.value }}
          </td>
          <td>{{ source.amount.unit }}</td>
          <td contenteditable="true" @blur="update($event, 'fixCosts', i, 'price')" @keydown.enter="$event.target.blur()">
            {{ source.price.value }}
          </td>
          <td>{{ source.price.unit }}</td>
          <td>{{ source.total.value }}</td>
          <td>{{ source.total.unit }}</td>
        </tr>
        <tr class="highlightRow">
          <td colspan="5">
            Summe Direkt- und Arbeitserledigungskosten
          </td>
          <td>{{ fixCosts }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Contribution Margin 2-->
        <tr class="highlightRow">
          <td colspan="5">
            Direkt- und arbeitserledigungskostenfreie Leistung
          </td>
          <td>{{ contributionMargin2 }}</td>
          <td>€/ha</td>
        </tr>
        <tr>
          <td colspan="7" style="color: grey;">
            Quelle der Daten: KTBL Anwendung Leistungs-Kostenrechnung Pflanzenbau
          </td>
        </tr>
      </tbody>
    </table>
    <div style="text-align:center;margin-top: 40px">
      <button class="button" type="button" name="button" @click="remove">
        ENTFERNEN
      </button>
    </div>
  </div>
</template>
<script>
import notifications from '~/components/notifications'
import { sanitizeInput } from '~/components/helpers'

export default {
  props: {
    crop: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // selectedCrop: null
    }
  },
  notifications: notifications,
  computed: {
    cm() {
      return this.crop.contributionMargin
    },
    revenues() {
      const revenues = _.sumBy(this.cm.revenues, o => {
        return o.total.value
      })
      return _.round(revenues, 2)
    },
    directCosts() {
      const costs = _.sumBy(this.cm.directCosts, o => {
        return o.total.value
      })
      return _.round(costs, 2)
    },
    variableCosts() {
      const costs =
        _.sumBy(this.cm.variableCosts, o => {
          return o.total.value
        }) + this.directCosts
      return _.round(costs, 2)
    },
    fixCosts() {
      const costs = _.sumBy(this.cm.fixCosts, o => {
        return o.total.value
      })
      return _.round(costs, 2)
    },
    contributionMargin() {
      return _.round(this.revenues - this.variableCosts, 2)
    },
    contributionMargin2() {
      return _.round(this.contributionMargin - this.fixCosts, 2)
    }
  },
  created() {
    this.$bus.$on('selectedCrop', selectedCrop => {
      // this.selectedCrop = selectedCrop
      // console.log(this.selectedCrop)
    })
  },
  methods: {
    async update(e, key, index, prop) {
      let newValue
      try {
        // get new value that was entered into the table cell
        newValue = sanitizeInput(e.target.innerText)
        if (newValue === this.cm[key][index][prop].value) return
      } catch (err) {
        this.noNumber()
        e.target.innerText = this.cm[key][index][prop].value
        return
      }
      try {
        this.$set(this.cm[key][index][prop], 'value', newValue)
        // calculate new total amount
        const amount = this.cm[key][index].amount.value
        const price = this.cm[key][index].price.value
        const value = this.calcValue(amount, price, this.cm[key][index])
        this.$set(this.cm[key][index].total, 'value', _.round(value, 2))
        // get rev from database and update
        const doc = await this.$db.get(this.crop._id)
        this.crop._rev = doc._rev
        // store in Database
        await this.$db.put(this.crop)
        this.saveSuccess()
      } catch (e) {
        this.saveError()
        console.log(e)
      }
    },
    calcValue(amount, price, entry) {
      try {
        const amountUnit = entry.amount.unit.split('/')
        const priceUnit = entry.price.unit.split('/')
        if (amountUnit.length < 2 && priceUnit.length < 2) {
          return amount * price
        } else if (amountUnit[0].toUpperCase() === priceUnit[1].toUpperCase()) {
          return amount * price
        } else {
          // we assume that this is a case of eur/1000 eur or similar
          // console.log(priceUnit)
          const factor = Number(priceUnit[1].split(' ')[0])
          return (price / factor) * amount
        }
      } catch (e) {
        console.log(e)
        return amount * price
      }
    },
    async remove() {
      try {
        this.showCropRemoveSucc()
        await this.$db.remove(this.crop)
      } catch (e) {
        this.showError()
        console.log(e)
      }
    }
  }
}
</script>
<style>
.cropsTable td:nth-child(2) {
  text-align: right;
}
.cropsTable td:nth-child(4) {
  text-align: right;
}
.cropsTable td:nth-child(6) {
  text-align: right;
}

.cropsTable {
  width: calc(100% - 275px);
}

.highlightRow {
  height: 40px;
  font-family: Inter;
}
</style>
