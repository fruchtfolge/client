<template>
<div class="main">
  <div v-if="loading" class="blur loading">
    <div class="spinner-container">
      <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      <h2 style="text-align: center;">Daten werden geladen ... <br> Der Vorgang kann einige Minuten in Anspruch nehmen</h2>      
    </div>
  </div>
  <div v-else>
    <img id="background" class="background" src="~assets/img/background.jpeg" alt="background" />
    <div class="flip-container" id="login" v-bind:class="{ flip: showRegister }">
      <div class="flipper">
        <div class="login">
          <p>ANBAUPLANUNG OPTIMIEREN</p>
          <input v-model="email" id="email" class="email" placeholder="E-Mail" name="email" autofocus="autofocus" />
          <input v-model="password" class="password" @keyup.enter="login" placeholder="Passwort" type="password" name="password" id="password" />
          <button type="button" class="login-button" @click="login" id="login-button">ANMELDEN</button>
          <a class="forgot" href="index.html">Passwort vergessen?</a>
        </div>
        <div class="registrierung">
          <p>JETZT KOSTENLOS ANMELDEN</p>
          <input v-model="address" id="address" class="address" placeholder="Strasse u. Hausnr. (Betrieb)" />
          <input v-model="postcode" id="postcode" class="postcode" placeholder="PLZ" />
          <input v-model="email" id="email2" class="email2" placeholder="E-Mail Adresse" />
          <input v-model="password" id='password2' class="password2" placeholder="Passwort" type="password" />
          <input v-model="confirmPassword" id="confirmPassword" class="repeat-password" @keyup.enter="signup" placeholder="Passwort wiederholen" type="password" />
          <input class="checkbox" type="checkbox" />
          <input v-model="dsgvoAccepted" type="checkbox" id="c2" name="cc" />
          <label for="c2" class="label-login" style="margin-top: 100px;"><span></span>Ich akzeptiere die Nutzungsbedingungen der Universität Bonn.</label>
          <button type="button" class="register-button" id="signup" @click="signup">REGISTRIEREN</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Setting from '~/constructors/settings'

