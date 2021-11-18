<template lang="html">
  <div>
    <h2 style="width:calc(100% - 275px);text-align: center;margin-top: 40px;">
      Gesamtarbeitszeitbedarf: {{ total }} h/ha
    </h2>
    <div class="cropLabour-wrapper">
      <canvas id="cropLabour-chart" />
    </div>
    <div style="width:calc(100% - 275px);text-align:center;margin-top: 20px;">
      <p class="graph-description">
        Klicken und ziehen Sie die Datenpunkte an die gewünschte Position.
        <br>
        Quelle der Daten: KTBL Verfahrensrechner Pflanzenbau
      </p>
      <button class="button" style="margin-top: 10px;" type="button" name="button" @click="remove">
        ENTFERNEN
      </button>
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'
import cropLabourReq from '~/assets/js/cropLabourReq.js'
import 'chartjs-plugin-dragdata'
import '~/assets/js/chartjs-plugin-background'
import notifications from '~/components/notifications'

export default {
  props: {
    crop: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      labels: [
        'JAN1',
        'JAN2',
        'FEB1',
        'FEB2',
        'MRZ1',
        'MRZ2',
        'APR1',
        'APR2',
        'MAI1',
        'MAI2',
        'JUN1',
        'JUN2',
        'JUL1',
        'JUL2',
        'AUG1',
        'AUG2',
        'SEP1',
        'SEP2',
        'OKT1',
        'OKT2',
        'NOV1',
        'NOV2',
        'DEZ1',
        'DEZ2'
      ],
      cropLabourReq,
      total: 0
    }
  },
  notifications: notifications,
  watch: {
    crop: {
      handler() {
        this.prepareData()
        this.cropLabourChart.data.datasets[0].data = this.dataset.data
        this.cropLabourChart.data.datasets[0].label = this.dataset.label
        this.cropLabourChart.data.datasets[0].borderColor = this.dataset.borderColor
        this.cropLabourChart.options.scales.yAxes[0].ticks.max =
          cropLabourReq.options.scales.yAxes[0].ticks.max
        this.cropLabourChart.update()
      },
      deep: true
    }
  },
  mounted() {
    this.prepareData()
    this.createChart('cropLabour-chart', this.cropLabour)
  },
  methods: {
    createChart(chartId, chartData) {
      const ctx = document.getElementById(chartId).getContext('2d')

      const gradient1 = ctx.createLinearGradient(0, 0, 0, 450)

      gradient1.addColorStop(0, 'rgba(121, 173, 151, 1)')
      gradient1.addColorStop(0.5, 'rgba(121, 173, 151, 0.4)')
      gradient1.addColorStop(1, 'rgba(121, 173, 151, 0.2)')

      this.dataset.backgroundColor = gradient1
      cropLabourReq.data.labels = this.labels
      cropLabourReq.data.datasets[0].data = this.dataset.data
      cropLabourReq.data.datasets[0].label = this.dataset.label
      cropLabourReq.data.datasets[0].borderColor = this.dataset.borderColor
      cropLabourReq.options.onDragStart = e => {
        e.target.style.cursor = 'grabbing'
      }
      cropLabourReq.options.onDrag = e => {
        e.target.style.cursor = 'grabbing'
      }
      cropLabourReq.options.onDragEnd = this.saveChanges

      Chart.defaults.global.defaultFontFamily = 'Raleway'
      Chart.defaults.global.defaultFontSize = 14

      this.cropLabourChart = new Chart(ctx, {
        type: cropLabourReq.type,
        data: cropLabourReq.data,
        options: cropLabourReq.options
      })
      // console.log(this.cropLabourChart)
    },
    prepareData() {
      const halfMonths = this.labels
      const data = halfMonths.map(this.getData)

      const highest = this.getMaxTick(data)
      cropLabourReq.options.scales.yAxes[0].ticks.max = _.round(
        highest * 1.3,
        0
      )

      this.dataset = {
        data: data,
        label: `Arbeitszeitbedarf [h/ha]`,
        borderColor: 'rgb(121, 173, 151)'
      }
      this.calcTotal()
    },
    calcTotal() {
      this.total = _.round(_.sum(this.dataset.data), 2)
    },
    getMaxTick(a, b) {
      return _.max([_.max(a), _.max(b)])
    },
    getData(halfMonth) {
      let time = 0
      let steps = this.crop.workingSteps.filter(o => {
        return halfMonth === o.month
      })
      if (steps && steps.length > 0) {
        steps = steps.map(step => {
          return _.sumBy(step.steps, 'time')
        })
        time += _.sum(steps)
      }
      return _.round(time, 2)
    },
    setData(halfMonth, corrFactor) {
      return this.crop.workingSteps.map(o => {
        if (halfMonth === o.month) {
          o.steps = o.steps.map(step => {
            step.time = step.time === 0 ? corrFactor : step.time * corrFactor
            return step
          })
        }
        return o
      })
    },
    async saveChanges(e, datasetIndex, index, value) {
      // console.log(datasetIndex, index, value)
      try {
        const halfMonth = this.labels[index]
        const oldValue = this.getData(halfMonth)
        const corrFactor = oldValue > 0 ? value / oldValue : value
        this.crop.workingSteps = this.setData(halfMonth, corrFactor)

        const update = await this.$db.put(this.crop)
        this.crop._rev = update.rev
        e.target.style.cursor = 'default'
        this.saveSuccess()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    },
    async remove() {
      try {
        await this.$db.remove(this.crop)
        this.showCropRemoveSucc()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    }
  }
}
</script>
<style>
#cropLabour-chart {
  margin-top: 40px;
}
.cropLabour-wrapper {
  width: calc(100% - 275px);
  height: calc(85vh - 150px);
}
</style>
