<template lang="html">
  <div>
    <div class="timeRequirement-wrapper">
      <canvas id="timeRequirement-chart" width="380" height="320" style="display: unset;" />
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'
import 'chartjs-plugin-deferred'
import '~/assets/js/chartjs-plugin-background'
import notifications from '~/components/notifications'

export default {
  props: {
    shares: {
      type: Object,
      required: true
    },
    time: {
      type: Array,
      required: true
    }
  },
  notifications: notifications,
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
  methods: {
    prepareData(chartId) {
      this.datasets = []
      this.labels = [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember'
      ]
      const store = this.$store
      const colors = [
        'rgb(121, 173, 151)',
        'rgb(236, 203, 137)',
        'rgb(212, 133, 68)'
      ]
      const curYear = store.curYear
      const months = [
        ['JAN1', 'JAN2'],
        ['FEB1', 'FEB2'],
        ['MRZ1', 'MRZ2'],
        ['APR1', 'APR2'],
        ['MAI1', 'MAI2'],
        ['JUN1', 'JUN2'],
        ['JUL1', 'JUL2'],
        ['AUG1', 'AUG2'],
        ['SEP1', 'SEP2'],
        ['OKT1', 'OKT2'],
        ['NOV1', 'NOV2'],
        ['DEZ1', 'DEZ2']
      ]
      const catchCropMonths = ['AUG2', 'SEP1', 'SEP2', 'FEB2']

      for (let i = 0; i < 3; i++) {
        const croppingYear = curYear - i
        if (i === 0) {
          this.datasets.push({
            data: this.time,
            label: `Anbauplan ${croppingYear}`,
            borderColor: colors[i],
            backgroundColor: this.gradient[i]
          })
        } else {
          if (!this.shares[croppingYear]) continue
          const cropsGrown = Object.keys(this.shares[croppingYear])
          const crops = store.crops.filter(crop => {
            if (crop.name) {
              return (
                cropsGrown.indexOf(crop.name) > -1 &&
                crop.year === croppingYear &&
                crop.scenario === store.curScenario
              )
            } else {
              return false
            }
          })
          const data = months.map(month => {
            let time = 0
            crops.forEach(crop => {
              const share = this.shares[croppingYear][crop.name]
              let steps = crop.workingSteps.filter(o => {
                return month[0] === o.month || month[1] === o.month
              })
              if (steps && steps.length > 0 && share) {
                steps = steps.map(step => {
                  return _.sumBy(step.steps, 'time')
                })
                time += _.sum(steps) * share
              }
            })
            store.curPlots.forEach(plot => {
              if (
                (plot.catchCrop && catchCropMonths.indexOf(month[0]) > -1) ||
                catchCropMonths.indexOf(month[1]) > -1
              ) {
                // Source: Own regression made from KTBL - Verfahrensrechner Pflanze data
                // Based on crop "Zwischenfrucht Senf"
                time +=
                  (0.04827586207 * plot.distance -
                    0.1 * plot.size +
                    4.191724138) /
                  catchCropMonths.length
              }
            })
            return _.round(time, 2)
          })
          this.datasets.push({
            data: data,
            label: `Anbauplan ${croppingYear}`,
            borderColor: colors[i],
            backgroundColor: this.gradient[i]
          })
        }
      }
    },
    createGradient(chartId) {
      const ctx = document.getElementById(chartId).getContext('2d')
      // const colors = ['#294D4A', '#4A6D7C', '#7690A5']
      this.gradient = []

      this.gradient[0] = ctx.createLinearGradient(0, 0, 0, 450)
      this.gradient[1] = ctx.createLinearGradient(0, 0, 0, 450)
      this.gradient[2] = ctx.createLinearGradient(0, 0, 0, 450)

      // rgb(121, 173, 151)
      this.gradient[0].addColorStop(0, 'rgba(121, 173, 151, 0.5)')
      this.gradient[0].addColorStop(0.5, 'rgba(121, 173, 151, 0)')
      this.gradient[0].addColorStop(1, 'rgba(121, 173, 151, 0)')
      // rgb(236, 203, 137)
      this.gradient[1].addColorStop(0, 'rgba(236, 203, 137, 0.7)')
      this.gradient[1].addColorStop(0.5, 'rgba(236, 203, 137, 0)')
      this.gradient[1].addColorStop(1, 'rgba(236, 203, 137, 0)')
      // rgb(214, 230, 205)
      this.gradient[2].addColorStop(0, 'rgba(212, 133, 68, 0.9)')
      this.gradient[2].addColorStop(0.5, 'rgba(212, 133, 68, 0)')
      this.gradient[2].addColorStop(1, 'rgba(212, 133, 68, 0)')
    },
    createChart(chartId, chartData) {
      Chart.defaults.global.defaultFontFamily = 'Inter'
      Chart.defaults.global.defaultFontSize = 14

      const config = {
        type: 'line',
        data: {
          datasets: this.datasets,
          labels: this.labels
        },
        options: {
          title: {
            display: true,
            text: 'Arbeitszeitbedarf'
          },
          responsive: false,
          legend: {
            position: 'bottom'
          },
          plugins: {
            deferred: {
              yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
              delay: 250 // delay of 500 ms after the canvas is considered inside the viewport
            }
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
                    return label + ' h'
                  }
                }
              }
            ]
          },
          chartArea: {
            backgroundColor: 'white'
          }
        }
      }
      const ctx = document.getElementById(chartId).getContext('2d')
      this.timeRequirement = new Chart(ctx, config)
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
  margin-top: 60px;
}
</style>
