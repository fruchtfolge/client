<template lang="html">
  <div>
    <div>
      <div v-show="shown">
        <div v-if="difference !== 0">
          <h2>Differenz zum Optimum</h2>
          <h2 class="number" :class="{ positive: difference > 0 }">
            {{ format(difference) }}
          </h2>
        </div>
        <div class="">
          <p v-for="(deviation,i) in deviations" :key="i">
            {{ deviation }}
          </p>
        </div>
      </div>
    </div>
    <div class="greening-check">
      <h2>Greening</h2>
      <div style="display: inline-block;">
        <div class="greening-entries">
          <div :class="{ check: !brokeEfa, fail: brokeEfa }" />
          <p>Ökologische Vorrangfläche: Über 5% des AL</p>
        </div>
        <div class="greening-entries">
          <div :class="{ check: !broke75, fail: broke75 }" />
          <p>Diversifizierung: Keine Kulturgruppe > 75% des AL</p>
        </div>
        <div class="greening-entries">
          <div :class="{ check: !broke95, fail: broke95 }" />
          <p>Diversifizierung: Keine komb. der Kulturgruppen > 95% des AL</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    shares: {
      type: Object,
      required: true
    },
    plots: {
      type: Array,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      dataset: undefined,
      shown: false,
      curYear: 2019,
      optimum: 0,
      totLand: 0,
      arableLand: 0,
      greenLand: 0
    }
  },
  computed: {
    difference() {
      console.log('Optimum: ' + this.optimum)
      console.log('Total: ' + this.total)
      if (isNaN(this.optimum - this.total)) {
        return 'Keine Empfehlung vorhanden.'
      } else {
        return _.round(this.total - this.optimum, 2)
      }
    },
    deviations() {
      const deviations = []
      const permPastCropCodes = [459, 480, 492, 57, 567, 572, 592, 972]
      this.plots.forEach(plot => {
        const cropCode = Number(plot.selectedCrop)
        if (!plot.matrix[this.curYear]) return
        const data = plot.matrix[this.curYear][cropCode]
        // get selected crop and previous crop
        // const selectedCrop = _.find(this.$store.curCrops, ['code', plot.selectedCrop])
        // const prevCrop = _.find(this.$store.curCrops, ['name', plot.prevCrop1])
        const croppingFactor = data.croppingFactor
        // show warning if cropping factor is below 6
        if (croppingFactor <= 0.6) {
          deviations.push(
            `${plot.name}: ${data.name} ungünstige Nachfrucht von ${
              plot.prevCrop1
            }`
          )
        } else if (croppingFactor === 0) {
          deviations.push(
            `${plot.name}: ${data.name} keine mögliche Nachfrucht von ${
              plot.prevCrop1
            }`
          )
        }
        if (!data.rotBreakHeld) {
          deviations.push(
            `${plot.name}: Anbaupause von ${data.name} nicht eingehalten`
          )
        }
        if (plot.permPast && permPastCropCodes.indexOf(cropCode) === -1) {
          console.log(cropCode)
          deviations.push(
            `${plot.name}: Umbruch von Dauergrünland nicht erlaubt.`
          )
        }
      })
      // only apply 5% greening rule if more than 15ha
      if (this.brokeEfa && this.arableLand > 15) {
        deviations.push(
          `Greening: Ökologische Vorrangfläche unter 5% (${
            this.greeningEfa
          }ha statt ${this.fivePercent}ha)`
        )
      }
      // no crop more than 75%, if farm has more than 10ha
      if (this.broke75 && this.arableLand > 10) {
        deviations.push(`Greening: Über 75% des AL mit (${this.broke75}ha`)
      }
      // no crop combi more than 95%, if farm has more than 30ha
      if (this.broke95 && this.arableLand > 30) {
        deviations.push(`Greening: Über 95% des AL mit (${this.broke95}ha`)
      }
      return deviations
      // show error if cropping factor is 0
      // show error if rotational break is not met
      // show error if maximum share of crop is surpassed
      // show error if soil quality is not met
    },
    fivePercent() {
      return _.round(this.arableLand * 0.05, 2)
    },
    sevenFivePercent() {
      return _.round(this.arableLand * 0.75, 2)
    },
    ninceFivePercent() {
      return _.round(this.arableLand * 0.95, 2)
    },
    brokeEfa() {
      if (this.greeningEfa < this.fivePercent) {
        return true
      }
      return false
    },
    broke75() {
      const props = Object.keys(this.greening75)
      let flag = false
      props.forEach(share => {
        if (this.greening75[share] >= this.sevenFivePercent) flag = share
      })
      return flag
    },
    broke95() {
      const props = Object.keys(this.greening95)
      let flag = false
      props.forEach(share => {
        props.forEach(share2 => {
          if (share === share2) return
          if (
            this.greening95[share] + this.greening95[share2] >=
            this.ninceFivePercent
          ) {
            flag = share + ' ' + share2
          }
        })
      })
      return flag
    },
    greeningEfa() {
      let efa = 0
      for (const cropCode in this.shares[this.curYear]) {
        // find crop for the given code
        const share = this.shares[this.curYear][cropCode]
        const crop = _.find(this.$store.curCrops, ['code', cropCode])
        if (crop) {
          efa += share * crop.efaFactor
        }
      }
      // add Ecological focus area from catch crops
      this.plots.forEach(plot => {
        if (plot.catchCrop) {
          efa += plot.size
        }
      })
      return _.round(efa, 2)
    },
    greening75() {
      const shares = {}
      for (const cropCode in this.shares[this.curYear]) {
        // find crop for the given code
        const share = this.shares[this.curYear][cropCode]
        const crop = _.find(this.$store.curCrops, ['code', Number(cropCode)])
        if (crop) {
          if (!shares[crop.cropGroup]) shares[crop.cropGroup] = share
          else shares[crop.cropGroup] += share
        }
      }
      return shares
    },
    greening95() {
      const shares = {}
      for (const cropCode in this.shares[this.curYear]) {
        // find crop for the given code
        const share = this.shares[this.curYear][cropCode]
        const crop = _.find(this.$store.curCrops, ['code', Number(cropCode)])
        if (crop) {
          if (!shares[crop.cropGroup]) shares[crop.cropGroup] = share
          else shares[crop.cropGroup] += share
        }
      }
      return shares
    }
  },
  mounted() {
    this.curYear = this.$store.curYear
    this.shown = true
    this.getValues(this.plots)
  },
  methods: {
    beforeEnter(el) {
      el.style.height = '0px'
    },
    enter(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    beforeLeave(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    leave(el) {
      el.style.height = '0px'
    },
    expand(displayGroup) {
      if (!this.shown[displayGroup]) {
        this.shown[displayGroup] = true
      } else {
        this.shown[displayGroup] = false
      }
    },
    getValues(plots) {
      let optimum = 0
      let arableLand = 0
      let totLand = 0
      let greenLand = 0
      plots.forEach(plot => {
        const code = plot.recommendation
        if (code) {
          const plotData = plot.matrix[this.curYear][code]
          const grossMargin = plotData.grossMargin
          optimum += grossMargin
          if (plot.recommendedCatchCrop) {
            optimum += -plot.matrix.catchCropCosts
          }
        }
        totLand += plot.size
        if (plot.permPast) {
          greenLand += plot.size
        } else {
          arableLand += plot.size
        }
      })
      this.optimum = optimum
      this.totLand = totLand
      this.greenLand = greenLand
      this.arableLand = arableLand
      console.log(this.totLand)
    },
    format(number) {
      const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
      })
      return formatter.format(number)
    }
  }
}
</script>
<style>
.greening-check {
  margin-bottom: 0px;
}

.greening-check p {
  display: inline-flex;
  margin-top: 5px;
  margin-bottom: 5px;
}

.greening-entries {
  text-align: left;
}
.check {
  width: 20px;
  height: 20px;
  display: inline-flex;
  margin-right: 10px;
  vertical-align: text-top;
  background: url('~/assets/img/check.svg');
}
.fail {
  width: 20px;
  height: 20px;
  display: inline-flex;
  margin-right: 10px;
  vertical-align: text-top;
  background: url('~/assets/img/fail.svg');
}
.number {
  margin-top: -20px;
  letter-spacing: 0.05em;
  color: rgb(187, 67, 29);
}
.positive {
  color: rgb(121, 173, 151);
}
</style>
