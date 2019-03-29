<template>
  <div class="main">
    <loading v-if="loading" :main="progress" />
    <div v-else>
      <img id="background" class="background" src="~assets/img/background.jpeg" alt="background">
      <div id="login" class="flip-container" :class="{ flip: showRegister }">
        <div class="flipper">
          <div class="login">
            <p>ANBAUPLANUNG OPTIMIEREN</p>
            <input
              id="email"
              v-model="email"
              class="email"
              placeholder="E-Mail"
              name="email"
              autofocus="autofocus"
            >
            <input
              id="password"
              v-model="password"
              class="password"
              placeholder="Passwort"
              type="password"
              name="password"
              @keyup.enter="login"
            >
            <button id="login-button" type="button" class="login-button" @click="login">
              ANMELDEN
            </button>
            <a class="forgot" href="index.html">Passwort vergessen?</a>
          </div>
          <div class="registrierung">
            <p>JETZT KOSTENLOS ANMELDEN</p>
            <div class="register-container">
              <input id="address" v-model="address" class="address" placeholder="Strasse u. Hausnr. (Betrieb)">
              <input id="postcode" v-model="postcode" class="address" placeholder="PLZ">
              <input id="email2" v-model="email" class="address" placeholder="E-Mail Adresse">
              <input id="password2" v-model="password" class="address" placeholder="Passwort" type="password">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                class="address"
                placeholder="Passwort wiederholen"
                type="password"
                @keyup.enter="signup"
              >
              <input id="c2" v-model="dsgvoAccepted" type="checkbox" name="cc" class="">
              <label for="c2" class="label-login" style="margin-top: 100px;">
                <span />Ich habe die <nuxt-link to="/nutzungsbedingungen">Nutzungsbedingungen</nuxt-link> gelesen und bin mit ihnen
                einverstanden. Die <nuxt-link to="/datenschutz">Datenschutzerklärung</nuxt-link> habe ich ebenfalls zur Kenntnis genommen und akzeptiert.
              </label>
              <br>
              <input id="c3" v-model="cookiesAccepted" type="checkbox" name="cookies" class="">
              <label for="c3" class="label-login" style="margin-top: 100px;">
                <span />Ich stimme der Verwendung von Cookies auf der Webseite zu.
              </label>
            </div>
            <button id="signup" type="button" class="register-button" @click="signup">
              REGISTRIEREN
            </button>
          </div>
        </div>
      </div>
      <div class="expand" @click="jump('landing')">
        <h2>WEITERE INFOS</h2>
        <div id="landing" class="arrow" />
      </div>
      <div class="landing">
        <h1>
          ANBAUPLANUNG
        </h1>
      </div>
    </div>
  </div>
</template>

<script>
import Setting from '~/constructors/Settings'
import mapquest from '~/assets/js/mapquest'

