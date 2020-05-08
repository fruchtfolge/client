<template>
  <div class="main">
    <loading v-if="loading" :main="progress" />
    <div v-else>
      <img id="background" class="background" src="~assets/img/background.jpeg" alt="background">
      <div id="login" />
      <div id="login" class="flip-container" :class="{ flip: showRegister, 'margin-front': !showRegister, 'margin-back': showRegister }">
        <div class="flipper" :class="{ 'width-back': showRegister }">
          <form class="login">
            <p v-if="forgotPassword" style="width: 100%">
              PASSWORT ZURÜCKSETZEN
            </p>
            <div v-if="forgotPassword" class="teaser">
              <span style="line-height: 1.4em;">
                <br>
                <br>
                Geben Sie Ihre E-Mail Adresse in das Eingabefeld auf der rechten Seiten ein.
                <br>
                <br>
                Klicken Sie anschließend auf 'Weiter' um Ihr Passwort zurückzusetzen.
                <br>
                <br>
                Sie erhalten Anschließend eine E-Mail mit weiteren Anweisungen zum Zurücksetzen Ihres Passworts.
              </span>
            </div>
            <div v-else class="teaser">
              <p>
                ANBAUPLANUNG OPTIMIEREN
              </p>
              <span style="line-height: 1.4em;">
                Die Düngeverordnung 2020 bringt viele Änderungen mit sich. Zusätzlich zu neuen Maßnahmen in den roten Gebieten wurden unter anderem auch die Auflagen für die Herbstdüngung verschärft.
                <br>
                Die Fruchtfolge Anwendung der Uni Bonn unterstützt Sie dabei, in nur wenigen Minuten die kostengünstigste Anpassungstrategie an die neue Düngeverordnung für Ihren Betrieb zu finden.
                <br>
                Die Düngebedarfsermittlung wird dabei automatisch erstellt.
                <br>
                <!--
                <br>
                <br>
                Sie wollen direkt loslegen? Klicken Sie auf den 'Registrieren'-Button in der oberen rechten Ecke.
              -->
              </span>
              <div style="margin-top: 10px;">
                <a class="link" style="margin-top: 10px;" @click="jump('landing')">Mehr erfahren</a>
              </div>
            </div>
            <div class="login-container">
              <p v-if="!forgotPassword">
                WILLKOMMEN ZURÜCK
              </p>
              <p v-else>
                <br>
                <br>
              </p>
              <label class="label" for="email">E-Mail</label>
              <input
                id="email"
                v-model="email"
                class="email"
                placeholder="E-Mail"
                autocomplete="email"
                name="email"
                autofocus="autofocus"
                @keyup.enter="login"
              >
              <label v-if="!forgotPassword" class="label" for="password">Passwort</label>
              <input
                v-if="!forgotPassword"
                id="password"
                v-model="password"
                class="password"
                placeholder="Passwort"
                type="password"
                name="password"
                autocomplete="current-password"
                @keyup.enter="login"
              >
              <button v-if="forgotPassword" id="forgot-password-button" type="button" class="login-button hoverPointer" @click="postForgotPassword">
                WEITER
              </button>
              <button v-else id="login-button" type="button" class="login-button hoverPointer" @click="login">
                ANMELDEN
              </button>
              <a class="forgot" @click="forgotPassword = !forgotPassword">{{ forgotPassword ? "Zurück zur Anmeldung" : "Passwort vergessen?" }}</a>
            </div>
          </form>
          <form class="registrierung">
            <p>JETZT KOSTENLOS REGISTRIEREN</p>
            <div class="register-container">
              <addressMap :suggestions="autocomplete" :address="address" :coordsForward="coordsForward" @updateCoords="updateCoords" />
              <div class="register-input-container">
                <label for="address" class="label">Adresse</label>
                <input
                  id="address"
                  v-model="address"
                  list="suggestions"
                  class="address"
                  placeholder="Strasse u. Hausnr. (Betrieb)"
                  autocomplete="street-address"
                  @input="debouncedAutocomplete"
                  @blur="forwardGeocode"
                  @keypup.enter="forwardGeocode"
                >
                <autocomplete :suggestions="autocomplete" />
                <label for="email2" class="label">E-Mail</label>
                <input
                  id="email2"
                  v-model="email"
                  class="address"
                  autocomplete="email"
                  placeholder="E-Mail Adresse"
                >
                <label for="password2" class="label">Passwort</label>
                <input
                  id="password2"
                  v-model="password"
                  class="address"
                  placeholder="Passwort"
                  autocomplete="new-password"
                  type="password"
                >
                <label for="password2" class="label">Passwort wiederholen</label>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  class="address"
                  placeholder="Passwort wiederholen"
                  autocomplete="new-password"
                  type="password"
                  @keyup.enter="signup"
                >
                <input id="c2" v-model="dsgvoAccepted" type="checkbox" name="cc" class="">
                <label for="c2" class="label-login" style="margin-top: 100px;">
                  <span />Ich habe die <nuxt-link class="link" to="/nutzungsbedingungen">Nutzungsbedingungen</nuxt-link> gelesen und bin mit ihnen
                  einverstanden. Die <nuxt-link class="link" to="/datenschutz">Datenschutzerklärung</nuxt-link> habe ich ebenfalls zur Kenntnis genommen und akzeptiert.
                </label>
                <br>
                <input id="c3" v-model="cookiesAccepted" type="checkbox" name="cookies" class="">
                <label for="c3" class="label-login" style="margin-top: 100px;">
                  <span />Ich stimme der Verwendung von Cookies auf der Webseite zu.
                </label>
                <button id="signup" type="button" class="register-button hoverPointer" @click="signup">
                  REGISTRIEREN
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div id="landing" class="landing copy">
        <div style="width: 100%; max-width: 888px; flex: 1 0 100%;">
          <h2 style="margin-bottom: 45px;">
            <a href="#landing">Fruchtfolge ist keine Ackerschlagkartei</a>
          </h2>
          <div flow-cols="2" flow-cols-s="1">
            <p>
              Die kostenlose "Fruchtfolge"-Anwendung der Universität Bonn unterstützt
              Sie dabei, den Gewinn Ihres Betriebes durch eine optimierte Anbauplanung
              zu maximieren.
              <br>
              Alles was Sie dafür brauchen, sind Ihre InVeKos Betriebsnummer,
              und zwischen 5 und 30 Minuten Zeit.
              <br>
              <br>
              Ausführliche Informationen zur Benutzung gibt es auf
              <a class="link" href="https://fruchtfolge.agp.uni-bonn.de/documentation/#schon-dass-sie-hier-sind" target="_blank">offiziellen Supportseite</a>.
            </p>
            <a href="https://fruchtfolge.agp.uni-bonn.de/documentation/#schon-dass-sie-hier-sind" target="_blank">
              <img class="image" src="https://chrispahm.github.io/assets/fruchtfolge.gif" alt="Fruchtfolge übersicht">
            </a>
          </div>
          <h2 id="faq">
            <a href="#faq">FAQ</a>
          </h2>
          <div class="grid" columns="2" columns-s="1" style="grid-row-gap: 33.75px;">
            <div class="smallDisplay">
              <h4 id="warum-kann-ich-mich-nicht-anmelden">
                <a href="#warum-kann-ich-mich-nicht-anmelden">
                  Warum kann ich mich nicht anmelden?
                </a>
              </h4>
              Die Fruchtfolge Anwendung ist für Tablets und Desktop Computer optimiert.
              Rufen Sie die Anwendung von einem Gerät mit einem größeren Bildschirm auf,
              um den vollen Umfang der Anwendung zu nutzen.
            </div>
            <div class="c">
              <h4 id="was-macht-die-fruchtfolge-anwendung">
                <a href="#was-macht-die-fruchtfolge-anwendung">
                  Was macht die "Fruchtfolge"-Anwendung?
                </a>
              </h4>
              Die "Fruchtfolge"-Anwendung stellt einen Gewinnmaximierenden Anbauplan
              für Ihre Ackerflächen auf.<br><br>
              Dabei werden Nebenbedingungen wie maximal verfügbare Arbeitszeitstunden,
              Fruchtfolgeeffekte, Bodenqualitäten, Hof-Feld Entfernungen (und deren Auswirkungen
              auf Arbeitszeitbedarfe und Maschinenkosten) und die Greening-Richtlinie
              berücksichtigt.<br><br>
              Die empfohlene Anbaukultur kann für jeden Schlag ersetzt werden, die daraus
              resultierenden Konsequenzen (z.B. Verstoß gegen Greening-Auflagen,
              Überschreitung von maximalen Fruchtfolgenateilen, verringerter
              Gesamtdeckungsbeitrag etc.) werden Ihnen direkt mitgeteilt.
            </div>
            <div class="c">
              <h4 id="wie-viel-zeit-beansprucht-die-benutzung-des-programms">
                <a href="#wie-viel-zeit-beansprucht-die-benutzung-des-programms">Wie viel Zeit beansprucht die Benutzung des Programms?
                </a>
              </h4>
              Es werden automatisch Standardwerte für Fruchtfolgeeffekte,
              Deckungsbeiträge und Zeitreihendaten aus diversen Datenbanken importiert,
              sodass Sie nicht alle Daten selber eingeben müssen. Wenn ihr Betrieb
              den Flächenantrag in Nordrhein-Westfalen stellt, können Sie des Weiteren
              bequem Ihre Schläge und Kulturen importieren.<br><br>
              Alle Daten für die Optimierung sind veränderbar und lassen sich
              and Ihre persönlichen Gegebenheiten anpassen.<br><br>
              Die Erstellung eines optimierten Anbauplans dauert in der Regel weniger als
              10-30 Minuten (je nach Betriebsbeschaffenheit).<br><br>
            </div>
            <div class="c">
              <h4 id="fuer-wen-ist-die-fruchtfolge-anwendung-gedacht">
                <a href="#fuer-wen-ist-die-fruchtfolge-anwendung-gedacht">Für wen ist die "Fruchtfolge"-Anwendung gedacht?
                </a>
              </h4>
              Grundsätzlich ist die Anwendung für alle Entscheidungsträger, das heißt
              Landwirte/Landwirtinnen sowie deren Berater gedacht.<br>
              Die Anwendung ist gleichermaßen für konventionell als auch
              ökologisch/integriert wirtschaftende Betriebe geeignet.<br>
              Ein Datenimport aus Flächenatragsdaten ist
              derzeit lediglich für das Land Nordrhein-Westfalen verfügbar.
            </div>
            <div class="c">
              <h4 id="wie-gut-ist-der-erstellte-anbauplan">
                <a href="#wie-gut-ist-der-erstellte-anbauplan">
                  Wie gut ist der erstellte Anbauplan?
                </a>
              </h4>
              Die Qualität der Optimierung steht und fällt mit der Qualität der
              von Ihnen eingegeben Daten. Da für die Anbaukulturen Standardwerte für
              Preise, Erträge, Kosten, Fruchtfolgeeffekte uvm. aus diversen
              Datenbanken importiert werden, können diese teilweise stark von den
              tatsächlich auf Ihrem Betrieb auftretenden Daten abweichen. Eine Anpassung
              Ihrerseits ist daher unabdingbar.<br><br>
              Allgemein ist die "Fruchtfolge"-Anwendung als praktische Planungshilfe
              gedacht. Die sorgfältige Überprüfung und gegebenenfalls Anpassung des
              Anbauplans vor der tatsächlichen Umsetzung ist jedoch zwingend erforderlich.
            </div>
            <div class="c">
              <h4 id="ist-die-anwendung-wirklich-kostenlos">
                <a href="#ist-die-anwendung-wirklich-kostenlos">
                  Ist die Anwendung wirklich kostenlos?
                </a>
              </h4>
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
            </div>
            <div class="c">
              <h4 id="warum-muss-ich-meine-adresse-bei-der-registrierung-angeben">
                <a href="#warum-muss-ich-meine-adresse-bei-der-registrierung-angeben">
                  Warum muss ich meine Adresse bei der Registrierung angeben?
                </a>
              </h4>
              Die Adresse Ihrer Hofstelle wird benötigt, um die Hof-Feld Entfernungen
              der von Ihnen bewirtschafteten Flächen zu errechnen. Mit dieser Information
              werden schlagspezifische Transportkosten und Arbeitszeitbedarfe für
              Sie errechnet.
            </div>
            <div class="c">
              <h4 id="sind-meine-daten-sicher">
                <a href="#sind-meine-daten-sicher">Sind meine Daten sicher?</a>
              </h4>
              Ihre Daten werden nur lokal auf Ihrem Rechner, sowie auf einem gesicherten
              Server der Universität in Bonn gespeichert und unterliegen somit den Datenschutzauflagen
              des Landes NRW.
            </div>
            <div class="c">
              <h4 id="wie-stabil-ist-die-anwendung">
                <a href="#wie-stabil-ist-die-anwendung">
                  Wie stabil ist die Anwendung?
                </a>
              </h4>
              Die "Fruchtfolge"-Anwendung befindet sich derzeit noch im sogenannten
              Beta stadium. Wenn bei der Nutzung der Anwendung Fehler auftreten,
              würden wir uns über eine <nuxt-link class="link" to="/kontakt">
                kurze Mitteilung
              </nuxt-link> freuen.
            </div>
            <div class="c">
              <h4 id="ich-wuerde-gerne-bei-der-entwicklung-mithelfen">
                <a href="#ich-wuerde-gerne-bei-der-entwicklung-mithelfen">
                  Ich würde gerne bei der Entwicklung mithelfen. Was kann ich tun?
                </a>
              </h4>
              Die Entwicklung der Anwendung findet auf der Entwicklerplattform Github
              unter der Adresse
              <a class="link" href="https://github.com/fruchtfolge" target="_blank">https://github.com/fruchtfolge</a>
              statt. Auf der Seite finden Sie weitere Hinweise zur Kollaboration sowie
              aktuell anstehende Aufgaben.
            </div>
            <div class="c">
              <h4 id="ich-habe-fragen-zur-anwendung">
                <a href="#ich-habe-fragen-zur-anwendung">
                  Ich habe Fragen/Anregungen bezüglich der Anwendung.
                </a>
              </h4>
              Sie können uns gerne über die auf der <nuxt-link class="link" to="/kontakt">
                Kontakt-Seite
              </nuxt-link>
              angegebenen Kontaktmöglichkeiten erreichen.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Setting from '~/constructors/Settings'
