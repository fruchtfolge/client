<template>
  <div id="results-map" />
</template>
<script>
import mapboxgl from 'mapbox-gl'

export default {
  props: {
    curPlots: {
      type: Array,
      required: true
    },
    cropColor: {
      type: Object,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }
  },
  data: () => ({}),
  created: () => {
    this.createMap()
  },
  methods: {
    createMap() {}
  }
}
</script>
<style lang="css" scoped>

</style>
