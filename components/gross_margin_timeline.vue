<template lang="html">
  <div>
    <div class="grossMarginTimeline-wrapper">
      <canvas id="grossMarginTimeline-chart" width="380" height="320" style="display: unset;" />
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'

export default {
  props: {
    plots: {
      type: Array,
      required: true
    }
  },
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
        // console.log(this.grossMarginTimeline,this.datasets);
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
      const colors = [
        'rgb(121, 173, 151)',
        'rgb(236, 203, 137)',
        'rgb(212, 133, 68)'
      ]
      const curYear = store.curYear
      const years = Array(curYear - (curYear - 10))
        .fill(0)
        .map((e, i) => i + (curYear - 9))

      for (let i = 0; i < 3; i++) {
        const croppingYear = curYear - i

        const data = []
        const shares = []

        years.forEach(year => {
          const o = { year: croppingYear, sum: 0 }
          // calculate total db for cropping plan of curYear - i under prices/yields/directCosts of year
          const grossMargin = 0
          data.push(grossMargin)
          shares.push(o)
          if (this.labels.indexOf(year) === -1) this.labels.push(year)
        })
        // console.log(shares);
        this.datasets.push({
          data: data,
          label: `Anbauplan ${curYear - i}`,
          borderColor: colors[i],
          backgroundColor: this.gradient[i]
        })
      }
    },
    amount(crop) {
      return _.round(
        _.sumBy(crop.contributionMargin.revenues, o => {
          return o.amount.value
        })
      )
    },
    price(crop, amount) {
      let price
      if (amount > 0) {
        price = _.round(
          _.sumBy(crop.contributionMargin.revenues, o => {
            return o.total.value
          }) / amount,
          2
        )
      } else {
        price = _.round(
          _.sumBy(crop.contributionMargin.revenues, o => {
            return o.total.value
          }),
          2
        )
      }
      return price
    },
    variableCosts(crop) {
      return _.round(
        _.sumBy(crop.contributionMargin.variableCosts, o => {
          return o.total.value
        }),
        2
      )
    },
    directCosts(crop) {
      return _.round(
        _.sumBy(crop.contributionMargin.directCosts, o => {
          return o.total.value
        }),
        2
      )
    },
    createGradient(chartId) {
      const ctx = document.getElementById(chartId).getContext('2d')
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
            text: 'Gesamtdeckungsbeitrag im Zeitverlauf'
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
                    return label.toLocaleString() + '€'
                  }
                }
              }
            ]
          }
        }
      }
      const ctx = document.getElementById(chartId).getContext('2d')
      this.grossMarginTimeline = new Chart(ctx, config)
      // console.log(this.grossMarginTimeline);
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
  margin-top: 60px;
}
</style>
