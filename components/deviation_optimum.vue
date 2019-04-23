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
    <div v-if="arableLand >= 10" class="greening-check">
      <h2>Greening</h2>
      <div style="display: inline-block;">
        <div v-if="arableLand >= 15" class="greening-entries">
          <div :class="{ check: !brokeEfa, fail: brokeEfa }" />
          <p>Ökologische Vorrangfläche: Über 5% des AL</p>
        </div>
        <div class="greening-entries">
          <div :class="{ check: !broke75, fail: broke75 }" />
          <p>Diversifizierung: Keine Kulturgruppe > 75% des AL</p>
        </div>
        <div v-if="arableLand >= 30" class="greening-entries">
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
    time: {
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
      // console.log('Optimum: ' + this.optimum)
      // console.log('Total: ' + this.total)
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
        const crop = _.find(this.$store.curCrops, ['name', plot.selectedCrop])
        const cropCode = crop ? crop.code : ''
        if (
          !cropCode ||
          !plot.matrix[this.curYear] ||
          !plot.matrix[this.curYear][plot.selectedCrop]
        )
          return
        const data = plot.matrix[this.curYear][plot.selectedCrop]
        // get selected crop and previous crop
        const croppingFactor = data.croppingFactor
        // Crop rotational deviations
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
        // when rotational break for crop isn't held
        if (!data.rotBreakHeld) {
          deviations.push(
            `${plot.name}: Anbaupause von ${data.name} nicht eingehalten`
          )
        }
        // show warning when perm pasture is recultivated with another crop
        if (plot.permPast && permPastCropCodes.indexOf(cropCode) === -1) {
          deviations.push(
            `${plot.name}: Umbruch von Dauergrünland nicht erlaubt.`
          )
        }
        // show warning when growing catch crop is not possible
        if (plot.catchCrop) {
          const catchCropDeviation = this.checkCatchCrop(plot)
          if (catchCropDeviation) {
            deviations.push(catchCropDeviation)
          }
        }
      })
      // show warning when crop shares are exceeded
      this.$store.curCrops.forEach(crop => {
        if (!this.shares[this.curYear]) return
        const maxShare = crop.maxShare || 100
        const maxHa = _.round((maxShare / 100) * this.arableLand, 2)
        const share = _.round(
          this.shares[this.curYear][crop.name]
            ? this.shares[this.curYear][crop.name]
            : 0,
          2
        )
        if (share > maxHa) {
          deviations.push(
            `${
              crop.name
            }: Über zulässigem Fruchtfolgeanteil von ${maxShare}% (${share}ha statt ${maxHa}ha).`
          )
        }
      })
      // show warnings when user defined constraints are not met
      if (this.$store.curConstraints) {
        this.$store.curConstraints.forEach(constraint => {
          const area = Number(constraint.area)
          let share = this.shares[this.curYear]
            ? this.shares[this.curYear][constraint.crop1Code]
            : 0
          let crop = constraint.crop1
          if (constraint.crop2Code) {
            crop += ' + ' + constraint.crop2
            share += this.shares[this.curYear]
              ? this.shares[this.curYear][constraint.crop2Code]
              : 0
          }
          if (share > area && constraint.operator === '<') {
            deviations.push(
              `${crop}: Mehr als ${area}ha (${_.round(share, 2)}ha).`
            )
          } else if (share < area && constraint.operator === '>') {
            deviations.push(
              `${crop}: Weniger als ${area}ha (${_.round(share, 2)}ha).`
            )
          }
        })
      }
      // show warning when time requirements are not met
      if (this.$store.curTimeConstraints) {
        const timeReqConstraint = this.$store.curTimeConstraints
        timeReqConstraint.data.datasets[0].data.forEach((month, i) => {
          if (this.time && month < this.time[i]) {
            const monthName = timeReqConstraint.data.labels[i]
            deviations.push(
              `${monthName}: Arbeitszeit überschritten (${
                this.time[i]
              }h statt ${month}ha).`
            )
          }
        })
      }
      // show warning when time requirements are exceeded
      // GREENING
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
        deviations.push(`Greening: Über 75% des AL mit ${this.broke75}`)
      }
      // no crop combi more than 95%, if farm has more than 30ha
      if (this.broke95 && this.arableLand > 30) {
        deviations.push(`Greening: Über 95% des AL mit ${this.broke95}`)
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
      if (!this.shares[this.curYear]) return false
      const props = Object.keys(this.shares[this.curYear])
      let flag = false
      props.forEach(share => {
        if (this.shares[this.curYear][share] >= this.sevenFivePercent) {
          flag = share
        }
      })
      return flag
    },
    broke95() {
      if (!this.shares[this.curYear]) return false
      const props = Object.keys(this.shares[this.curYear])
      let flag = false
      props.forEach(share => {
        if (this.shares[this.curYear][share] >= this.ninceFivePercent) {
          flag = share
        }
        props.forEach(share2 => {
          if (share === share2) return
          if (
            this.shares[this.curYear][share] +
              this.shares[this.curYear][share2] >=
            this.ninceFivePercent
          ) {
            flag = share + ' ' + share2
          }
        })
      })
      return flag
    },
    greeningEfa() {
      console.log(this.shares)
      if (!this.shares[this.curYear]) return 0
      let efa = 0
      const props = Object.keys(this.shares[this.curYear])
      props.forEach(cropName => {
        // find crop for the given code
        const share = this.shares[this.curYear][cropName]
        const crop = _.find(this.$store.curCrops, ['name', cropName])
        if (crop && share) {
          efa += share * crop.efaFactor
        }
      })
      // add Ecological focus area from catch crops
      this.plots.forEach(plot => {
        if (plot.catchCrop) {
          efa += plot.size
        }
      })
      return _.round(efa, 2)
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
    checkCatchCrop(plot) {
      const crop = plot.selectedCrop
      const selectedData = _.find(this.$store.curCrops, ['name', crop])
      console.log(selectedData, crop)
      if (selectedData && selectedData.season === 'Winter') {
        return `${plot.name}: Greening ZF nur vor Sommerung`
      }
      const prevCrop = plot.prevCrop1
      const prevCropData = _.find(this.$store.curCrops, ['name', prevCrop])
      if (prevCropData && !prevCropData.catchCropAfter) {
        return `${plot.name}: Greening ZF nicht nach ${prevCrop}`
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
      console.log(this.arableLand)
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
