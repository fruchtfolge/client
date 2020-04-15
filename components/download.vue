<template>
  <div class="">
    <a @click="onexport">
      Excel Download
    </a>
  </div>
</template>

<script>
import XLSX from 'xlsx'

export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    gmArab: {
      type: Number,
      required: true
    },
    gmTotal: {
      type: Number,
      required: true
    },
    costsManureSpring: {
      type: Number,
      required: false,
      default: 0
    },
    costsManureAutumn: {
      type: Number,
      required: false,
      default: 0
    },
    volManureSpring: {
      type: Number,
      required: false,
      default: 0
    },
    volManureAutumn: {
      type: Number,
      required: false,
      default: 0
    },
    curShares: {
      type: Array,
      required: true
    },
    /*
    fields: {
      type: Array,
      required: true
    },
    */
    year: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      fields: undefined
    }
  },
  methods: {
    prepare(entry) {
      const output = {}
      this.fields.forEach(field => {
        const displayName = field[0]
        if (entry[field[1]]) {
          output[displayName] = entry[field[1]]
        } else if (field[1].split('.')[1]) {
          output[displayName] =
            entry[field[1].split('.')[0]][field[1].split('.')[1]]
        } else {
          output[displayName] = ''
        }
      })
      return output
    },
    onexport() {
      this.fields = [
        ['Name', 'name'],
        ['Nummer', 'id'],
        ['Größe (ha)', 'size'],
        ['Hof-Feld-Distanz (km)', 'distance'],
        ['Feldblock (FLIK)', 'flik'],
        ['Koordinaten', 'center'],
        ['Dauergrünland', 'permPast'],
        ['Hackfruchtfähig', 'rootCrops'],
        ['Bodenart', 'soilType'],
        ['Bodenqualität', 'quality'],
        ['Humusgehalt', 'humusContent'],
        ['Rotes Gebiet', 'duevEndangered'],
        [`${this.year - 3}`, 'prevCrop3'],
        [`${this.year - 2}`, 'prevCrop2'],
        [`${this.year - 1}`, 'prevCrop1'],
        ['Zwischenfrucht', 'selectedOption.catchCrop'],
        [`Planung ${this.year}`, 'selectedCrop'],
        ['Org. Düngung', 'selectedOption.manAmount'],
        ['Herbstdüngung', 'selectedOption.autumnFert'],
        ['N-Reduzierung', 'selectedOption.nReduction'],
        ['Ertrag [dt/ha]', 'selectedOption.correctedAmount'],
        ['Preis [dt/ha]', 'selectedOption.price'],
        ['Leistung [€/ha]', 'selectedOption.revenue'],
        ['Direktkosten [€/ha]', 'selectedOption.directCosts'],
        ['davon min. Düngerkosten [€/ha]', 'selectedOption.fertCosts'],
        ['Kosten Zwischenfrucht [€/ha]', 'selectedOption.catchCropCosts'],
        ['Var. Maschinenkosten [€/ha]', 'selectedOption.variableCosts'],
        [
          'davon Ausbringungskosten org. Dünger [€/ha]',
          'selectedOption.fertMachCosts'
        ],
        ['Deckungsbeitrag Planungjahr', 'curGrossMargin']
      ]
      const order = this.fields.map(a => {
        return a[0]
      })
      // create intermediate JSON in order to be able to export
      const exportData = this.data.map(this.prepare)
      // add sum of gross margins, and manure export costs
      exportData.push({
        Name: 'Summe Ackerbau',
        'Deckungsbeitrag Planungjahr': this.gmArab
      })
      exportData.push({
        Name: 'Dungexport Frühjahr',
        'davon Ausbringungskosten org. Dünger [€/ha]': this.volManureSpring,
        'Deckungsbeitrag Planungjahr': this.costsManureSpring
      })
      exportData.push({
        Name: 'Dungexport Herbst',
        'davon Ausbringungskosten org. Dünger [€/ha]': this.volManureAutumn,
        'Deckungsbeitrag Planungjahr': this.costsManureAutumn
      })
      exportData.push({
        Name: 'Summe',
        'Deckungsbeitrag Planungjahr': this.gmTotal
      })
      exportData.push([])
      this.curShares.forEach(crop => {
        exportData.push({
          Name: crop.name,
          Nummer: crop.data
        })
      })
      const exportWS = XLSX.utils.json_to_sheet(exportData, { header: order })
      const wb = XLSX.utils.book_new() // make Workbook of Excel
      // add Worksheet to Workbook
      XLSX.utils.book_append_sheet(wb, exportWS, 'Fruchtfolge')
      // export Excel file
      // count plots in red area
      const red = this.data.reduce((acc, cur) => {
        if (cur.duevEndangered) {
          acc++
        }
        return acc
      }, 0)
      let opt = 'Opt'
      if (this.data[0].allowedCrops && this.data[0].allowedCrops.length)
        opt = 'NoOpt'
      // XLSX.writeFile(wb, `Fruchtfolge - Planung ${this.year}.xlsx`)
      XLSX.writeFile(wb, `Fruchtfolge - ${red} red area - ${opt}.xlsx`)
    }
  }
}
</script>
