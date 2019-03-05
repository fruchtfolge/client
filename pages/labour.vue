<template>
  <div class="">
    <div class="chart-wrapper">
      <canvas id="labour-chart"></canvas>
    </div>
    <div v-if="!stored" style="width:100%;text-align:center;margin-top: 40px;">
      <h3>Aktuell sind keine Arbeitszeit-Restriktionen hinterlegt.<br>
        Sie können durch Klicken auf den 'Hinzufügen'-Button maximale Arbeitsstunden hinzufügen.<br></h3>
      <button type="button" name="button" @click="add">HINZUFÜGEN</button>
    </div>
    <div v-if="stored" style="width:100%;text-align:center;margin-top: 40px;">
      <button type="button" name="button" @click="remove">ENTFERNEN</button>
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js'
import TimeConstraints from '~/constructors/TimeConstraints'
import chartDefaults from '~/assets/js/labour.js'
import 'chartjs-plugin-dragdata'

export default {
  data() {
    return {
      chartDefaults: undefined,
      labourChart: undefined,
      stored: false
    }
  },
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
      chartData.options.onDragEnd = this.saveChanges

      this.labourChart = new Chart(ctx, {
        type: chartData.chartType,
        data: chartData.data,
        options: chartData.options,
      })
      console.log(this.labourChart);
    },
    async add() {
      // create new time constraints object
      chartDefaults.year = this.$store.curYear
      chartDefaults.scenario = this.$store.curScenario

      const timeConstraints = new TimeConstraints(chartDefaults)
      console.log(timeConstraints);
      await this.$db.put(timeConstraints)
    },
    async saveChanges(e, datasetIndex, index, value) {
      const chartData = await this.$db.get(this.chartDefaults._id)
      chartData.data.datasets[datasetIndex].data[index] = value
      const update = await this.$db.put(chartData)
      this.chartDefaults._rev = update.rev
    },
    update() {
      if (!this.chartDefaults) {
        console.log('yes');
        this.$set(this, 'chartDefaults', this.$store.curTimeConstraints)
        if (this.chartDefaults) {
          this.stored = true
          this.createChart('labour-chart', this.chartDefaults)
        }
      }
    },
    async remove() {
      this.stored = false
      this.labourChart.destroy()
      await this.$db.remove(this.chartDefaults)
      this.chartDefaults = null
    }
  }
}
</script>
<style>
#labour-chart {
  margin-top: 50px;
}
</style>
