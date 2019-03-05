<template>
  <div>
    <addCrop v-if="addCrop" v-on:closeAddCrop="addCrop = false"/>
    <cropsSidebar v-on:showAddCrop="addCrop = true" v-on:changeCrop="changeCrop" :crops="crops" :selectedCrop="selectedCrop"/>
    <div v-if="crops && crops.length > 0">
      <div v-for="(crop, i) in crops" :key='i' v-if="isSelected(crop)" >
        <cropLabour :crop="crop"/>
      </div>
    </div>
    <div style="text-align: center; margin-top: 100px; width: calc(100% - 275px);" v-else>
      <h3>Noch keine Kulturen für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
      <h3>
      Sie können neue Kulturen durch klicken auf den 'Hinzufügen'-Button in der rechten Seitenleiste hinzufügen.
      <br>
      Alternativ können Sie Daten aus dem vorherigen Anbaujahr importieren.</h3>
      <button @click="importPrev" style="margin-left: 20px;">IMPORTIEREN</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      crops: null,
      selectedCrop: null,
      addCrop: false
    }
  },
  created() {
    this.update()
    this.$bus.$on('changeCurrents', _.debounce(this.update, 200))
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
  },
  methods: {
    changeCrop(crop) {
      this.selectedCrop = crop
    },
    update() {
      this.$set(this, 'crops', this.$store.curCrops)
      if (!this.selectedCrop && this.$store.curCrops) {
        this.$set(this, 'selectedCrop', this.$store.curCrops[0])
      }
    },
    isSelected(crop) {
      return crop.name === this.selectedCrop.name
    },
    importPrev() {
      this.waiting = true
      this.$bus.$emit('importPrevYear')
    }
  },
  components: {
    cropLabour: () => import('~/components/crop_labour.vue'),
    addCrop: () => import('~/components/add_crop.vue'),
    cropsSidebar: () => import('~/components/crops_sidebar.vue'),
  }
}
</script>
