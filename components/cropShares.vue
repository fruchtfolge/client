<template lang="html">
  <div>
    <div class="cropShares-wrapper">
      <canvas id="cropShares-chart" width="280" height="280" style="display: unset;"></canvas>
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'

export default {
  data() {
    return {
      cropShares: undefined,
      dataset: undefined
    }
  },
  watch: {
    shares(val) {
      console.log(this.shares);
      this.prepareData()
      this.cropShares.data.datasets[0].data = this.dataset.data
      this.cropShares.data.datasets[0].backgroundColor = this.dataset.backgroundColor
      this.cropShares.data.labels = this.dataset.labels
      this.cropShares.update()
    },
  },
  mounted() {
    this.prepareData()
    this.createChart('cropShares-chart', this.cropShares)
  },
  props: {
    shares: {
      type: Array,
      required: true
    }
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
      Chart.defaults.global.defaultFontFamily = "Open Sans Light";
      Chart.defaults.global.defaultFontSize = 14;

      const config = {
        type: 'pie',
        data: {
          datasets: [{
            data: this.dataset.data,
            backgroundColor: this.dataset.backgroundColor,
            label: 'Summe Kulturen'
          }],
          labels: this.dataset.labels
        },
        options: {
          responsive: false,
          legend: {
            position: "bottom"
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                var value = data.datasets[0].data[tooltipItem.index];
                var label = data.labels[tooltipItem.index];
                return label + ': ' + value + ' ha';
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
      console.log(this.cropShares);
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
