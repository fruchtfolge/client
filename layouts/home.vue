<template>
  <div>
    <div class="header">
      <nuxt-link to="/" class="logo">FRUCHTFOLGE</nuxt-link>
      <!-- Planning year selector -->
      <button class="register" @click="flip">{{ buttonText }}</button>
    </div>
    <!-- this is where the main application lives -->
    <nuxt class="nuxt"></nuxt>
  </div>
</template>

<script>
export default {
  data() {
    return {
      buttonText: 'REGISTRIEREN'
    }
  },
  methods: {
    flip() {
      if (this.buttonText === 'REGISTRIEREN') {
        this.buttonText = 'ANMELDEN'
      } else {
        this.buttonText = 'REGISTRIEREN'
      }
      this.$bus.$emit('flip',null)
    }
  }
}
</script>

<style>

body,html {
  margin: 0px;
  padding: 0px;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #F5F5F5;
  font-family: 'Open Sans Condensed', sans-serif;
}

.header {
  position: fixed;
  cursor: default;
  top: 0px;
  left: 0px;
  height: 60px;
  width: 100%;
  background: white;
  z-index: 97;
  line-height: 60px;
}

.logo {
  color: black;
  font-family: 'Open Sans Condensed', sans-serif;
  letter-spacing: 0.3em;
  font-size: 28px;
  padding-left: 80px;
  margin: 0px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-decoration: none;
}

.register {
  position: fixed;
  right: 30px;
  top: 10px;
}

.nuxt {
  position: relative;
  top: 60px;
  transition: margin-left .5s;
  padding-bottom: 50px;
}


</style>
