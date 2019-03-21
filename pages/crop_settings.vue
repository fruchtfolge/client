<template>
  <div>
    <addCrop v-if="addCrop" @closeAddCrop="addCrop = false" />
    <cropsSidebar :crops="crops" :selected-crop="selectedCrop" @showAddCrop="addCrop = true" @changeCrop="changeCrop" />
    <div v-if="selectedCrop" class="cropSettings">
      <div class="subseqCrops">
        <table>
          <caption class="caption">
            Nachfruchtwirkungen
          </caption>
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
                {{ selectedCrop.subseqCrops[subseq.cropGroup] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="settings">
        <table>
          <caption class="caption">
            Fruchtfolge Eigenschaften
          </caption>
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
                {{ selectedCrop.rotBreak }}
              </td>
            </tr>
            <tr>
              <td>Max. Anteil Anbaufläche [%]</td>
              <td contenteditable="true" @blur="save($event, i, 'maxShare')">
                {{ selectedCrop.maxShare }}
              </td>
            </tr>
            <tr>
              <td>Mindestanforderung Bodenqualität</td>
              <td contenteditable="true" @blur="save($event, i, 'minSoilQuality')">
                {{ selectedCrop.minSoilQuality }}
              </td>
            </tr>
            <tr>
              <td>Hackfrucht</td>
              <td><input type="checkbox" :checked="selectedCrop.rootCrop" @change="saveRootCrop($event,i)"></td>
            </tr>
            <tr>
              <td>Sommerung</td>
              <td><input type="checkbox" :checked="selectedCrop.season === 'Sommer'" @change="saveRootCrop($event,i)"></td>
            </tr>
            <tr>
              <td>Zwischenfrucht anschließend möglich</td>
              <td><input type="checkbox" :checked="selectedCrop.catchCropAfter" @change="saveRootCrop($event,i)"></td>
            </tr>
            <tr>
              <td>Faktor für Öko. Vorrangfläche (Greening)</td>
              <td contenteditable="true" @blur="save($event, i, 'efaFactor')">
                {{ selectedCrop.efaFactor }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="duevSettings">
        <table>
          <caption class="caption">
            Einstellungen Düngeverordnung 2017
          </caption>
          <thead>
            <tr>
              <th>Eigenschaft</th>
              <th>Wert</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ertragsniveau nach Tab. X [dt/ha]</td>
              <td contenteditable="true" @blur="save($event, i, 'duevYieldLvl')">
                {{ selectedCrop.duevYieldLvl }}
              </td>
            </tr>
            <tr>
              <td>N-Düngebedarf nach Tab. X [kg/ha]</td>
              <td contenteditable="true" @blur="save($event, i, 'nRequirement')">
                {{ selectedCrop.nRequirement }}
              </td>
            </tr>
            <tr>
              <td>Maximaler N-Bedarfszuschlag bei Mehrertrag je dt (Tab. X) [kg/ha]</td>
              <td contenteditable="true" @blur="save($event, i, 'nMaxAddition')">
                {{ selectedCrop.nMaxAddition }}
              </td>
            </tr>
            <tr>
              <td>Minimaler N-Bedarfsabzug bei Minderertrag je dt (Tab. X) [kg/ha]</td>
              <td contenteditable="true" @blur="save($event, i, 'nMinSubtraction')">
                {{ selectedCrop.nMinSubtraction }}
              </td>
            </tr>
            <tr>
              <td>N-Bedarfsabzug wenn Vorfrucht (Tab. X) [kg/ha]</td>
              <td contenteditable="true" @blur="save($event, i, 'prevCropEff')">
                {{ selectedCrop.prevCropEff }}
              </td>
            </tr>
            <tr>
              <td>P-Entzug (Tab. X) [kg/ha]</td>
              <td contenteditable="true" @blur="save($event, i, 'pWithdraw')">
                {{ selectedCrop.pWithdraw }}
              </td>
            </tr>
            <tr>
              <td>P-Rückstände Erntereste [kg/ha]</td>
              <td contenteditable="true" @blur="save($event, i, 'pHarvestLeft')">
                {{ selectedCrop.pHarvestLeft }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="text-align:center;margin-top: 40px;">
        <button type="button" name="button" @click="remove">
          ENTFERNEN
        </button>
      </div>
    </div>
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
    addCrop: () => import('~/components/add_crop.vue'),
    cropsSidebar: () => import('~/components/crops_sidebar.vue')
  },
  data() {
    return {
      crops: undefined,
      toggle: true,
      selectedCrop: undefined,
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
    async save(e, i, type, value) {
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
    async saveRootCrop(e, i) {
      try {
        const newValue = e.target.checked
        this.$set(this.crops[i], 'rootCrop', newValue)
        await this.$db.put(this.crops[i])
      } catch (e) {
        console.log(e)
      }
    },
    async remove() {
      try {
        await this.$db.remove(this.selectedCrop)
      } catch (e) {
        console.log(e)
      }
    },
    importPrev() {
      this.waiting = true
      this.$bus.$emit('importPrevYear')
    }
  }
}
</script>

<style>
.caption {
  line-height: 30px;
}

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
