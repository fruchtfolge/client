<template>
  <div class="blur">
    <div class="spinner-container">
      <div class="lds-spinner">
        <div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div />
      </div>
      <h2 style="text-align: center; font-family: 'Open Sans Condensed'">
        {{ header }} <br> {{ main }}
      </h2>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    header: {
      type: String,
      required: false,
      default: 'Daten werden geladen ...'
    },
    main: {
      type: String,
      required: false,
      default: 'Der Vorgang kann einige Minuten in Anspruch nehmen'
    },
    opacity: {
      type: Number,
      required: false,
      default: 1
    }
  }
}
</script>

<style scoped>
.blur {
  background: #f5f5f5;
  position: absolute;
  width: 100%;
  height: 100vh;
  z-index: 95;
  transition: all 0.8s ease-in-out;
  opacity: 1;
  visibility: visible;
}

.spinner-container {
  position: fixed;
  width: 100%;
  top: calc(50% - 60px);
}
</style>
