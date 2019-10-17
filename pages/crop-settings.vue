<template>
  <div>
    <addCrop v-if="addCrop" @closeAddCrop="addCrop = false" />
    <cropsSidebar :crops="crops" :selected-crop="selectedCrop" @showAddCrop="addCrop = true" @changeCrop="changeCrop" />
    <div v-if="selectedCrop" class="cropSettings">
      <div class="subseqCrops">
        <table class="table">
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
              <td contenteditable="true" @blur="save($event, 'subseqCrops', subseq.cropGroup)">
                {{ selectedCrop.subseqCrops[subseq.cropGroup] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="settings">
        <table class="table">
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
              <td contenteditable="true" @blur="save($event, 'rotBreak')">
                {{ selectedCrop.rotBreak }}
              </td>
            </tr>
            <tr>
              <td>Max. Anteil Anbaufläche [%]</td>
              <td contenteditable="true" @blur="save($event, 'maxShare')">
                {{ selectedCrop.maxShare }}
              </td>
            </tr>
            <tr>
              <td>Mindestanforderung Bodenqualität</td>
              <td contenteditable="true" @blur="save($event, 'minSoilQuality')">
                {{ selectedCrop.minSoilQuality }}
              </td>
            </tr>
            <tr>
              <td>Hackfrucht</td>
              <td><input type="checkbox" :checked="selectedCrop.rootCrop" @change="saveCheckbox($event,'rootCrop')"></td>
            </tr>
            <tr>
              <td>Sommerung</td>
              <td><input type="checkbox" :checked="selectedCrop.season === 'Sommer'" @change="saveCheckbox($event,'season')"></td>
            </tr>
            <tr>
              <td>Zwischenfrucht anschließend möglich</td>
              <td><input type="checkbox" :checked="selectedCrop.catchCropAfter" @change="saveCheckbox($event,'catchCropAfter')"></td>
            </tr>
            <tr>
              <td>Faktor für Öko. Vorrangfläche (Greening)</td>
              <td contenteditable="true" @blur="save($event,'efaFactor')">
                {{ selectedCrop.efaFactor }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="duevSettings">
        <table class="table">
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
              <td>Ertragsniveau nach Tab. 2 bzw. 4 [dt/ha]</td>
              <td contenteditable="true" @blur="save($event,'duevYieldLvl')">
                {{ selectedCrop.duevYieldLvl }}
              </td>
            </tr>
            <tr>
              <td>N-Düngebedarf nach Tab. 2 bzw. 4 [kg/ha]</td>
              <td contenteditable="true" @blur="save($event,'nRequirement')">
                {{ selectedCrop.nRequirement }}
              </td>
            </tr>
            <tr>
              <td>Maximaler N-Bedarfszuschlag bei Mehrertrag je dt (Tab. 3) [kg/ha]</td>
              <td contenteditable="true" @blur="save($event,'nMaxAddition')">
                {{ selectedCrop.nMaxAddition }}
              </td>
            </tr>
            <tr>
              <td>Minimaler N-Bedarfsabzug bei Minderertrag je dt (Tab. 3) [kg/ha]</td>
              <td contenteditable="true" @blur="save($event,'nMinSubtraction')">
                {{ selectedCrop.nMinSubtraction }}
              </td>
            </tr>
            <tr>
              <td>Durchschnittliche Menge N aus organischer Düngung [kg/ha]</td>
              <td contenteditable="true" @blur="save($event,'nFertPrevYear')">
                {{ selectedCrop.nFertPrevYear || 0 }}
              </td>
            </tr>
            <tr>
              <td>N-Bedarfsabzug wenn Vorfrucht (Tab. 7 bzw. 4) [kg/ha]</td>
              <td contenteditable="true" @blur="save($event,'prevCropEff')">
                {{ selectedCrop.prevCropEff }}
              </td>
            </tr>
            <tr>
              <td>P-Entzug (Tab. X) [kg/ha]</td>
              <td contenteditable="true" @blur="save($event,'pWithdraw')">
                {{ selectedCrop.pWithdraw }}
              </td>
            </tr>
            <tr>
              <td>P-Rückstände Erntereste [kg/ha]</td>
              <td contenteditable="true" @blur="save($event,'pHarvestLeft')">
                {{ selectedCrop.pHarvestLeft }}
              </td>
            </tr>
            <tr>
              <td>Ertragspotenzial bei 20% reduzierter Düngung [%]</td>
              <td contenteditable="true" @blur="save($event,'yieldRed20')">
                {{ selectedCrop.yieldRed20 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="text-align:center;margin-top: 40px;">
        <button class="button" type="button" name="button" @click="remove">
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
      <button class="button" style="margin-left: 20px;" @click="importPrev">
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
    async save(e, type, value) {
      try {
        const newValue = Number(e.target.innerText)
        if (type === 'subseqCrops') {
          this.$set(this.selectedCrop.subseqCrops, value, newValue)
        } else {
          this.$set(this.selectedCrop, type, newValue)
        }
        const update = await this.$db.put(this.selectedCrop)
        this.selectedCrop._rev = update.rev
      } catch (e) {
        console.log(e)
      }
    },
    async saveCheckbox(e, prop) {
      try {
        const newValue = e.target.checked
        this.$set(this.selectedCrop, prop, newValue)
        const update = await this.$db.put(this.selectedCrop)
        this.selectedCrop._rev = update.rev
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
