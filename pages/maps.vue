<template>
  <div style="height: 100%;">
    <div class="">
      <addPlot v-if="addPlot" v-bind:plotData="plotData" v-on:closeAddPlot="addPlot = false"/>
      <plotsSidebar/>
      <div style="width: calc(100% - 275px)">
        <maps v-on:addPlot="openDialogue"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    map: null,
    addPlot: false
  }),
  components: {
    maps: () => import('~/components/maps.vue'),
    plotsSidebar: () => import('~/components/plots_sidebar.vue'),
    addPlot: () => import('~/components/add_plot.vue')
  },
  created () {

  },
  methods: {
    openDialogue(data) {
      this.addPlot = true
      this.plotData = data
    }
  }
}
</script>
