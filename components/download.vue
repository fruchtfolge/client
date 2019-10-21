<template>
  <div class="">
    <a @click="onexport">
      Excel Download
    </a>
  </div>
</template>

<script>
// import XLSX from 'xlsx'

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
          output[displayName] = entry[field[1]]
        } else {
          output[displayName] = ''
        }
      })
      return output
    },
    async onexport() {
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
      // let backend create excel workbook and store it
      await this.$axios.post(
        process.env.baseUrl + 'excel/excel/',
        { data: exportData, columns: order },
        { progress: true }
      )
      // finally request workbook and download
      const data = await this.$axios.get(process.env.baseUrl + 'excel/excel/', {
        progress: true,
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `Fruchtfolge - Planung ${this.curYear}.xlsx`
      )
      document.body.appendChild(link)
      link.click()
    }
  }
}
</script>
