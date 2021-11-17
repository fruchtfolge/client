<template lang="html">
  <div>
    <div class="blur" :class="{ modalLoading: loading }">
      <div class="lds-spinner">
        <div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div />
      </div>
    </div>
    <div class="box">
      <div class="inputs">
        <h2 class="infoText">
          {{ head }}
        </h2>
      </div>
      <p class="text-body">
        {{ body }}
      </p>
      <button class="buttonOk button" @click="handleOk">
        {{ buttonOk }}
      </button>
      <button class="buttonCancel button" @click="handleCancle">
        {{ buttonCancel }}
      </button>
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
    },
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
.blur {
  padding-top: 100px;
}
.modalLoading {
  z-index: 1001;
}

.box {
  width: 400px;
  height: 250px;
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
  position: absolute;
  bottom: 35px;
  left: 45px;
  width: 130px;
}

.buttonOk:hover {
  background-color: #79ae98;
  color: white;
}

.buttonCancel {
  position: absolute;
  bottom: 35px;
  right: 45px;
  width: 130px;
}

.buttonCancel:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
