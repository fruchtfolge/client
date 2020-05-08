<template lang="html">
  <loading v-if="loading" />
  <div v-else class="error-container">
    <div v-if="token">
      <div class="box forgot-password-box">
        <p style="margin-top: 10px;">
          NEUES PASSWORT
        </p>
        <div class="forgot-password-label" style="margin-top: 15px; padding-left: 60px; padding-right: 40px;">
          Geben Sie ein neues Passwort in das Eingabefeld ein und bestätigen Sie dieses im darunterliegenden Feld.
          <br>
          Klicken Sie anschließen auf 'Abschicken'.
          </span>
        </div>
        <input
          v-model="email"
          style="display: hidden"
          class="email"
          type="text"
          autocomplete="username"
          disabled="true"
        >
        <input v-model="email" class="email" type="text" autocomplete="email" disabled="true">
        <input v-model="password" class="password" type="password" autocomplete="new-password" placeholder="Neues Passwort">
        <input
          v-model="confirmPassword"
          style="margin-top: 50px;"
          class="password"
          type="password"
          autocomplete="new-password"
          placeholder="Neues Passwort bestätigen"
        >
        <button style="margin-top: 120px;" class="login-button hoverPointer" type="button" name="button" @click="changePassword">
          ABSCHICKEN
        </button>
      </div>
    </div>
    <div v-else class="wrapper">
      <h2 class="title">
        Post ist unterwegs 📫
      </h2>

      Wir haben Ihnen eine E-Mail zur Bestätigung der Passwortänderung zugeschickt.
      <br>Klicken Sie auf den Link in der E-Mail, um Ihr Passwort zu ändern.
      <br>
      <br>
      <br>
      <nuxt-link class="button error-button" to="/">
        ZURÜCK ZUR STARTSEITE
      </nuxt-link>
      </h2>
    </div>
  </div>
</template>

<script>
import notifications from '~/components/notifications'

export default {
  middleware: null,
  scrollToTop: true,
  layout: 'home',
  components: {
    loading: () => import('~/components/loading.vue')
  },
  notifications,
  data() {
    return {
      token: '',
      email: '',
      password: '',
      confirmPassword: '',
      loading: false
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.token) {
      this.token = this.$route.query.token
      this.email = this.$route.query.email
    }
  },
  methods: {
    async changePassword() {
      if (this.password !== this.confirmPassword) {
        return this.notMatching()
      }
      this.loading = true
      try {
        await this.$axios.post(process.env.baseUrl + 'auth/password-reset', {
          password: this.password,
          confirmPassword: this.confirmPassword,
          token: this.token
        })
        this.showSolved({
          message:
            'Passwort wurde erfolgreich geändert. Sie können sich nun wie gewohnt mit dem neuen Passwort einloggen.'
        })
        return $nuxt.$router.replace({ path: '/' })
      } catch (e) {
        this.loading = false
        this.loginError({ message: 'Fehler beim Verbindungsaufbau: ' + e.msg })
        console.log(e)
      }
    }
  }
}
</script>

<style lang="css" scoped>
.error-container {
  width: 100%;
  height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.title {
  font-size: 3em;
  letter-spacing: -0.04em;
}

.wrapper {
  text-align: center;
}

.info {
  font-weight: 300;
  color: #9aabb1;
  margin: 0;
  margin-bottom: 50px;
}

.error-button {
  margin-top: 50px;
  text-decoration: none;
  color: #111;
  font-size: 18px;
  padding: 10px;
  padding-left: 15px;
  padding-right: 15px;
  letter-spacing: 0.1em;
}

.box p {
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.23em;
  font-size: 29px;
  text-align: center;
  color: black;
  padding-top: 15px;
  padding-left: 5px;
  margin: 0px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.forgot-password-box {
  width: 350px;
  height: 400px;
}
.forgot-password-label {
  margin-top: 100px;
  padding-left: 35px;
  padding-right: 30px;
  font-family: Inter, Helvetica, Arial, sans-serif;
  font-weight: 300;
  font-size: 11px;
  color: #999999;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.email {
  position: absolute;
  top: 50%;
  margin-top: -48px;
  left: 50%;
  margin-left: -116.5px;
  width: 233px;
  height: 33px;
  border-style: solid;
  border-width: 1px;
  border-color: #cccccc;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.password {
  position: absolute;
  top: 50%;
  margin-top: 0px;
  width: 233px;
  height: 33px;
  left: 50%;
  margin-left: -116.5px;
  border-style: solid;
  border-width: 1px;
  border-color: #cccccc;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.login-button {
  position: absolute;
  top: 50%;
  margin-top: 88px;
  width: 233px;
  height: 40px;
  left: 50%;
  margin-left: -116.5px;
  border-style: solid;
  border-width: 1px;
  border-color: black;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.2em;
  font-size: 18px;
  color: black;
  border-radius: 0px !important;
}

.login-button:active {
  vertical-align: top;
  padding-top: 6px;
  background: rgba(0, 0, 0, 0.05);
}

.login-button:hover {
  background: rgba(0, 0, 0, 0.02);
}
</style>