export default {
  components: {
    loading: () => import('~/components/loading.vue')
  },
  data() {
    return {
      showRegister: false,
      pendingMax: 0,
      progress: '0%',
      email: '',
      password: '',
      address: '',
      postcode: '',
      confirmPassword: '',
      dsgvoAccepted: false,
      cookiesAccepted: false,
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
      message:
        'Für die Nutzung der Anwendung müssen Sie den Nutzungsbedingungen und der Cookies-Richtlinie zustimmen.',
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
      message:
        'Schön, dass Sie wieder da sind! Bitte haben Sie einen Augeblick geduld, während Ihre Daten synchronisiert werden.',
      type: 'success'
    }
  },
  methods: {
    flip() {
      // scroll to top of page after clicking
      window.scrollTo(0, 0)
      return this.showRegister
        ? (this.showRegister = false)
        : (this.showRegister = true)
    },
    checkSignup() {
      if (
        !this.address ||
        !this.email ||
        !this.postcode ||
        !this.password ||
        !this.confirmPassword
      ) {
        this.incomplete()
        return false
      } else if (!this.dsgvoAccepted || !this.cookiesAccepted) {
        this.noDSGVO()
        return false
      } else if (this.password !== this.confirmPassword) {
        this.notMatching()
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
    getProgress(pending) {
      let progress
      this.pendingMax = this.pendingMax < pending ? pending : this.pendingMax // first time capture
      if (this.pendingMax > 0) {
        progress = 1 - pending / this.pendingMax
        if (pending === 0) {
          this.pendingMax = 0 // reset for live/next replication
        }
      } else {
        progress = 1 // 100%
      }
      return progress
    },
    handleSuccess(auth, signup) {
      const date = new Date()
      try {
        this.$axios.setHeader(
          'Authorization',
          'Bearer ' + auth.token + ':' + auth.password
        )
        this.loading = true
        // remove passwords after signup
        this.password = ''
        this.confirmPassword = ''
        // show succes banner
        this.success()
        // get settings object and store auth

        // do a one way replication
        this.$db.replicate
          .from(auth.userDBs.userdb)
          .on('change', info => {
            this.progress =
              _.round(this.getProgress(info.pending) * 100, 0) + '%'
          })
          .on('complete', async info => {
            console.log(info)
            const settings = await this.getSettings(date)
            const { data } = await this.$axios.post(
              'http://fruchtfolge.agp.uni-bonn.de/api/auth/userDoc',
              {
                username: auth.user_id
              }
            )
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
              return $nuxt.$router.replace({ path: '/settings' })
            }
            return $nuxt.$router.replace({ path: '/maps' })
          })
      } catch (e) {
        this.loading = false
        this.clicked = false
        this.loginError({ message: 'Fehler beim Verbindungsaufbau.' })
        console.error(e)
      }
    },
    async signup() {
      if (this.clicked) return
      this.clicked = true

      try {
        if (!this.checkSignup()) {
          this.clicked = false
          return
        }

        const address = await mapquest.forward(this.address, this.postcode)
        if (address.error) {
          this.loginError({ message: address.error })
          this.clicked = false
          return
        }

        const { data } = await this.$axios.post(
          'http://fruchtfolge.agp.uni-bonn.de/api/auth/register',
          {
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword,
            address: this.address,
            postcode: this.postcode,
            home: address.home,
            state_district: address.stateDistrict,
            city: address.city
          }
        )
        await this.handleSuccess(data, true)
      } catch (e) {
        this.clicked = false
        if (e.response && e.response.status === 401) {
          this.loginError({ message: e.response.data.message })
        } else if (e.response && e.response.status === 400) {
          this.loginError({
            message: 'E-Mail bereits benutzt.'
          })
        } else {
          this.loginError({ message: 'Fehler beim Verbindungsaufbau.' })
          console.error(e)
        }
      }
    },
    jump(id) {
      const el = document.getElementById(id)
      el.scrollIntoView({ behavior: 'smooth' })
      el.scrollTop += 10
    },
    async login() {
      if (this.clicked) return
      this.clicked = true

      try {
        if (!this.checkLogin()) {
          this.clicked = false
          return
        }
        const { data } = await this.$axios.post(
          'http://fruchtfolge.agp.uni-bonn.de/api/auth/login',
          {
            username: this.email,
            password: this.password
          }
        )
        this.handleSuccess(data)
      } catch (e) {
        this.clicked = false
        if (e.response && e.response.status === 401) {
          this.loginError({ message: 'E-Mail oder Passwort ungültig.' })
        } else {
          this.loginError({ message: 'Fehler beim Verbindungsaufbau.' })
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
  border: 0px;
  padding: 0px;
  top: 0;
  left: 0;
  /* Preserve aspet ratio */
  min-width: 100%;
  min-height: calc(100vh - 60px);
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
  background-color: rgba(0, 0, 0, 0.05);
}

div.flip-container {
  position: absolute;
  cursor: default;
  left: 50%;
  margin-left: -150px;
  margin-top: calc(-50vh - 290px);
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
  height: 580px;
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
  border-color: #cccccc;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.register-container {
  margin-top: 20px;
  margin-left: 30px;
  margin-right: 30px;
}

.address {
  width: 233px;
  height: 33px;
  margin-bottom: 10px;
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
  border-color: #cccccc;
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
  border-color: #cccccc;
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
  border-color: #cccccc;
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
  border-color: #cccccc;
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
  border-color: #cccccc;
  background-color: transparent;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  color: grey;
  padding-left: 5px;
  border-radius: 0 !important;
}

.label-login {
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  padding-left: 5px;
  letter-spacing: 0.05em;
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
  bottom: 30px;
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

.landing {
  height: 100vh;
  margin-top: 120px;
}

.landing h1 {
  font-weight: normal;
  text-align: center;
  letter-spacing: 0.15em;
}

.expand {
  text-align: center;
  margin-top: -90px;
}

.expand h2 {
  color: white;
  font-size: 18px;
  letter-spacing: 0.15em;
}

.arrow {
  position: absolute;
  left: 50%;
  margin-left: -20px;
  margin-top: -15px;
  width: 40px;
  height: 40px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='white' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
