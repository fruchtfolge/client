<template>
  <div class="printFixOverflow">
    <div class="chart-wrapper">
      <canvas id="labour-chart" />
    </div>
    <div v-if="!stored" style="width:100%;text-align:center;margin-top: 40px;">
      <h3>
        Aktuell sind keine Arbeitszeit-Restriktionen hinterlegt.<br>
        Sie können durch Klicken auf den 'Hinzufügen'-Button maximale Arbeitsstunden hinzufügen.<br>
      </h3>
      <button class="button" type="button" name="button" @click="add">
        HINZUFÜGEN
      </button>
    </div>
    <div v-if="stored" style="width:100%;text-align:center;margin-top: 40px;">
      <p class="graph-description">
        Klicken und ziehen Sie die Datenpunkte an die gewünschte Position.
      </p>
      <button class="button" type="button" name="button" @click="remove">
        ENTFERNEN
      </button>
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'
import TimeConstraints from '~/constructors/TimeConstraints'
import chartDefaults from '~/assets/js/labour.js'
import 'chartjs-plugin-dragdata'
import '~/assets/js/chartjs-plugin-background'
import notifications from '~/components/notifications'

export default {
  data() {
    return {
      chartDefaults: undefined,
      labourChart: undefined,
      stored: false
    }
  },
  notifications: notifications,
  mounted() {
    // check if data exists in store
    this.update()
    this.$bus.$on('changeCurrents', _.debounce(this.update, 200))
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
  },
  methods: {
    createChart(chartId, chartData) {
      Chart.defaults.global.defaultFontFamily = 'Inter'
      Chart.defaults.global.defaultFontSize = 14

      const ctx = document.getElementById(chartId).getContext('2d')

      const gradient1 = ctx.createLinearGradient(0, 0, 0, 450)
      const gradient2 = ctx.createLinearGradient(0, 0, 0, 450)

      gradient1.addColorStop(0, 'rgba(74,109,124, 1)')
      gradient1.addColorStop(0.5, 'rgba(74,109,124, 0.8)')
      gradient1.addColorStop(1, 'rgba(74,109,124, 0.4)')

      gradient2.addColorStop(0, 'rgba(121, 173, 151, 1)')
      gradient2.addColorStop(0.5, 'rgba(121, 173, 151, 0.8)')
      gradient2.addColorStop(1, 'rgba(121, 173, 151, 0.4)')

      chartData.data.datasets[0].backgroundColor = gradient1
      chartData.data.datasets[1].backgroundColor = gradient2
      chartData.options.onDragStart = e => {
        e.target.style.cursor = 'grabbing'
      }
      chartData.options.onDrag = e => {
        e.target.style.cursor = 'grabbing'
      }
      chartData.options.onDragEnd = this.saveChanges

      chartData.options.hover = {
        onHover: function(e) {
          const point = this.getElementAtEvent(e)
          if (point.length) e.target.style.cursor = 'grab'
          else e.target.style.cursor = 'default'
        }
      }

      this.labourChart = new Chart(ctx, {
        type: chartData.chartType,
        data: chartData.data,
        options: chartData.options
      })
    },
    async add() {
      try {
        // create new time constraints object
        chartDefaults.year = this.$store.curYear
        chartDefaults.scenario = this.$store.curScenario

        const timeConstraints = new TimeConstraints(chartDefaults)
        // console.log(timeConstraints)
        await this.$db.put(timeConstraints)
        this.saveSuccess()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    },
    async saveChanges(e, datasetIndex, index, value) {
      try {
        const chartData = await this.$db.get(this.chartDefaults._id)
        chartData.data.datasets[datasetIndex].data[index] = value
        const update = await this.$db.put(chartData)
        this.chartDefaults._rev = update.rev
        e.target.style.cursor = 'default'
        this.saveSuccess()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    },
    update() {
      if (!this.chartDefaults) {
        this.$set(this, 'chartDefaults', this.$store.curTimeConstraints)
        if (this.chartDefaults) {
          this.stored = true
          this.createChart('labour-chart', this.chartDefaults)
        }
      }
    },
    async remove() {
      try {
        this.stored = false
        this.labourChart.destroy()
        await this.$db.remove(this.chartDefaults)
        this.chartDefaults = null
        this.saveSuccess()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    }
  }
}
</script>
<style>
.chart-wrapper {
  margin: auto;
  max-width: 960px;
}
#labour-chart {
  margin-top: 50px;
}
</style>
