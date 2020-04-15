<template>
  <div>
    <div class="page-container">
      <addCrop v-if="addCrop" @closeAddCrop="addCrop = false" />
      <cropsSidebar :crops="crops" :selected-crop="selectedCrop" @showAddCrop="addCrop = true" @changeCrop="changeCrop" />
      <div v-if="selectedCrop" class="cropSettings">
        <div class="subseqCrops">
          <table class="table">
            <caption class="caption">
              Vorfruchtwirkungen von {{ selectedCrop.name }} auf Nachfrüchte
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
                <td contenteditable="true" @blur="save($event, 'subseqCrops', subseq.cropGroup)" @keydown.enter="$event.target.blur()">
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
                <td contenteditable="true" @blur="save($event, 'rotBreak')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.rotBreak }}
                </td>
              </tr>
              <tr>
                <td>Max. Anteil Anbaufläche [%]</td>
                <td contenteditable="true" @blur="save($event, 'maxShare')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.maxShare }}
                </td>
              </tr>
              <tr>
                <td>Mindestanforderung Bodenqualität</td>
                <td contenteditable="true" @blur="save($event, 'minSoilQuality')" @keydown.enter="$event.target.blur()">
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
                <td contenteditable="true" @blur="save($event,'efaFactor')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.efaFactor }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!isGreenlandCrop" class="duevSettings">
          <table class="table">
            <caption class="caption">
              Einstellungen Düngeverordnung 2017/2020
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
                <td contenteditable="true" @blur="save($event,'duevYieldLvl')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.duevYieldLvl }}
                </td>
              </tr>
              <tr>
                <td>N-Düngebedarf nach Tab. 2 bzw. 4 [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nRequirement')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nRequirement }}
                </td>
              </tr>
              <tr>
                <td>N-Sollwert [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nTargetValue')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nTargetValue || selectedCrop.nRequirement }}
                </td>
              </tr>
              <tr>
                <td>Max. Güllemenge [m³/ha]</td>
                <td contenteditable="true" @blur="save($event,'maxOrganicN')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.maxOrganicN || 60 }}
                </td>
              </tr>
              <tr>
                <td>Maximaler N-Bedarfszuschlag bei Mehrertrag je dt (Tab. 3) [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nMaxAddition')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nMaxAddition }}
                </td>
              </tr>
              <tr>
                <td>Minimaler N-Bedarfsabzug bei Minderertrag je dt (Tab. 3) [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nMinSubtraction')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nMinSubtraction }}
                </td>
              </tr>
              <tr>
                <td>Durchschnittliche Menge N aus organischer Düngung der Vorjahre [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nFertPrevYear')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nFertPrevYear || 0 }}
                </td>
              </tr>
              <tr>
                <td>N-Bedarfsabzug wenn Vorfrucht (Tab. 7 bzw. 4) [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'prevCropEff')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.prevCropEff }}
                </td>
              </tr>
              <tr>
                <td>P-Entzug (nach §4(3)) [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'pWithdraw')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.pWithdraw }}
                </td>
              </tr>
              <tr>
                <td>P-Rückstände Erntereste [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'pHarvestLeft')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.pHarvestLeft }}
                </td>
              </tr>
              <tr>
                <td>Erntereste werden abgefahren</td>
                <td><input type="checkbox" :checked="selectedCrop.harvestLeft" @change="saveCheckbox($event,'harvestLeft')"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="duevSettings">
          <table class="table">
            <caption class="caption">
              Einstellungen Düngeverordnung Grünland 2020
            </caption>
            <thead>
              <tr>
                <th>Eigenschaft</th>
                <th>Wert</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ertragsniveau nach Tab. 9 [dt TM/ha]</td>
                <td contenteditable="true" @blur="save($event,'duevYieldLvl')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.duevYieldLvl }}
                </td>
              </tr>
              <tr>
                <td>Ertragsniveau 5 Jahr Ø Betrieb [dt TM/ha]</td>
                <td contenteditable="true" @blur="save($event,'avgYieldLvl')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.avgYieldLvl }}
                </td>
              </tr>
              <tr>
                <td>Rohproteingehalt nach Tab. 9 [dt TM/ha]</td>
                <td contenteditable="true" @blur="save($event,'duevRPlvl')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.duevRPlvl }}
                </td>
              </tr>
              <tr>
                <td>Ertragsniveau RP 5 Jahr Ø Betrieb [% RP i.d. TM]</td>
                <td contenteditable="true" @blur="save($event,'avgRPperc')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.avgRPperc }}
                </td>
              </tr>
              <tr>
                <td>N-Düngebedarf nach Tab. 9 [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nRequirement')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nRequirement }}
                </td>
              </tr>
              <tr>
                <td>N-Sollwert [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nTargetValue')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nTargetValue || selectedCrop.nRequirement }}
                </td>
              </tr>
              <tr>
                <td>Max. Güllemenge [m³/ha]</td>
                <td contenteditable="true" @blur="save($event,'maxOrganicN')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.maxOrganicN || 60 }}
                </td>
              </tr>
              <tr>
                <td>Zu- oder Abschlag bei Ertragsdifferenz je 10 dt (Tab. 10) [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nChangeYieldDiff')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nChangeYieldDiff }}
                </td>
              </tr>
              <tr>
                <td>Zu- oder Abschlag je 1 % Rohprotein in der TM Rohproteindifferenz je 10 dt (Tab. 10) [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nChangeRPDiff')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nChangeRPDiff }}
                </td>
              </tr>
              <tr>
                <td>Durchschnittliche Menge N aus organischer Düngung der Vorjahre [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nFertPrevYear')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nFertPrevYear || 0 }}
                </td>
              </tr>
              <tr>
                <td>Abschläge für Stickstoffnachlieferung aus der Stickstoffbindung von Leguminosen (Tab. 12) [kg/ha]</td>
                <td contenteditable="true" @blur="save($event,'nLegumeRed')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.nLegumeRed }}
                </td>
              </tr>
              <tr>
                <td>P-Entzug (nach §4(3)) [kg/dt TM]</td>
                <td contenteditable="true" @blur="save($event,'pWithdraw')" @keydown.enter="$event.target.blur()">
                  {{ selectedCrop.pWithdraw }}
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
  </div>
</template>

<script>
import notifications from '~/components/notifications'
import { sanitizeInput } from '~/components/helpers'

export default {
  components: {
    addCrop: () => import('~/components/add_crop.vue'),
    cropsSidebar: () => import('~/components/crops_sidebar.vue')
  },
  notifications: notifications,
  data() {
    return {
      crops: undefined,
      toggle: true,
      selectedCrop: undefined,
      addCrop: false
    }
  },
  computed: {
    isGreenlandCrop() {
      let flag = false
      const greenLandCropCodes = [
        459,
        421,
        422,
        423,
        424,
        425,
        426,
        427,
        429,
        430,
        431,
        432,
        433
      ]
      if (
        this.selectedCrop &&
        greenLandCropCodes.indexOf(this.selectedCrop.code) > -1
      ) {
        flag = true
      }
      return flag
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
      let newValue
      try {
        // get new value that was entered into the table cell
        newValue = sanitizeInput(e.target.innerText)
        if (
          type === 'subseqCrops' &&
          newValue === this.selectedCrop.subseqCrops[value]
        )
          return
        else if (newValue === this.selectedCrop[type]) return
      } catch (err) {
        this.noNumber()
        // replace with previous value
        if (type === 'subseqCrops') {
          e.target.innerText = this.selectedCrop.subseqCrops[value]
        } else {
          e.target.innerText = this.selectedCrop[type]
        }
        return
      }
      try {
        if (type === 'subseqCrops') {
          this.$set(this.selectedCrop.subseqCrops, value, newValue)
        } else {
          this.$set(this.selectedCrop, type, newValue)
        }
        const update = await this.$db.put(this.selectedCrop)
        this.selectedCrop._rev = update.rev
        this.saveSuccess()
      } catch (e) {
        this.saveError()
        console.log(e)
      }
    },
    async saveCheckbox(e, prop) {
      try {
        const newValue = e.target.checked
        this.$set(this.selectedCrop, prop, newValue)
        const update = await this.$db.put(this.selectedCrop)
        this.selectedCrop._rev = update.rev
        this.saveSuccess()
      } catch (e) {
        this.saveError()
        console.log(e)
      }
    },
    async remove() {
      try {
        await this.$db.remove(this.selectedCrop)
        this.showCropRemoveSucc()
      } catch (e) {
        this.showError()
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
