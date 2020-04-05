<template>
  <div style="height: 100%;">
    <div class="page-container">
      <addPlot v-if="addPlot" :plot-data="plotData" @closeAddPlot="addPlot = false" />
      <plotsSidebar />
      <div style="width: calc(100% - 275px)">
        <maps @addPlot="openDialogue" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    maps: () => import('~/components/maps.vue'),
    plotsSidebar: () => import('~/components/plots_sidebar.vue'),
    addPlot: () => import('~/components/add_plot.vue')
  },
  data: () => ({
    map: null,
    addPlot: false
  }),
  created() {},
  methods: {
    openDialogue(data) {
      this.addPlot = true
      this.plotData = data
    }
  }
}
</script>