export default {
  data() {
    return {
      showRegister: false,
      email: '',
      password: '',
      address: '',
      postcode: '',
      confirmPassword: '',
      dsgvoAccepted: false,
      clicked: false,
      loading: false
    }
  },
  created() {
    this.$bus.$on('flip', this.flip)
  },
  destroyed() {
    this.$bus.$off('flip')
  },
  notifications: {
    incomplete: {
      title: 'UNVOLLSTÄNDIG',
      message: 'Bitte füllen Sie zur Anmeldung alle Felder aus.',
      type: 'error'
    },
    noDSGVO: {
      title: 'NUTZUNGSBEDINGUNG',
      message: 'Für die Nutzung der Anwendung müssen Sie den Nutzungsbedingungen zustimmen.',
      type: 'error'
    },
    notMatching: {
      title: 'PASSWORT ÜBEREINSTIMMUNG',
      message: 'Die Passwörter stimmen nicht überein.',
      type: 'error'
    },
    loginError: {
      title: 'FEHLER',
      message: 'Beim Login ist ein Fehler aufgetreten.',
      type: 'error'
    },
    success: {
      title: 'WILLKOMMEN',
      message: 'Schön, dass Sie wieder da sind! Bitte haben Sie einen Augeblick geduld, während Ihre Daten synchronisiert werden.',
      type: 'success'
    }
  },
  methods: {
    flip() {
      return this.showRegister ? this.showRegister = false : this.showRegister = true
    },
    checkSignup() {
      if (!this.address || !this.email || !this.postcode || !this.password || !this.confirmPassword) {
        this.incomplete()
        return false
      } else if (!this.dsgvoAccepted) {
        this.noDSGVO()
        return false
      } else if (this.password !== this.confirmPassword) {
        return this.notMatching()
        return false
      } else {
        return true
      }
    },
    checkLogin() {
      if (!this.email || !this.password) {
        this.incomplete()
        return false
      } else {
        return true
      }
    },
    async getSettings(date) {
      let settings
      try {
        settings = await this.$db.get('settings')
      } catch (e) {
        if (e.status === 404) {
          settings = new Setting({
            curYear: date.getFullYear(),
            curScenario: 'Standard'
          })
        } else {
          return console.error(e)
        }
      }
      return settings
    },
    async handleSuccess(auth,signup) {
      let settings
      let data
      const date = new Date()
      try {
        this.$axios.setHeader('Authorization','Bearer ' + auth.token + ':' + auth.password)
        this.loading = true
        // remove passwords after signup
        this.password = ''
        this.confirmPassword = ''
        // show succes banner
        this.success()
        // get settings object and store auth

        // do a one way replication
        this.$db.replicate.from(auth.userDBs.userdb).on('complete', async (info) => {
          console.log(info);
          const settings = await this.getSettings(date)
          const { data } = await this.$axios.post('http://localhost:3001/auth/userDoc', {
            username: auth.user_id
          })
          settings.street = data.address
          settings.postcode = data.postcode
          settings.city = data.city
          settings.home = data.home
          settings.timestamp = date.toISOString()
          settings.state_district = data.state_district
          settings.auth = auth

          await this.$db.put(settings)
          // start syncing
          this.$store.sync = this.$db.sync(settings.auth.userDBs.userdb, {
            live: true,
            retry: true
          })
          // this.loading = false
          // this.clicked = false
          if (signup) {
            return $nuxt.$router.replace({path: '/settings'})
          }
          return $nuxt.$router.replace({path: '/maps'})
        })
      } catch(e) {
        this.loading = false
        this.clicked = false
        this.loginError({message: "Fehler beim Verbindungsaufbau."})
        console.error(e)
      }
    },
    async signup() {
      if (this.clicked) return
      this.clicked = true
      
      try {
        if (!this.checkSignup()) return

        const { data } = await this.$axios.post('http://localhost:3001/auth/register', {
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword,
          address: this.address,
          postcode: this.postcode
        })
        await this.handleSuccess(data,true)
      } catch (e) {
        this.clicked = false
        if (e.response && e.response.status === 401) {
          this.loginError({message: e.response.data.message})
        } else {
          this.loginError({message: "Fehler beim Verbindungsaufbau."})
          console.error(e)
        }
      }
    },
    async login() {
      if (this.clicked) return
      this.clicked = true
      
      try {
        if (!this.checkLogin()) return
        const { data } = await this.$axios.post('http://localhost:3001/auth/login', {
          username: this.email,
          password: this.password
        })
        this.handleSuccess(data)
      } catch (e) {
        this.clicked = false
        if (e.response && e.response.status === 401) {
          this.loginError({message: e.response.data.message})
        } else {
          this.loginError({message: "Fehler beim Verbindungsaufbau."})
          console.error(e)
        }
      }
    }
  },
  middleware: null,
  layout: 'home'
}
</script>

