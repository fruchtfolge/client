<template>
  <div>
    <div v-if="crops && crops.length > 0">
      <addConstraint v-if="addConstraint" :crops="crops" @closeAddConstraint="addConstraint = false" />
      <div style="width: 100%;">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mehr/weniger</th>
              <th>Menge</th>
              <th style="background-color: #f5f5f5" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="constraint in constraints" :key="constraint.id">
              <td>{{ constraint.name }}</td>
              <td style="text-align: center;">
                {{ constraint.operator === '>' ? 'mehr als' : 'weniger als' }}
              </td>
              <td style="text-align: center;">
                {{ constraint.area + ' ' + constraint.sizeType }}
              </td>
              <td style="background-color: #f5f5f5">
                <input v-model="constraint._deleted" style="-webkit-appearance: checkbox;" type="checkbox">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="text-align: center; margin-top: 40px;">
        <button class="f-btn addConstraint" style="font-family: 'Open Sans Condensed';" @click="addConstraint = true">
          HINZUFÜGEN
        </button>
        <button class="f-btn addConstraint" style="font-family: 'Open Sans Condensed'; margin-left: 20px;" @click="remove">
          ENTFERNEN
        </button>
      </div>
    </div>
    <div v-else style="text-align: center; margin-top: 100px;">
      <h3>Noch keine Kulturen für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
    </div>
  </div>
</template>
<script>
export default {
  components: {
    addConstraint: () => import('~/components/add_constraint.vue')
  },
  data() {
    return {
      addConstraint: false,
      crops: null,
      constraints: null
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
      this.$set(this, 'crops', this.$store.curCrops)
      this.$set(this, 'constraints', this.$store.curConstraints)
    },
    async remove() {
      try {
        const deleted = this.constraints.filter(
          constraint => constraint._deleted
        )
        await this.$db.bulkDocs(deleted)
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style>
</style>
