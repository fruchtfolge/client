<template>
  <div>
    <addCrop v-if="addCrop" @closeAddCrop="addCrop = false" />
    <cropsSidebar :crops="crops" :selected-crop="selectedCrop" @showAddCrop="addCrop = true" @changeCrop="changeCrop" />
    <cropTable v-if="selectedCrop" :crop="crop" />
    <div v-else style="text-align: center; margin-top: 100px; width: calc(100% - 275px);">
      <h3>Noch keine Kulturen für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
      <h3>
        Sie können neue Kulturen durch klicken auf den 'Hinzufügen'-Button in der rechten Seitenleiste hinzufügen.
        <br>
        Alternativ können Sie Daten aus dem vorherigen Anbaujahr importieren.
      </h3>
      <button style="margin-left: 20px;" @click="importPrev">
        IMPORTIEREN
      </button>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    cropTable: () => import('~/components/crop_table.vue'),
    addCrop: () => import('~/components/add_crop.vue'),
    cropsSidebar: () => import('~/components/crops_sidebar.vue')
    // cropSettings: () => import('~/components/cropSettings.vue'),
    // cropRevYields: () => import('~/components/cropRevYields.vue')
  },
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
    importPrev() {
      this.waiting = true
      this.$bus.$emit('importPrevYear')
    }
  }
}
</script>
