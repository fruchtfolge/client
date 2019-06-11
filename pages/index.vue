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
              <input id="postcode" v-model="postcode" class="address" placeholder="PLZ">
              <input
                id="address"
                v-model="address"
                list="suggestions"
                class="address"
                placeholder="Strasse u. Hausnr. (Betrieb)"
                @input="debouncedAutocomplete"
              >
              <autocomplete :suggestions="autocomplete" />
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
        <div id="landing" class="arrow-bottom" />
      </div>
      <div class="landing">
        <h1>
          FRUCHTFOLGE IST KEINE ACKERSCHLAGKARTEI
        </h1>
        <div class="copy">
          Die kostenlose "Fruchtfolge"-Anwendung der Universität Bonn unterstützt
          Sie dabei, den Gewinn Ihres Betriebes durch eine optimierte Anbauplanung
          zu maximieren.

          <br>
          <br>

          <!-- Sehen Sie sich das kurze Einführungsvideo an oder lesen Sie unterhalb
          des Videos weiter. -->

          <!-- <video class="video" :src="require('~/assets/img/test.mp4')" controls type="video/mp4" /> -->
          <img class="image" src="~assets/img/results.png" alt="Results">

          <div class="smallDisplay">
            <h2>Warum kann ich mich nicht anmelden?</h2>
            Die Fruchtfolge Anwendung ist für Tablets und Desktop Computer optimiert.
            Rufen Sie die Anwendung von einem Gerät mit einem größeren Bildschirm auf,
            um den vollen Umfang der Anwendung zu nutzen.
          </div>

          <h2>Was macht die "Fruchtfolge"-Anwendung?</h2>
          Die "Fruchtfolge"-Anwendung stellt einen Gewinnmaximierenden Anbauplan
          für Ihre Ackerflächen auf.<br><br>
          Dabei werden Nebenbedingungen wie maximal verfügbare Arbeitszeitstunden,
          Fruchtfolgeeffekte, Bodenqualitäten, Hof-Feld Entfernungen (und deren Auswirkungen
          auf Arbeitszeitbedarfe und Maschinenkosten) und die Greening-Richtlinie
          berücksichtigt.<br><br>
          Die empfohlene Anbaukultur kann für jeden Schlag ersetzt werden, die daraus
          resultierenden Konsequenzen (z.B. Verstoß gegen Greening-Auflagen,
          Überschreitung von maximalen Fruchtfolgenateilen, verringerter
          Gesamtdeckungsbeitrag etc.) werden Ihnen direkt mitgeteilt.<br><br>

          Es werden automatisch Standardwerte für Fruchtfolgeeffekte,
          Deckungsbeiträge und Zeitreihendaten aus diversen Datenbanken importiert,
          sodass Sie nicht alle Daten selber eingeben müssen. Wenn ihr Betrieb
          den Flächenantrag in Nordrhein-Westfalen stellt, können Sie des Weiteren
          bequem Ihre Schläge und Kulturen importieren.<br><br>
          Alle Daten für die Optimierung sind veränderbar und lassen sich
          and Ihre persönlichen Gegebenheiten anpassen.<br><br>
          Die Erstellung eines optimierten Anbauplans dauert in der Regel weniger als
          10-30 Minuten (je nach Betriebsbeschaffenheit).<br><br>

          <h2>Für wen ist die "Fruchtfolge"-Anwendung gedacht?</h2>
          Grundsätzlich ist die Anwendung für alle Entscheidungsträger, das heißt
          Landwirte/Landwirtinnen sowie deren Berater gedacht.<br>
          Die Anwendung ist gleichermaßen für konventionell als auch
          ökologisch/integriert wirtschaftende Betriebe geeignet.<br>
          Ein Datenimport aus Flächenatragsdaten ist
          derzeit lediglich für das Land Nordrhein-Westfalen verfügbar.

          <h2>Wie gut ist der erstellte Anbauplan?</h2>
          Die Qualität der Optimierung steht und fällt mit der Qualität der
          von Ihnen eingegeben Daten. Da für die Anbaukulturen Standardwerte für
          Preise, Erträge, Kosten, Fruchtfolgeeffekte uvm. aus diversen
          Datenbanken importiert werden, können diese teilweise stark von den
          tatsächlich auf Ihrem Betrieb auftretenden Daten abweichen. Eine Anpassung
          Ihrerseits ist daher unabdingbar.<br><br>
          Allgemein ist die "Fruchtfolge"-Anwendung als praktische Planungshilfe
          gedacht. Die sorgfältige Überprüfung und gegebenenfalls Anpassung des
          Anbauplans vor der tatsächlichen Umsetzung ist jedoch zwingend erforderlich.

          <h2>Ist die Anwendung wirklich kostenlos?</h2>
          Ja. Die "Fruchtfolge"-Anwendung ist ein sogenanntes Open-Source Projekt,
          dass von der Universität Bonn verwaltet und bereitgestellt wird. Open-Source
          Projekte können kostenlos verwendet werden. Im gegenzug besteht jedoch
          dafür kein Anspruch auf Unterstützung im Umgang mit der Anwendung.<br>
          Ein weiterer Vorteil ist, dass interessierte Entwickler bei der
          Gestaltung der Anwendung teilhaben, mögliche Fehler
          beseitigen oder neue Funktionen hinzufügen. <br>
          Bekannte Beispiele für Open-Source Projekte sind beispielsweise der
          beliebte Internet-Browser Mozilla Firefox oder der vorinstallierte
          Taschenrechner auf Microsoft Windows Computern.

          <h2>Warum muss ich meine Adresse bei der Registrierung angeben?</h2>
          Die Adresse Ihrer Hofstelle wird benötigt, um die Hof-Feld Entfernungen
          der von Ihnen bewirtschafteten Flächen zu errechnen. Mit dieser Information
          werden Schlagspezifische Transportkosten und Arbeitszeitbedarfe für
          Sie errechnet.

          <h2>Sind meine Daten sicher?</h2>
          Ihre Daten werden nur lokal auf Ihrem Rechner, sowie auf einem gesicherten
          Server der Universität in Bonn gespeichert und unterliegen somit den Datenschutzauflagen
          des Landes NRW.

          <h2>Wie stabil ist die Anwendung?</h2>
          Die "Fruchtfolge"-Anwendung befindet sich derzeit noch im sogenannten
          Beta stadium. Wenn bei der Nutzung der Anwendung Fehler auftreten,
          würden wir uns über eine <nuxt-link to="/kontakt">
            kurze Mitteilung
          </nuxt-link> freuen.

          <h2>Ich würde gerne bei der Entwicklung mithelfen. Was kann ich tun?</h2>
          Die Entwicklung der Anwendung findet auf der Entwicklerplattform Github
          unter der Adresse
          <a href="https://github.com/fruchtfolge/client">https://github.com/fruchtfolge/client</a>
          statt. Auf der Seite finden Sie weitere Hinweise zur Kollaboration sowie
          aktuell anstehende Aufgaben.

          <h2>Ich habe Fragen/Anregungen bezüglich der Anwendung.</h2>
          Sie können uns gerne über die auf der <nuxt-link to="/kontakt">
            Kontakt-Seite
          </nuxt-link>
          angegebenen Kontaktmöglichkeiten erreichen.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Setting from '~/constructors/Settings'
