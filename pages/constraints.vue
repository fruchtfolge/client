<template>
  <div>
    <div class="page-container">
      <div v-if="crops && crops.length > 0">
        <addConstraint v-if="addConstraint" :crops="crops" @closeAddConstraint="addConstraint = false" />
        <div v-if="constraints" style="width: 100%;">
          <table class="table">
            <caption class="caption">
              Minimale/Maximale Kulturanteile
            </caption>
            <thead>
              <tr>
                <th></th>
                <th style="text-align: left">Name</th>
                <th style="text-align: left">Mehr/weniger</th>
                <th style="text-align: right">Menge</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="constraint in constraints" :key="constraint.id">
                <td>
                  <input v-model="constraint._deleted" style="-webkit-appearance: checkbox;" type="checkbox">
                </td>
                <td>{{ constraint.name }}</td>
                <td style="text-align: left;">
                  {{ constraint.operator === '>' ? 'mehr als' : 'weniger als' }}
                </td>
                <td style="text-align: right;" class="value-cell">
                  {{ constraint.area + ' ' + constraint.sizeType }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else style="text-align: center; margin-top: 100px;">
          <h3>Fügen Sie Anbaurestriktionen durch Klicken auf den 'Hinzufügen'-Button hinzu.</h3>
        </div>
        <div style="text-align: center; margin-top: 40px;">
          <button class="addConstraint button" style="font-family: 'Open Sans Condensed';" @click="addConstraint = true">
            HINZUFÜGEN
          </button>
          <button v-if="constraints && toDelete && toDelete.length" class="addConstraint button" style="font-family: 'Open Sans Condensed'; margin-left: 20px;" @click="remove">
            ENTFERNEN
          </button>
        </div>
      </div>
      <div v-else style="text-align: center; margin-top: 100px;">
        <h3>Noch keine Kulturen für das ausgewähle Planungsjahr und Szenario vorhanden.</h3>
      </div>
    </div>
  </div>
</template>
<script>
import notifications from '~/components/notifications'

export default {
  components: {
    addConstraint: () => import('~/components/add_constraint.vue')
  },
  notifications: notifications,
  data() {
    return {
      addConstraint: false,
      crops: null,
      constraints: null
    }
  },
  computed: {
    toDelete() {
      return this.constraints.filter(
        constraint => constraint._deleted
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
      this.$set(this, 'crops', this.$store.curCrops)
      this.$set(this, 'constraints', this.$store.curConstraints)
    },
    async remove() {
      try {
        const toDelete = this.toDelete
        await this.$db.bulkDocs(toDelete)
        this.saveSuccess()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    }
  }
}
</script>
<style scoped>
.caption {
  margin-bottom: 10px;
}

.table th,td {
  padding-left: 10px;
  padding-right: 10px;
}
</style>
