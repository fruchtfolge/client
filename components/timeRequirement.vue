<template lang="html">
  <div>
    <div class="timeRequirement-wrapper">
      <canvas id="timeRequirement-chart" width="380" height="320" style="display: unset;"></canvas>
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'

export default {
  data() {
    return {
      timeRequirement: undefined,
      datasets: undefined,
      labels: undefined
    }
  },
  watch: {
    result: {
      handler() {
        console.log(this.timeRequirement,this.datasets);
        this.prepareData()
        this.timeRequirement.data.datasets[0].data = this.datasets[0].data
        this.timeRequirement.data.datasets[1].data = this.datasets[1].data
        this.timeRequirement.data.datasets[2].data = this.datasets[2].data
        // this.timeRequirement.data.labels = this.labels
        this.timeRequirement.update()
      },
      deep: true
    }
  },
  mounted() {
    this.createGradient('timeRequirement-chart')
    this.prepareData('timeRequirement-chart')
    this.createChart('timeRequirement-chart', this.timeRequirement)
  },
  props: {
    shares: {
      type: Object,
      required: true
    }
  },
  methods: {
    prepareData(chartId) {
      this.datasets = []
      this.labels = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
      const store = this.$store
      const colors = ["#294D4A", "#4A6D7C", "#7690A5"]
      const curYear = this.$store.curYear
      const months = [['JAN1', 'JAN2'], ['FEB1','FEB2'], ['MRZ1','MRZ2'], ['APR1','APR2'], ['MAI1','MAI2'], ['JUN1','JUN2'], ['JUL1','JUL2'], ['AUG1','AUG2'], ['SEP1','SEP2'], ['OKT1','OKT2'], ['NOV1','NOV2'], ['DEZ1','DEZ2']]

      for (var i = 0; i < 3; i++) {
        const croppingYear = curYear - i
        if (!this.shares[croppingYear]) continue
        const cropsGrown = Object.keys(this.shares[croppingYear])
        const crops = store.crops.filter(crop => {
          if (crop.code) {
            return cropsGrown.indexOf(crop.code.toString()) > -1
            && crop.year === croppingYear
            && crop.scenario === store.curScenario
          } else {
            return false
          }
        })
        const data = months.map(month => {
          let time = 0
          crops.forEach(crop => {
            const share = this.shares[croppingYear][crop.code]
            let steps = crop.workingSteps.filter(o => {return month[0] === o.month || month[1] === o.month })
            if (steps && steps.length > 0) {
              steps = steps.map(step => {
                return _.sumBy(step.steps, 'time')
              })
              time += _.sum(steps) * share
            }
          })
          return _.round(time,2)
        })

        this.datasets.push({
          data: data,
          label: `Anbauplan ${croppingYear}`,
          borderColor: colors[i],
          backgroundColor: this.gradient[i]
        })
      }
    },
    createGradient(chartId) {
      const ctx = document.getElementById(chartId).getContext('2d')
      const colors = ["#294D4A", "#4A6D7C", "#7690A5"]
      this.gradient = []

      this.gradient[0] = ctx.createLinearGradient(0, 0, 0, 450)
      this.gradient[1] = ctx.createLinearGradient(0, 0, 0, 450)
      this.gradient[2] = ctx.createLinearGradient(0, 0, 0, 450)

      this.gradient[0].addColorStop(0, 'rgba(41,77,74, 0.5)')
      this.gradient[0].addColorStop(0.5, 'rgba(41,77,74, 0.25)')
      this.gradient[0].addColorStop(1, 'rgba(41,77,74, 0)')

      this.gradient[1].addColorStop(0, 'rgba(74,109,124, 0.9)')
      this.gradient[1].addColorStop(0.5, 'rgba(74,109,124, 0.25)')
      this.gradient[1].addColorStop(1, 'rgba(74,109,124, 0)')

      this.gradient[2].addColorStop(0, 'rgba(118,144,165, 0.9)')
      this.gradient[2].addColorStop(0.5, 'rgba(118,144,165, 0.25)')
      this.gradient[2].addColorStop(1, 'rgba(118,144,165, 0)')
    },
    createChart(chartId, chartData) {
      Chart.defaults.global.defaultFontFamily = "Open Sans Light";
      Chart.defaults.global.defaultFontSize = 14;

      const config = {
        type: 'line',
        data: {
          datasets: this.datasets,
          labels: this.labels
        },
        options: {
          responsive: false,
          legend: {
            position: "bottom"
          },
          tooltips: {
            xPadding: 6,
            yPadding: 7,
            displayColors: false
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  callback: function(label, index, labels) {
                    return label + ' h';
                  }
                }
              }
            ]
          }
        }
      }
      const ctx = document.getElementById(chartId).getContext('2d')
      this.timeRequirement = new Chart(ctx, config)
      console.log(this.timeRequirement);
    }
  }
}
</script>
<style>
#timeRequirement-chart {
  display: unset;
}

.timeRequirement-wrapper {
  text-align: center;
  margin: auto;
  margin-top: 80px;
}
</style>