<style>
.container {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.background {
  position: fixed;
  border: 0px;
  padding: 0px;
  top: 0;
  left: 0;
  /* Preserve aspet ratio */
  min-width: 100%;
  min-height: 100%;
}

.registrieren-oben {
  display: block;
  position: fixed;
  top: 12px;
  right: 35px;
  width: 110px;
  height: 35px;
  z-index: 99;
  border-style: solid;
  border-width: 2px;
  border-color: black;
  background: white;
  font-family: 'Open Sans Condensed', sans-serif;
  letter-spacing: 0.1em;
  font-size: 15px;
  color: black;
  padding: 5px;
  border-radius: 0 !important;
}

.registrieren-oben:active {
  vertical-align: top;
  padding-top: 6px;
  background: rgba(0, 0, 0, 0.02);
}

.registrieren-oben:hover {
  background-color: rgba(0, 0, 0, 0.05)
}

div.flip-container {
  position: fixed;
  cursor: default;
  left: 50%;
  margin-left: -150px;
  top: 50%;
  margin-top: -185px;
}

/* entire container, keeps perspective */
.flip-container {
  perspective: 1000px;
}

/* flip the pane when hovered */
.flip-container.flip .flipper {
  transform: rotateY(-180deg);
}

.flip-container,
.login {
  width: 300px;
  height: 370px;
}

/* flip speed goes here */
.flipper {
  transition: 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

/* hide back of pane during swap */
.login,
.registrierung {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
}

/* front pane, placed above back */
.login {
  z-index: 2;
  /* for firefox 31 */
  transform: rotateY(0deg);
}

/* back, initially hidden pane */
.registrierung {
  height: 500px;
  transform: rotateY(180deg);
}

.login {
  background: white;
  border-radius: 0 !important;
}

.login p {
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

.registrierung p {
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.23em;
  font-size: 26px;
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

.name {
  position: absolute;
  top: 50%;
  margin-top: -134px;
  left: 50%;
  margin-left: -116.5px;
  width: 233px;
  height: 33px;
  border-style: solid;
  border-width: 1px;
  border-color: #CCCCCC;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.address {
  position: absolute;
  top: 50%;
  margin-top: -134px;
  left: 50%;
  margin-left: -116.5px;
  width: 233px;
  height: 33px;
  border-style: solid;
  border-width: 1px;
  border-color: #CCCCCC;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.postcode {
  position: absolute;
  top: 50%;
  margin-top: -89px;
  left: 50%;
  margin-left: -116.5px;
  width: 233px;
  height: 33px;
  border-style: solid;
  border-width: 1px;
  border-color: #CCCCCC;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
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
  border-color: #CCCCCC;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.emailFalsch {
  position: absolute;
  top: 38%;
  margin-top: -48px;
  left: 50%;
  margin-left: -120px;
  width: 240px;
  height: 33px;
  border-style: dashed;
  border-width: 1px;
  border-color: #CCCCCC;
  background-color: #f5f5f5;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  text-align: center;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: grey;
  padding-left: 0px;
  border-radius: 0 !important;
}

.email2 {
  position: absolute;
  top: 50%;
  margin-top: -44px;
  left: 50%;
  margin-left: -116.5px;
  width: 233px;
  height: 33px;
  border-style: solid;
  border-width: 1px;
  border-color: #CCCCCC;
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
  border-color: #CCCCCC;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.password2 {
  position: absolute;
  top: 50%;
  margin-top: 0px;
  width: 233px;
  height: 33px;
  left: 50%;
  margin-left: -116.5px;
  border-style: solid;
  border-width: 1px;
  border-color: #CCCCCC;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.repeat-password {
  position: absolute;
  top: 50%;
  margin-top: 48px;
  width: 233px;
  height: 33px;
  left: 50%;
  margin-left: -116.5px;
  border-style: solid;
  border-width: 1px;
  border-color: #CCCCCC;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"]+label span {
  background: white;
  border: 1px solid #CCCCCC;
  margin: -1px 12px 0 0;
  border-radius: 0 !important;
  display: inline-block;
  width: 15px;
  height: 15px;
  vertical-align: middle;
  cursor: pointer;
}

input[type="checkbox"]:checked+label span {
  background: grey;
  outline: 2px solid white;
  outline-offset: -3px;
}

.label-login {
  position: absolute;
  top: 50%;
  margin-top: 48px;
  left: 33.5px;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 14px;
  color: #999999;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
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

.register-button {
  position: absolute;
  top: 50%;
  margin-top: 162px;
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

.register-button:active {
  vertical-align: top;
  padding-top: 6px;
  background: rgba(0, 0, 0, 0.05);
}

.register-button:hover {
  background: rgba(0, 0, 0, 0.02);
}

.forgot {
  position: absolute;
  top: 50%;
  margin-top: 138px;
  right: 33.5px;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 14px;
  color: #999999;
  text-decoration: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.forgot:active {
  color: black;
}

.registrierung {
  background: white;
}
</style>
