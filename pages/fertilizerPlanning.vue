<template>
  <div>
    <div v-if="dataAvail" class="plotOverview">
      <table>
        <thead>
          <tr>
            <th style="min-width: 250px;">
              Name
            </th>
            <th>Ertragsniveau 3 Jahr Ø Betrieb [dt/ha]</th>
            <th>N-Bedarfswert [kg N/ha]</th>
            <th>Zu- oder Abschlag Ertragsdifferenz [kg N/ha]</th>
            <th>Abschlag Nmin-Probe/Richtwert [kg N/ha]</th>
            <th>Abschlag Standort/Humus [kg N/ha]</th>
            <th>Abschlag org. Düngung der Vorjahre [kg N/ha]</th>
            <th>Abschlag Vorfrucht/ZF [kg N/ha]</th>
            <th>Stickstoffdüngebedarf Vegetation [kg N/ha]</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plot, i) in plots" :key="i">
            <td style="text-align: center;">
              {{ plot.name }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].avgYield }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nReq }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nYieldDiff }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nMinDiff }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].humusContent }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nFertPrevYear }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].nPrevCrop }}
            </td>
            <td style="text-align: center;">
              {{ nData[plot._id].sum }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else style="text-align: center; margin-top: 100px;">
      <h3>Noch keine Schläge für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
      <h3>
        Sie können neue Schläge auf der Seite 'Karte' einzeichnen.
        <br>
        Alternativ können Sie Daten aus dem vorherigen Anbaujahr importieren.
      </h3>
      <button @click="$nuxt.$router.replace({path: 'maps'})">
        ZUR KARTE
      </button>
      <button style="margin-left: 20px;" @click="importPrev">
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
      nData: {},
      curYear: 2019,
      waiting: false
    }
  },
  computed: {
    dataAvail() {
      let bool = true
      console.log(this.nData)
      if (this.nData && this.plots && this.plots.length) {
        this.plots.forEach(p => {
          if (!this.nData[p._id]) {
            console.log(p)
            bool = false
          }
          if (!p.crop && !p.selectedCrop) {
            console.log(p._id, 'crop')
            bool = false
          }
        })
      } else {
        bool = false
      }
      return bool
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
      this.calcData()
      // console.log(this.nData)
    },
    calcData() {
      this.plots.forEach(plot => {
        // use crop that was acutally grown over selected crop
        // const cropCode = plot.crop ? plot.crop : plot.selectedCrop
        const cropName = plot.selectedCrop
        console.log(cropName)
        const crop = _.find(this.crops, ['name', cropName])
        if (!crop) return
        const data = {
          avgYield: this.avgYield(cropName)
            ? this.avgYield(cropName)
            : crop.duevYieldLvl,
          nReq: crop.nRequirement,
          nYieldDiff: this.nYieldDiff(
            this.avgYield(cropName),
            crop.duevYieldLvl,
            crop
          ),
          nMinDiff: 0,
          humusContent: this.humusContent(plot.humusContent),
          nFertPrevYear: 0,
          nPrevCrop: 0
        }
        data.sum =
          data.nReq +
          data.nYieldDiff +
          data.nMinDiff +
          data.humusContent +
          data.nFertPrevYear +
          data.nPrevCrop

        this.nData[plot._id] = data
        console.log(data)
      })
    },
    humusContent(content) {
      if (
        !content ||
        content === '1 - <2%' ||
        content === '2 - <3%' ||
        content === '3 - <4%' ||
        content === 'Siedlungen' ||
        content === 'nicht bestimmt'
      ) {
        return 0
      } else {
        return -20
      }
    },
    nYieldDiff(avgYield, duevYield, crop) {
      let deviation = 0
      if (avgYield) {
        deviation = avgYield - duevYield
      }
      if (deviation >= 0) {
        return _.round(crop.nMaxAddition * deviation, 1)
      } else {
        return _.round(crop.nMinSubtraction * deviation, 1)
      }
    },
    avgYield(name) {
      // find object for crop of last 3 years
      const data = this.$store.crops.filter(c => {
        return (
          c.year >= this.curYear - 3 &&
          c.scenario === this.$store.curScenario &&
          c.name === name
        )
      })
      // console.log(data)
      if (data) {
        const yieldSum = _.sum(
          data.map(d => {
            return _.sumBy(d.contributionMargin.revenues, o => {
              return o.amount.value
            })
          })
        )
        return _.round(yieldSum / data.length, 1) * 10
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
.plotOverview table input {
  -webkit-appearance: checkbox;
}
</style>
