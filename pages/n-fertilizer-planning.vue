<template>
  <div>
    <div v-if="dataAvail" class="plotOverview">
      <table v-if="arablePlots && arablePlots.length" class="table-fert table">
        <caption class="caption">
          Düngebedarfsermittlung Ackerbau
        </caption>
        <thead>
          <tr>
            <th rowspan="2">
              Name
            </th>
            <th rowspan="2">
              Kultur
            </th>
            <th rowspan="2">
              Ertragsniveau 5 Jahre Ø Betrieb [dt/ha]
            </th>
            <th rowspan="2">
              N-Bedarfswert [kg N/ha]
            </th>
            <th colspan="5">
              Zu- oder Abschläge [kg N/ha]
            </th>
            <th rowspan="2">
              N-Düngebedarf [kg N/ha]
            </th>
            <th rowspan="2">
              N-Reduktion im roten Gebiet
            </th>
            <th rowspan="2">
              N-Düngebedarf abzgl. Reduktion [kg N/ha]
            </th>
            <th colspan="2">
              Planung [kg N/ha]
            </th>
          </tr>
          <tr>
            <th>Ertragsdifferenz</th>
            <th>Nmin-Probe / Richtwert</th>
            <th>Humusgehalt</th>
            <th>Org. Düngung der Vorjahre</th>
            <th>Vorfrucht / ZF</th>
            <th>
              Org. Düngung
            </th>
            <th>
              Min. Düngung
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot, i) in arablePlots" :key="i">
            <td style="width: 100px;" class="cell-text">
              {{ plot.name }}
            </td>
            <td style="width: 100px;" class="cell-text">
              {{ plot.selectedCrop }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.avgYield }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nReq }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nYieldDiff }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nMinDiff }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.humusContent }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nFertPrevYear }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nPrevCrop }}
            </td>
            <td class="cell-number" style="font-weight: bold;">
              {{ plot.selectedOption.nSum }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nReduction }}%
            </td>
            <td class="cell-number" style="font-weight: bold;">
              {{ plot.selectedOption.reducedNSum }}
            </td>
            <td class="cell-number">
              {{ orgN(plot) }}
            </td>
            <td class="cell-number" style="padding-right: 10px;">
              {{ minN(plot) }}
            </td>
          </tr>
        </tbody>
      </table>
      <table v-if="greenlandPlots && greenlandPlots.length" class="table-fert table">
        <caption class="caption">
          Düngebedarfsermittlung Grünland und Feldfutter
        </caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Kultur</th>
            <th>Ertragsniveau 5 Jahr Ø Betrieb [dt TM/ha]</th>
            <th>Ertragsniveau RP 5 Jahr Ø Betrieb [% RP i.d. TM]</th>
            <th>N-Bedarfswert [kg N/ha]</th>
            <th>Zu- oder Abschlag Ertragsdifferenz [kg N/ha]</th>
            <th>Zu- oder Abschlag RP Differenz [kg N/ha]</th>
            <th>Abschlag org. Düngung der Vorjahre [kg N/ha]</th>
            <th>Abschlag N aus Bodenvorrat [kg N/ha]</th>
            <th>Abschlag N-Bindung Leguminosen [kg N/ha]</th>
            <th>Stickstoffdüngebedarf Vegetation [kg N/ha]</th>
            <th>Planung Org. Düngung [kg N/ha]</th>
            <th>Planung Min. Düngung [kg N/ha]</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot, i) in greenlandPlots" :key="i">
            <td style="width: 100px;" class="cell-text">
              {{ plot.name }}
            </td>
            <td style="width: 100px;" class="cell-text">
              {{ plot.selectedCrop }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.avgYield }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.avgRPperc }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nReq }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nYieldDiff }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nRPDiff }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nFertPrevYear }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.humusContent }}
            </td>
            <td class="cell-number">
              {{ plot.selectedOption.nLegumeRed }}
            </td>
            <td class="cell-number" style="font-weight: bold;">
              {{ plot.selectedOption.nSum }}
            </td>
            <td class="cell-number">
              {{ orgN(plot) }}
            </td>
            <td class="cell-number" style="padding-right: 10px;">
              {{ minN(plot) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!dataAvail && plotsAvail" style="text-align: center; margin-top: 100px;">
      <h3>
        Es wurde noch keine Anbauplanung für das Planungsjahr {{ curYear }} angelegt.
        <br><br>Klicken Sie auf den Link 'Anbauplanung' um loszulegen.
      </h3>
      <br>
      <button class="button" @click="$nuxt.$router.push({path: 'results'})">
        NEUE PLANUNG
      </button>
    </div>
    <div v-if="!dataAvail && !plotsAvail" style="text-align: center; margin-top: 100px;">
      <h3>Noch keine Schläge für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
      <h3>
        Sie können neue Schläge auf der Seite 'Karte' einzeichnen.
        <br>
        Alternativ können Sie Daten aus dem vorherigen Anbaujahr importieren.
      </h3>
      <button class="button" @click="$nuxt.$router.push({path: 'maps'})">
        ZUR KARTE
      </button>
      <button class="button" style="margin-left: 20px;" @click="importPrev">
        IMPORTIEREN
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      plots: null,
      crops: null,
      curYear: 2019,
      greenLandCropCodes: [
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
      ],
      waiting: false
    }
  },
  computed: {
    plotsAvail() {
      if (this.plots && this.plots.length) return true
      return false
    },
    dataAvail() {
      let bool = true
      if (this.plots && this.plots.length) {
        this.plots.forEach(p => {
          if (!p.selectedOption) {
            bool = false
          }
        })
      } else {
        bool = false
      }
      return bool
    },
    filteredPlots() {
      const filtered = this.plots.filter(p => p.selectedOption.nReq)
      return filtered
    },
    greenlandPlots() {
      return this.filteredPlots.filter(
        p => this.greenLandCropCodes.indexOf(p.selectedOption.code) > -1
      )
    },
    arablePlots() {
      return this.filteredPlots.filter(
        p => this.greenLandCropCodes.indexOf(p.selectedOption.code) === -1
      )
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
    update() {
      this.$set(this, 'plots', this.$store.curPlots)
      this.$set(this, 'crops', this.$store.curCrops)
      this.$set(this, 'curYear', this.$store.curYear)
    },
    importPrev() {
      if (!this.waiting) this.$bus.$emit('importPrevYear')
      this.waiting = true
    },
    orgN(plot) {
      if (plot.selectedOption) {
        return _.round(plot.selectedOption.orgNAmount)
      }
      return 0
    },
    minN(plot) {
      if (plot.selectedOption) {
        return _.round(plot.selectedOption.minNAmount)
      }
      return 0
    }
  }
}
</script>

<style>
.plotOverview table input {
  -webkit-appearance: checkbox;
}

.table-fert {
  table-layout: fixed;
  width: 100%;
  min-width: 800px;
  max-width: 1300px;
  margin: 20px 0px 0px 20px;
}

.table-fert th {
  padding-left: 2px;
  padding-right: 2px;
}
.cell-text {
  text-align: left;
}

.cell-number {
  text-align: right;
}
</style>
