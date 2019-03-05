<template>
  <div>
    <div v-if="crops && crops.length > 0">
      <addConstraint v-if="addConstraint" :crops="crops" v-on:closeAddConstraint="addConstraint = false"/>
      <div style="width: 100%;">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mehr/weniger</th>
              <th>Menge</th>
              <th style="background-color: #f5f5f5"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="constraint in constraints" :key="constraint.id">
              <td>{{ constraint.name }}</td>
              <td style="text-align: center;">{{ constraint.operator === '>' ? 'mehr als' : 'weniger als' }}</td>
              <td style="text-align: center;">{{ constraint.area + ' ' + constraint.sizeType }}</td>
              <td style="background-color: #f5f5f5">
                <input style="-webkit-appearance: checkbox;" type="checkbox" v-model="constraint._deleted">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="text-align: center; margin-top: 40px;">
        <button class="addConstraint" style="font-family: 'Open Sans Condensed';" @click="addConstraint = true">HINZUFÜGEN</button>
        <button class="addConstraint" style="font-family: 'Open Sans Condensed'; margin-left: 20px;" @click="remove">ENTFERNEN</button>
      </div>
    </div>
    <div style="text-align: center; margin-top: 100px;" v-else>
      <h3>Noch keine Kulturen für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      addConstraint: false,
      crops: null,
      constraints: null,
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
        const deleted = this.constraints.filter(constraint => constraint._deleted)
        await this.$db.bulkDocs(deleted)
      } catch (e) {
        console.log(e);
      }
    }
  },
  components: {
    addConstraint: () => import('~/components/add_constraint.vue'),
  }
}
</script>
<style>

</style>
