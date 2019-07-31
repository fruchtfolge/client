<template>
  <div class="">
    <button class="f-btn" type="button" @click="onexport">
      Excel Download
    </button>
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
          if (field[1] === 'curGrossMargin' && entry.catchCrop) {
            output[displayName] = entry[field[1]] - entry.matrix.catchCropCosts
          } else {
            output[displayName] = entry[field[1]]
          }
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
        [`${this.year - 3}`, 'prevCrop3'],
        [`${this.year - 2}`, 'prevCrop2'],
        [`${this.year - 1}`, 'prevCrop1'],
        ['Zwischenfrucht', 'catchCrop'],
        [`Planung ${this.year}`, 'selectedCrop'],
        ['Deckungsbeitrag Planungjahr', 'curGrossMargin']
      ]
      const order = this.fields.map(a => {
        return a[0]
      })
      // create intermediate JSON in order to be able to export
      const exportData = this.data.map(this.prepare)

      const exportWS = XLSX.utils.json_to_sheet(exportData, { header: order })
      const wb = XLSX.utils.book_new() // make Workbook of Excel

      // add Worksheet to Workbook
      XLSX.utils.book_append_sheet(wb, exportWS, 'Fruchtfolge')
      console.log('test')
      // export Excel file
      XLSX.writeFile(wb, `Fruchtfolge - Planung ${this.year}.xlsx`)
    }
  }
}
</script>
