<template>
  <div class="">
    <button type="button" @click="onexport">
      Excel Download
    </button>
  </div>
</template>

<script>
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
    async onexport() {
      try {
        const body = {}
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
        body.order = this.fields.map(a => {
          return a[0]
        })
        // create intermediate JSON in order to be able to export
        body.data = this.data.map(this.prepare)
        body.year = this.year
        // export Excel file
        await this.$axios.post(process.env.baseUrl + 'export/excel/', body, {
          progress: true
        })
        // await this.$axios.get(process.env.baseUrl + 'export/excel/', {
        //   progress: true
        // })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
