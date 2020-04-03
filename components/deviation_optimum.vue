<template lang="html">
  <div>
    <div>
      <div v-show="shown">
        <div v-if="difference !== 0" class="difference-wrapper">
          <h2 class="dev-header">
            Differenz zum Optimum
          </h2>
          <h2 class="number" :class="{ positive: difference > 0 }">
            {{ format(difference) }}
          </h2>
        </div>
        <div class="deviations">
          <p v-for="(deviation,i) in deviations" :key="i">
            {{ deviation }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="arableLand >= 10" class="greening-check">
      <h2 class="dev-header">
        Greening
      </h2>
      <div style="display: inline-block; max-width: 400px">
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
      let deviations = []
      this.plots.forEach(plot => {
        if (!plot.selectedOption) return
        deviations = deviations.concat(plot.selectedOption.warnings)
      })
      // show warning when crop shares are exceeded
      this.$store.curCrops.forEach(crop => {
        // do not consider permanent pastures
        if (crop.code === 459) return
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
            ? this.shares[this.curYear][constraint.crop1]
            : 0
          let crop = constraint.crop1
          if (constraint.crop2Code) {
            crop += ' + ' + constraint.crop2
            share += this.shares[this.curYear]
              ? this.shares[this.curYear][constraint.crop2]
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
        // get crop object for the share, disregard permanent pastures
        const crop = this.$store.curCrops.find(c => c.name === share)
        if (crop && crop.code === 459) return
        if (this.shares[this.curYear][share] >= this.sevenFivePercent) {
          console.log(share)
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
      let efa = 0
      // add Ecological focus area from catch crops
      this.plots.forEach(plot => {
        if (plot.selectedOption) {
          efa += plot.size * plot.selectedOption.efaFactor
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
        if (plot.recommendedGrossMargin) {
          optimum += plot.recommendedGrossMargin
        }
        totLand += plot.size
        if (plot.permPast) {
          greenLand += plot.size
        } else {
          arableLand += plot.size
        }
      })
      this.optimum = optimum
      if (this.$store.settings['grossMargin' + this.curYear]) {
        this.optimum = this.$store.settings['grossMargin' + this.curYear]
      }
      this.totLand = totLand
      this.greenLand = greenLand
      this.arableLand = arableLand
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
.difference-wrapper {
  margin-top: 30px;
}

.dev-header {
  font-family: Inter;
  font-weight: 300;
  letter-spacing: normal;
  font-size: 18px;
}

.deviations {
  max-width: 400px;
}

.deviations p {
  font-size: 14px;
}

.greening-check {
  margin-top: 40px;
  margin-bottom: 0px;
}

.greening-check p {
  font-family: 'Open Sans Condensed', sans-serif;
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
  background: url('~assets/img/check.svg');
}
.fail {
  width: 20px;
  height: 20px;
  display: inline-flex;
  margin-right: 10px;
  vertical-align: text-top;
  background: url('~assets/img/fail.svg');
}
.number {
  letter-spacing: 0.05em;
  color: rgb(187, 67, 29);
}
.positive {
  color: rgb(121, 173, 151);
}
</style>
