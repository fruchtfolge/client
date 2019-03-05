<template lang="html">
  <div>
    <div class="grossMarginTimeline-wrapper">
      <canvas id="grossMarginTimeline-chart" width="380" height="320" style="display: unset;"></canvas>
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'

export default {
  data() {
    return {
      grossMarginTimeline: undefined,
      datasets: undefined,
      labels: undefined
    }
  },
  watch: {
    plots: {
      handler() {
        //console.log(this.grossMarginTimeline,this.datasets);
        this.prepareData()
        this.grossMarginTimeline.data.datasets[0].data = this.datasets[0].data
        this.grossMarginTimeline.data.datasets[1].data = this.datasets[1].data
        this.grossMarginTimeline.data.datasets[2].data = this.datasets[2].data
        // this.grossMarginTimeline.data.labels = this.labels
        this.grossMarginTimeline.update()
      },
      deep: true
    }
  },
  props: {
    plots: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.createGradient('grossMarginTimeline-chart')
    this.prepareData('grossMarginTimeline-chart')
    this.createChart('grossMarginTimeline-chart', this.grossMarginTimeline)
  },
  methods: {
    prepareData(chartId) {
      this.datasets = []
      this.labels = []
      const store = this.$store
      const colors = ["#294D4A", "#4A6D7C", "#7690A5"]
      const curYear = store.curYear
      const scenario = store.curScenario
      const years = Array(curYear - (curYear - 10)).fill(0).map((e,i)=>i+(curYear-9))

      for (var i = 0; i < 3; i++) {
        const croppingYear = curYear - i
        const plots = store.plots.filter(plot => {
          return plot.year === croppingYear && plot.scenario === scenario
        })

        let data = []
        let shares = []
        years.forEach(year => {
          const o = {year: croppingYear, sum: 0}
          // calculate total db for cropping plan of curYear - i under prices/yields/directCosts of year
          let grossMargins = []
          let grossMargin = 0
          grossMargins = plots.map(plot => {
            const plotData = plot.matrix[year]
            let type = 'grossMarginNoCropEff'
            let crop = plot.crop
            if (i === 0) {
              crop = plot.selectedCrop
            }
            if (plotData[crop]) {
              if (o[crop]) o[crop] += plotData[crop].size
              else o[crop] = plotData[crop].size
              o.sum += plotData[crop].size
              if (i === 0) {
                return plotData[crop].grossMargin
              }
              return plotData[crop].grossMarginNoCropEff * plotData[crop].size
            }
          })

          grossMargin = _.round(_.sum(grossMargins),2)
          data.push(grossMargin)
          shares.push(o)
          if (this.labels.indexOf(year) === -1) this.labels.push(year)
        })
        //console.log(shares);
        this.datasets.push({
          data: data,
          label: `Anbauplan ${curYear - i}`,
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
                    return (label).toLocaleString()+'€';
                  }
                }
              }
            ]
          }
        }
      }
      const ctx = document.getElementById(chartId).getContext('2d')
      this.grossMarginTimeline = new Chart(ctx, config)
      //console.log(this.grossMarginTimeline);
    }
  }
}
</script>
<style>
#grossMarginTimeline-chart {
  display: unset;
}

.grossMarginTimeline-wrapper {
  text-align: center;
  margin: auto;
  margin-top: 80px;
}
</style>