import geo from '~/assets/js/geo'

export default {
  components: {
    loading: () => import('~/components/loading.vue'),
    autocomplete: () => import('~/components/autocomplete.vue')
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
      autocomplete: [],
      dsgvoAccepted: false,
      cookiesAccepted: false,
      clicked: false,
      loading: false
    }
  },
  created() {
    console.log(
      'Moin! Interssiert an der Entwicklung? Vorbeischauen bei Github lohnt sich :)'
    )
    this.debouncedAutocomplete = _.debounce(async () => {
      try {
        this.autocomplete = await geo.autocomplete(this.address, this.postcode)
      } catch (e) {
        this.incomplete({ title: 'ADRESSE', message: e.message })
      }
    }, 350)
    this.$bus.$on('flip', this.flip)
  },
  destroyed() {
    this.$bus.$off('flip')
  },
  notifications: {
    incomplete: {
      title: 'UNVOLLSTÄNDIG',
      message: 'Bitte füllen Sie zur Anmeldung alle Felder aus.',
      type: 'warn'
    },
    noDSGVO: {
      title: 'NUTZUNGSBEDINGUNG',
      message:
        'Für die Nutzung der Anwendung müssen Sie den Nutzungsbedingungen und der Cookies-Richtlinie zustimmen.',
      type: 'warn'
    },
    notMatching: {
      title: 'PASSWORT ÜBEREINSTIMMUNG',
      message: 'Die Passwörter stimmen nicht überein.',
      type: 'warn'
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
      const el = document.getElementById('background')
      el.scrollIntoView({ behavior: 'smooth' })
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
        // store auth user
        localStorage.setItem('lastUser', auth.user_id)
        // initiate database
        this.$initalizeDB(auth.user_id)

        // do a one way replication
        this.$db.replicate
          .from(auth.userDBs.userdb)
          .on('change', info => {
            this.progress =
              _.round(this.getProgress(info.pending) * 100, 0) + '%'
          })
          .on('complete', async info => {
            // console.log(info, auth.userDBs.userdb)
            const settings = await this.getSettings(date)
            const { data } = await this.$axios.post(
              process.env.baseUrl + 'auth/userDoc',
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
          .on('error', error => {
            console.log(error)
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

        const address = await geo.forward(this.address, this.postcode)

        const { data } = await this.$axios.post(
          process.env.baseUrl + 'auth/register',
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
        } else if (e.message) {
          this.loginError({ message: e.message })
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
          process.env.baseUrl + 'auth/login',
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
  middleware: 'auth',
  layout: 'home'
}
</script>

<style>
.image {
  width: 100%;
  border: none;
  padding: 0px;
}
.container {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.background {
  margin-top: -60px;
  border: 0px;
  padding: 0px;
  top: 0;
  left: 0;
  /* Preserve aspet ratio */
  min-width: 100%;
  height: 100vh;
  min-height: 700px;
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
  margin-bottom: 40px;
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

.arrow-bottom {
  position: absolute;
  left: 50%;
  margin-left: -20px;
  margin-top: -15px;
  width: 40px;
  height: 40px;
  background: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27white%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-size: cover;
}

.smallDisplay {
  display: none;
}

.copy {
  margin: auto;
  font-family: 'Open Sans';
  font-weight: 300;
  width: 50%;
  min-width: 580px;
  max-width: 800px;
  padding-bottom: 50px;
  padding-left: 5px;
  padding-right: 5px;
}

.copy h2 {
  margin-top: 60px;
}
.video {
  width: 100%;
  margin-bottom: 40px;
  margin-top: 40px;
  object-fit: cover;
}

/* Hide most elements when display size is too small */
@media (max-width: 700px) {
  .register {
    display: none;
  }

  #login {
    display: none;
  }

  .background {
    display: none;
  }

  .copy {
    margin: auto;
    font-family: 'Open Sans';
    font-weight: 300;
    font-size: 14px;
    width: initial;
    min-width: initial;
    max-width: initial;
    padding-bottom: 50px;
    padding-left: 5px;
    padding-right: 5px;
  }

  .smallDisplay {
    display: initial;
  }

  .logo {
    font-size: 20px;
  }

  h1 {
    font-size: 20px;
  }

  h2 {
    font-size: 18px;
  }

  .landing h1 {
    margin-bottom: 15px;
    margin-top: -30px;
  }
}
</style>
