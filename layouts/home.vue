<template>
  <div>
    <div id="header" class="header">
      <img src="~/assets/img/Web_2.png" alt="Uni Bonn Logo" class="uniBonn">
      <nuxt-link to="/" class="logo-home">
        FRUCHTFOLGE
      </nuxt-link>
      <!-- Switch between register and login -->
      <button v-if="$nuxt.$route.path === '/'" class="register button" @click="flip">
        {{ buttonText }}
      </button>
    </div>
    <!-- this is where the main application lives -->
    <nuxt class="nuxt" />
    <!-- Footer for legal texts-->
    <div class="footer">
      <nuxt-link to="/kontakt">
        Kontakt
      </nuxt-link>
      <nuxt-link to="/impressum">
        Impressum
      </nuxt-link>
      <nuxt-link to="/nutzungsbedingungen">
        Nutzungsbedingungen
      </nuxt-link>
      <nuxt-link to="/datenschutz">
        Datenschutz
      </nuxt-link>
    </div>
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
      this.$bus.$emit('flip', null)
    }
  }
}
</script>

<style>
body,
html {
  margin: 0px;
  padding: 0px;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background-color: #f5f5f5;
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

.uniBonn {
  height: 60px;
  border-width: 0px;
}

.logo-home {
  color: black;
  font-family: 'Open Sans Condensed', sans-serif;
  letter-spacing: 0.3em;
  font-size: 28px;
  position: absolute;
  padding-left: 30px;
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

.footer {
  position: fixed;
  text-align: right;
  bottom: 0px;
  right: 0px;
  padding-right: 10px;
  padding-left: 10px;
  background-color: rgba(0, 0, 0, 0.3);
}
.footer a {
  padding-right: 5px;
  padding-left: 5px;
  text-decoration: none;
  color: white;
}
</style>
