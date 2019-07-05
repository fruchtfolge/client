<template>
  <div style="height: 100%;">
    <div class="">
      <addPlot v-if="addPlot" :plot-data="plotData" @closeAddPlot="addPlot = false" />
      <plotsSidebar />
      <div style="width: calc(100% - 275px)">
        <maps @addPlot="openDialogue" />
      </div>
    </div>
    <v-tour name="maps" :steps="tour.steps" :options="tour.options" />
  </div>
</template>

<script>
import tour from '~/tour/maps'

export default {
  components: {
    maps: () => import('~/components/maps.vue'),
    plotsSidebar: () => import('~/components/plots_sidebar.vue'),
    addPlot: () => import('~/components/add_plot.vue')
  },
  data: () => ({
    map: null,
    addPlot: false,
    tour
  }),
  created() {
    this.$bus.$on('tour', () => {
      this.$tours.maps.start()
    })
  },
  destroyed() {
    this.$bus.$off('tour')
  },
  methods: {
    openDialogue(data) {
      this.addPlot = true
      this.plotData = data
    }
  }
}
</script>
