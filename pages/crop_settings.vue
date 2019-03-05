<template>
  <div>
    <addCrop v-if="addCrop" v-on:closeAddCrop="addCrop = false"/>
    <cropsSidebar v-on:showAddCrop="addCrop = true" v-on:changeCrop="changeCrop" :crops="crops" :selectedCrop="selectedCrop"/>
    <div v-if="crops && crops.length > 0">
      <div v-for="(crop, i) in crops" :key='i' v-if="isSelected(crop)" class="cropSettings">
        <div class="subseqCrops">
          <table>
            <thead>
              <tr>
                <th>Nachfrucht</th>
                <th>Wirkungsfaktor (0 - 10)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(subseq) in crops" :key="subseq._id">
                <td>{{ subseq.name }}</td>
                <td contenteditable="true" @blur="save($event, i, 'subseqCrops', subseq.cropGroup)">
                  {{ crop.subseqCrops[subseq.cropGroup] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="settings">
          <table>
            <thead>
              <tr>
                <th>Eigenschaft</th>
                <th>Wert</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Anbauspause in Jahren</td>
                <td contenteditable="true" @blur="save($event, i, 'rotBreak')">
                  {{ crop.rotBreak }}
                </td>
              </tr>
              <tr>
                <td>Max. Anteil Anbaufläche [%]</td>
                <td contenteditable="true" @blur="save($event, i, 'maxShare')">
                  {{ crop.maxShare }}
                </td>
              </tr>
              <tr>
                <td>Mindestanforderung Bodenqualität</td>
                <td contenteditable="true" @blur="save($event, i, 'minSoilQuality')">
                  {{ crop.minSoilQuality }}
                </td>
              </tr>
              <tr>
                <td>Hackfrucht</td>
                <td><input type="checkbox" @change="saveRootCrop($event,i)" :checked="crop.rootCrop"></td>
              </tr>
              <tr>
                <td>Faktor für Öko. Vorrangfläche (Greening)</td>
                <td contenteditable="true" @blur="save($event, i, 'efaFactor')">
                  {{ crop.efaFactor }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="text-align:center;margin-top: 40px;">
          <button type="button" name="button" @click="remove">ENTFERNEN</button>
        </div>
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
      toggle: true,
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
    async save(e,i,type,value) {
      try {
        const newValue = Number(e.target.innerText)
        if (type === 'subseqCrops') {
          this.$set(this.crops[i].subseqCrops, value, newValue)
        } else {
          this.$set(this.crops[i], type, newValue)
        }
        await this.$db.put(this.crops[i])
      } catch (e) {
        console.log(e)
      }
    },
    async saveRootCrop(e,i) {
      const newValue = e.target.checked
      this.$set(this.crops[i], 'rootCrop', newValue)
      await this.$db.put(this.crops[i])
    },
    async remove() {
      this.$db.remove(this.selectedCrop)
    },
    importPrev() {
      this.waiting = true
      this.$bus.$emit('importPrevYear')
    }
  },
  components: {
    addCrop: () => import('~/components/add_crop.vue'),
    cropsSidebar: () => import('~/components/crops_sidebar.vue'),
  }
}
</script>

<style>
  .cropSettings {
    width: calc(100% - 275px);
  }
  .cropSettings table {
    width: 480px;
  }
  .cropSettings table td:nth-child(2) {
    text-align: center;
  }
  .cropSettings table input {
    -webkit-appearance: checkbox;
  }
</style>
