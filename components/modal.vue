<template lang="html">
  <div>
    <div class="blur">
      <div v-if="loading" class="lds-spinner">
        <div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div />
      </div>
      <div v-else class="box">
        <div class="inputs">
          <h2 class="infoText">
            {{ head }}
          </h2>
        </div>
        <p class="text-body">
          {{ body }}
        </p>
        <div class="buttons-modal">
          <button class="buttonOk button" @click="handleOk">
            {{ buttonOk }}
          </button>
          <button class="buttonCancel button" @click="handleCancle">
            {{ buttonCancel }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import notifications from '~/components/notifications'

export default {
  props: {
    callback: {
      type: Function,
      required: true
    },
    head: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: false,
      default: ''
    },
    buttonOk: {
      type: String,
      required: false,
      default: 'ÜBERNEHMEN'
    },
    buttonCancel: {
      type: String,
      required: false,
      default: 'ABBRECHEN'
    }
  },
  data() {
    return {
      loading: false,
    }
  },
  notifications: notifications,
  methods: {
    async handleOk() {
      this.loading = true
      await this.callback()
      this.loading = false
      this.$emit('closeModal')
    },
    handleCancle() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style scoped>

.box {
  width: 400px;
  height: 250px;
  margin-bottom: 100px;
}

.infoText {
  margin-top: 40px;
  text-align: center;
  font-size: 18px;
  padding-bottom: 15px;
  letter-spacing: 0.2em;
  font-weight: normal;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
}

.text-body {
  font-weight: 300;
  text-align: center;
}

.buttonOk {
  width: 130px;
}

.buttonOk:hover {
  background-color: #79ae98;
  color: white;
}


.buttonCancel {
  width: 130px;
}

.buttonCancel:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