import geo from '~/assets/js/geo'
import notifications from '~/components/notifications'

export default {
  components: {
    loading: () => import('~/components/loading.vue'),
    autocomplete: () => import('~/components/autocomplete.vue'),
    addressMap: () => import('~/components/address_map.vue')
  },
  data() {
    return {
      showRegister: false,
      pendingMax: 0,
      progress: '0%',
      coords: [7.685235, 51.574318],
      coordsForward: [7.685235, 51.574318],
      email: '',
      password: '',
      address: '',
      confirmPassword: '',
      autocomplete: [],
      forgotPassword: false,
      dsgvoAccepted: false,
      cookiesAccepted: false,
      clicked: false,
      loading: false
    }
  },
  created() {
    console.info('Fruchtfolge Version ' + this.$version)
    console.log(
      'Moin! Interssiert an der Entwicklung? Mehr Infos auf github.com/fruchtfolge :)\n'
    )
    this.debouncedAutocomplete = _.debounce(async () => {
      try {
        this.autocomplete = await geo.autocomplete(this.address)
      } catch (e) {
        console.error(JSON.stringify(e))
        // this.incomplete({ title: 'ADRESSE', message: e.message })
      }
    }, 150)
    this.$bus.$on('flip', this.flip)
  },
  destroyed() {
    this.$bus.$off('flip')
  },
  notifications: notifications,
  methods: {
    flip() {
      // scroll to top of page after clicking
      const el = document.getElementById('background')
      el.scrollIntoView({ behavior: 'smooth' })
      return this.showRegister
        ? (this.showRegister = false)
        : (this.showRegister = true)
    },
    updateCoords(value) {
      this.coords = [value.lng, value.lat]
    },
    async forwardGeocode() {
      if (this.address.length < 3) return
      let geoData
      try {
        geoData = await geo.forward(this.address)
      } catch (e) {
        console.error(e)
        return
      }
      this.stateDistrict = geoData.state_district
      this.city = geoData.city
      this.coordsForward = geoData.home
      this.coords = geoData.home
    },
    checkSignup() {
      if (
        !this.address ||
        !this.email ||
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
      } else if (this.coords === [7.685235, 51.574318]) {
        this.showAddressWarn({
          message:
            'Bitte ziehen Sie den Mittelpunkt der Karte auf die Adresse Ihres Betriebes.'
        })
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
        if (signup) this.signupSuccess()
        else this.loginSuccess()
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
            if (auth.user_id !== 'debug@test.de') {
              const { data } = await this.$axios.post(
                process.env.baseUrl + 'auth/userDoc',
                {
                  username: auth.user_id
                }
              )
              settings.street = data.address
              settings.city = data.city
              settings.home = data.home
              settings.timestamp = date.toISOString()
              settings.state_district = data.state_district
            }
            settings.auth = auth

            await this.$db.put(settings)
            // start syncing
            this.$store.sync = this.$db.sync(settings.auth.userDBs.userdb, {
              live: true,
              retry: true
            })
            if (signup) {
              return $nuxt.$router.replace({ path: '/settings' })
            }
            try {
              $nuxt.$router.replace({ path: '/maps' })
            } catch (e) {
              console.log(e)
            }
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

        const { data } = await this.$axios.post(
          process.env.baseUrl + 'auth/register',
          {
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword,
            address: this.address,
            postcode: '',
            home: this.coords,
            state_district: this.state_district,
            city: this.city
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
    async postForgotPassword() {
      if (!this.email) {
        return this.loginError({
          message: 'Bitte geben Sie Ihre E-Mail Adresse an.'
        })
      }
      this.clicked = true
      this.loading = true
      this.progress = 'Ihre Anfrage wird bearbeitet'
      try {
        await this.$axios.post(process.env.baseUrl + 'auth/forgot-password', {
          email: this.email
        })
        return $nuxt.$router.replace({ path: '/forgot-password' })
      } catch (e) {
        this.clicked = false
        this.loading = false
        this.progress = '0%'
        this.loginError({
          message: 'Kein Account mit dieser E-Mail Adresse hinterlegt.'
        })
        console.error(e)
      }
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
  middleware: null,
  scrollToTop: true,
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
  margin-top: calc(-50vh - 290px);
}

.margin-front {
  margin-left: -360px;
}

.margin-back {
  margin-left: -360px;
}

.width-back {
  width: 720px;
}

/* entire container, keeps perspective */
.flip-container {
  perspective: 3000px;
}

/* flip the pane when hovered */
.flip-container.flip .flipper {
  transform: rotateY(-180deg);
}

.flip-container,
.login {
  width: 720px;
  height: 550px;
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
  height: 650px;
  width: 720px;
  transform: rotateY(180deg);
}

.login {
  background: white;
  border-radius: 0px;
}

.teaser {
  font-size: 14px;
  margin-left: 60px;
  width: 300px;
}

.login p {
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.23em;
  font-size: 28px;
  text-align: center;
  color: black;
  padding-top: 55px;
  margin: 0px;
  margin-bottom: 40px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.login-container {
  width: 233px;
  position: absolute;
  right: 60px;
  top: 0px;
}
.registrierung p {
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.23em;
  font-size: 26px;
  text-align: center;
  color: black;
  padding-top: 35px;
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

.register-input-container {
  position: absolute;
  right: 35px;
  top: 111px;
  width: 241px;
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

.email {
  margin-bottom: 10px;
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
  margin-bottom: 10px;
  width: 233px;
  height: 33px;
  right: 50px;
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

.label {
  font-family: Inter, sans-serif;
  font-size: 12px;
}

.label-login {
  font-family: Inter, Helvetica, Arial, sans-serif;
  font-weight: 300;
  padding-left: 5px;
  font-size: 11px;
  color: #999999;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.login-button {
  margin-top: 40px;
  width: 241px;
  height: 40px;
  right: 50px;
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
  bottom: 30px;
  width: 241px;
  height: 40px;
  margin-top: 50px;
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
  cursor: pointer;
  margin-top: 20px;
  float: right;
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
  /* height: 100vh; */
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
  font-family: 'Open Sans Condensed', sans-serif;
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

  .smallDisplay {
    display: block;
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
