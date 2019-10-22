<template lang="html">
  <div>
    <div class="cropShares-wrapper">
      <canvas id="cropShares-chart" width="400" height="400" />
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'
import 'chartjs-plugin-piechart-outlabels'
import 'chartjs-plugin-deferred'

export default {
  props: {
    shares: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      cropShares: undefined,
      dataset: undefined
    }
  },
  watch: {
    shares(val) {
      this.prepareData()
      this.cropShares.data.datasets[0].data = this.dataset.data
      this.cropShares.data.datasets[0].backgroundColor = this.dataset.backgroundColor
      this.cropShares.data.labels = this.dataset.labels
      this.cropShares.update()
    }
  },
  mounted() {
    this.prepareData()
    this.createChart('cropShares-chart', this.cropShares)
  },
  methods: {
    prepareData() {
      this.dataset = {}
      this.dataset.data = []
      this.dataset.backgroundColor = []
      this.dataset.labels = []

      this.shares.forEach(crop => {
        this.dataset.data.push(crop.data)
        this.dataset.backgroundColor.push(crop.backgroundColor)
        this.dataset.labels.push(crop.name)
      })
    },
    createChart(chartId, chartData) {
      Chart.defaults.global.defaultFontFamily = 'Open Sans'
      Chart.defaults.global.defaultFontSize = 14

      const config = {
        type: 'outlabeledPie',
        data: {
          datasets: [
            {
              data: this.dataset.data,
              backgroundColor: this.dataset.backgroundColor,
              label: 'Summe Kulturen'
            }
          ],
          labels: this.dataset.labels
        },
        options: {
          responsive: false,
          legend: {
            position: 'bottom'
          },
          plugins: {
            deferred: {
              delay: 250 // delay of 500 ms after the canvas is considered inside the viewport
            },
            outlabels: {
              text(context) {
                const index = context.dataIndex
                const value = context.dataset.data[index]
                return value + 'ha'
              },
              valuePrecision: 5,
              display() {
                return true
                // return window._printing ? true : false
              },
              color: 'white',
              borderColor: 'white',
              borderWidth: 2,
              stretch: 20,
              font: {
                resizable: true,
                minSize: 14
              }
            }
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                const value = data.datasets[0].data[tooltipItem.index]
                const label = data.labels[tooltipItem.index]
                return label + ': ' + value + 'ha'
              }
            },
            xPadding: 6,
            yPadding: 7,
            displayColors: false
          }
        }
      }
      const ctx = document.getElementById(chartId).getContext('2d')
      this.cropShares = new Chart(ctx, config)
    }
  }
}
</script>
<style>
#cropShares-chart {
  display: unset;
}

.cropShares-wrapper {
  margin: auto;
  text-align: center;
  margin-top: 80px;
}
</style>
