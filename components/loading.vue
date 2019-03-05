<template>
  <div class="loading-page" v-if="loading">
    <vue-simple-spinner font-size="20" spacing="20" class="spinner" line-fg-color="#79ae98" message="LÄDT..."></vue-simple-spinner>
  </div>
</template>

<script>
import Spinner from 'vue-simple-spinner'

export default {
  components: {
    'vue-simple-spinner': Spinner
  },
  data: () => ({
    loading: false
  }),
  methods: {
    start () {
      this.loading = true
    },
    finish () {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.loading-page {
  background: #F5F5F5;
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 95;
  transition: all 0.4s ease-in-out; */
  opacity: 0.8;
}
.spinner {
  position: fixed;
  top: 50%;
  margin-top: -19px;
  left: 50%;
  margin-left: -19px;
  letter-spacing: 0.1em;
}
</style>
