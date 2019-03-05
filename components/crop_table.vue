<template lang="html">
  <div class="cropsTable">
    <table >
      <thead>
        <tr>
          <th>Leistungs-/Kostenart</th>
          <th colspan="2">Menge</th>
          <th colspan="2">Preis</th>
          <th colspan="2">Betrag</th>
        </tr>
      </thead>
      <tbody>
        <!-- Revenues-->
        <tr v-for="(source, i) in cm.revenues" :key="revenues + i">
          <td>{{ source.name }}</td>
          <td contenteditable="true" @blur="update($event, 'revenues', i, 'amount')">{{ source.amount.value }}</td>
          <td>{{ source.amount.unit }}</td>
          <td contenteditable="true" @blur="update($event, 'revenues', i, 'price')">{{ source.price.value }}</td>
          <td>{{ source.price.unit }}</td>
          <td>{{ source.total.value }}</td>
          <td>{{ source.total.unit }}</td>
        </tr>
        <tr class="highlightRow">
          <td colspan="5">Summe Leistung</td>
          <td>{{ revenues }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Direct Costs-->
        <tr v-for="(source, i) in cm.directCosts" :key="directCosts + i">
          <td>{{ source.name }}</td>
          <td contenteditable="true" @blur="update($event, 'directCosts', i, 'amount')">{{ source.amount.value }}</td>
          <td>{{ source.amount.unit }}</td>
          <td contenteditable="true" @blur="update($event, 'directCosts', i, 'price')"> {{ source.price.value }}</td>
          <td>{{ source.price.unit }}</td>
          <td>{{ source.total.value}}</td>
          <td>{{ source.total.unit }}</td>
        </tr>
        <tr class="highlightRow">
          <td colspan="5">Summe Direktkosten</td>
          <td>{{ directCosts }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Other Variable Costs-->
        <tr v-for="(source, i) in cm.variableCosts" :key="variableCosts + i">
          <td>{{ source.name }}</td>
          <td contenteditable="true" @blur="update($event, 'variableCosts', i, 'amount')">{{ source.amount.value }}</td>
          <td>{{ source.amount.unit }}</td>
          <td contenteditable="true" @blur="update($event, 'variableCosts', i, 'price')">{{ source.price.value }}</td>
          <td>{{ source.price.unit }}</td>
          <td>{{ source.total.value }}</td>
          <td>{{ source.total.unit }}</td>
        </tr>
        <tr class="highlightRow">
          <td colspan="5">Summe variable Kosten</td>
          <td>{{ variableCosts }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Contribution Margin-->
        <tr class="highlightRow">
          <td colspan="5">Deckungsbeitrag</td>
          <td>{{ contributionMargin }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Fix Costs-->
        <tr v-for="(source, i) in cm.fixCosts" :key="fixCosts + i">
          <td>{{ source.name }}</td>
          <td contenteditable="true" @blur="update($event, 'fixCosts', i, 'amount')">{{ source.amount.value }}</td>
          <td>{{ source.amount.unit }}</td>
          <td contenteditable="true" @blur="update($event, 'fixCosts', i, 'price')">{{ source.price.value }}</td>
          <td>{{ source.price.unit }}</td>
          <td>{{ source.total.value }}</td>
          <td>{{ source.total.unit }}</td>
        </tr>
        <tr class="highlightRow">
          <td colspan="5">Summe Direkt- und Arbeitserledigungskosten</td>
          <td>{{ fixCosts }}</td>
          <td>€/ha</td>
        </tr>
        <!-- Contribution Margin 2-->
        <tr class="highlightRow">
          <td colspan="5">Direkt- und arbeitserledigungskostenfreie Leistung</td>
          <td>{{ contributionMargin2 }}</td>
          <td>€/ha</td>
        </tr>
      </tbody>
    </table>
    <div style="text-align:center;margin-top: 40px;">
      <button type="button" name="button" @click="remove">ENTFERNEN</button>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //selectedCrop: null
    }
  },
  computed: {
    cm() {
      return this.crop.contributionMargin
    },
    revenues() {
      const revenues = _.sumBy(this.cm.revenues, o => { return o.total.value })
      return _.round(revenues, 2)
    },
    directCosts() {
      const costs = _.sumBy(this.cm.directCosts, o => { return o.total.value })
      return _.round(costs, 2)
    },
    variableCosts() {
      const costs = _.sumBy(this.cm.variableCosts, o => { return o.total.value }) + this.directCosts
      return _.round(costs, 2)
    },
    fixCosts() {
      const costs = _.sumBy(this.cm.fixCosts, o => { return o.total.value })
      return _.round(costs, 2)
    },
    contributionMargin() {
      return _.round(this.revenues - this.variableCosts, 2)
    },
    contributionMargin2() {
      return _.round(this.contributionMargin - this.fixCosts, 2)
    }

  },
  props: {
    crop: {
      type: Object,
      required: true
    }
  },
  created() {
    this.$bus.$on('selectedCrop', selectedCrop => {
      //this.selectedCrop = selectedCrop
      //console.log(this.selectedCrop)
    })
  },
  methods: {
    async update(e, key, index, prop) {
      try {
        // get new value that was entered in to the table cell
        const newValue = Number(e.target.innerText)
        this.$set(this.cm[key][index][prop], 'value', newValue)
        // calculate new total amount
        const amount = this.cm[key][index].amount.value
        const price = this.cm[key][index].price.value
        const value = this.calcValue(amount,price,this.cm[key][index])
        this.$set(this.cm[key][index]['total'], 'value', _.round(value, 2))
        // store in Database
        await this.$db.put(this.crop)
      } catch (e) {
        console.log(e)
      }
    },
    calcValue(amount,price,entry) {
      try {
        const amountUnit = entry.amount.unit.split('/')
        const priceUnit = entry.price.unit.split('/')
        if (amountUnit.length < 2 && priceUnit.length < 2) {
          return amount * price
        } else if (amountUnit[0].toUpperCase() === priceUnit[1].toUpperCase()) {
          return amount * price
        } else {
          // we assume that this is a case of eur/1000 eur or similar
          console.log(priceUnit);
          const factor = Number(priceUnit[1].split(' ')[0])
          return price / factor * amount
        }
      } catch (e) {
        console.log(e);
        return amount * price
      }
    },
    async remove() {
      this.$db.remove(this.crop)
    }
  }
}
</script>
<style>

td:nth-child(2) {
  text-align: right;
}
td:nth-child(4) {
  text-align: right;
}
td:nth-child(6) {
  text-align: right;
}

.cropsTable {
  width: calc(100%-275px);
}

.highlightRow {
  height: 40px;
  font-family: 'Open Sans';
}
</style>
