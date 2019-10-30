<template lang="html">
  <div>
    <div class="storage-wrapper">
      <canvas id="storage-chart" width="380" height="320" />
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'

export default {
  props: {
    curStorage: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      storage: undefined,
      datasets: undefined,
      labels: undefined
    }
  },
  watch: {
    result: {
      handler() {
        this.prepareData()
        this.storage.data.datasets[0].data = this.datasets[0].data
        this.storage.data.datasets[1].data = this.datasets[1].data
        this.storage.update()
      },
      deep: true
    }
  },
  mounted() {
    this.createGradient('storage-chart')
    this.prepareData('storage-chart')
    this.createChart('storage-chart', this.storage)
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
      const colors = ['rgb(121, 173, 151)', 'rgb(236, 203, 137)']
      const manAmount = this.curStorage.manure.reduce(
        (acc, ind) => (acc += ind)
      )
      const solidAmount = this.curStorage.solid.reduce(
        (acc, ind) => (acc += ind)
      )
      if (manAmount) {
        this.datasets.push({
          data: this.curStorage.manure,
          label: `Güllelager`,
          borderColor: colors[0],
          backgroundColor: this.gradient[0]
        })
      }
      if (solidAmount) {
        this.datasets.push({
          data: this.curStorage.solid,
          label: `Festmistlager`,
          borderColor: colors[1],
          backgroundColor: this.gradient[1]
        })
      }
    },
    createGradient(chartId) {
      const ctx = document.getElementById(chartId).getContext('2d')
      // const colors = ['#294D4A', '#4A6D7C', '#7690A5']
      this.gradient = []

      this.gradient[0] = ctx.createLinearGradient(0, 0, 0, 450)
      this.gradient[1] = ctx.createLinearGradient(0, 0, 0, 450)

      // rgb(121, 173, 151)
      this.gradient[0].addColorStop(0, 'rgba(121, 173, 151, 0.5)')
      this.gradient[0].addColorStop(0.5, 'rgba(121, 173, 151, 0)')
      this.gradient[0].addColorStop(1, 'rgba(121, 173, 151, 0)')
      // rgb(236, 203, 137)
      this.gradient[1].addColorStop(0, 'rgba(236, 203, 137, 0.7)')
      this.gradient[1].addColorStop(0.5, 'rgba(236, 203, 137, 0)')
      this.gradient[1].addColorStop(1, 'rgba(236, 203, 137, 0)')
    },
    createChart(chartId, chartData) {
      Chart.defaults.global.defaultFontFamily = 'Open Sans'
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
            text: 'Dunglager'
          },
          responsive: false,
          legend: {
            position: 'bottom'
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
                    return label + 'm³'
                  }
                }
              }
            ]
          },
          plugins: {
            deferred: false
          }
        }
      }
      const ctx = document.getElementById(chartId).getContext('2d')
      this.storage = new Chart(ctx, config)
    }
  }
}
</script>
<style>
#storage-chart {
  display: unset;
}

.storage-wrapper {
  text-align: center;
  margin: auto;
  margin-top: 60px;
}
</style>
