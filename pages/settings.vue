<template>
  <div>
    <loading v-if="loading" :main="status" />
    <div style="margin-top: 30px; display: flex; flex-wrap: wrap; justify-content:center; ">
      <div class="settings-element">
        <modal v-if="isModalOpen" :head="'ELAN DATEN LÖSCHEN'" :body="`Wollen Sie die zuvor heruntergerladenen ELAN-Antragsdaten wirklich löschen?`" :buttonOk="'LÖSCHEN'" :callback="deleteElanData" @closeModal="isModalOpen = false" />
        <h1 id="data-entry" style="font-family: 'Open Sans Condensed'; font-weight: normal; letter-spacing: 0.2em" class="anchor-link">
          DATEN-IMPORT
        </h1>
        <span class="text">Für die Optimierung werden Daten bezüglich Ihrer bewirtschafteten Flächen benötigt. Dabei werden insbesondere die Schlagskizzen (Geodaten) sowie die Vorfrüchte der Felder für die Optimierungsrechnung verwendet. Wenn Ihr Betrieb den Flächenantrag in Nordrhein-Westfalen stellt, können die Flächendaten aus dem ELAN-Downloadportal durch eingabe der ZID-Nummer und Passwort automatisch eingefügt werden.
          <br>
          <strong>Datenschutzhinweis:</strong> Ihre Invekos-Daten (Betriebsnummer und Passwort) werden einmalig zur Abfrage im ELAN-Downloadportal übertragen. Ihre Betriebsnummer, jedoch nicht das Passwort wird lokal auf Ihrem Rechner gespeichert.</span>
        <div style="width: 100%; height: 12px; border-bottom: 1px solid black; text-align: center; margin-top: 40px; margin-bottom: 40px">
          <span style="font-family: 'Open Sans Condensed'; font-size: 20px; letter-spacing: 0.2em; background-color: #F3F5F6; padding: 0 20px;">
            ZID-DATEN ABFRAGE <!--Padding is optional-->
          </span>
        </div>
        <div style="text-align: center;">
          <input
            id="zid"
            v-model="zidId"
            type="text"
            class="input"
            name="zid"
            autocomplete="off"
            placeholder="ZID-Betriebsnummer (27605...)"
          >
          <br>
          <input
            id="zid-pw"
            v-model="zidPass"
            type="password"
            class="input"
            name="zid-pw"
            autocomplete="off"
            placeholder="Passwort"
            @keyup.enter="getElan"
          >
          <br>
        </div>
        <div style="text-align: center;">
          <button id="zid-btn" type="button" class="invekosBtn button" name="zid-btn" @click="getElan">
            ABSENDEN
          </button>
          <button
            id="zid-btn"
            style="margin-left: 10px"
            type="button"
            class="invekosBtn button"
            name="zid-btn"
            @click="isModalOpen = true"
          >
            DATEN LÖSCHEN
          </button>
        </div>
  
        <div style="width: 100%; height: 12px; border-bottom: 1px solid black; text-align: center; margin-top: 40px; margin-bottom: 40px">
          <span style="font-size: 20px; font-family: 'Open Sans Condensed'; letter-spacing: 0.2em; background-color: #F3F5F6; padding: 0 20px;">
            ODER ELAN-DATEI UPLOAD
          </span>
        </div>
        <span>XML-Datei</span>
        <input id="xml" type="file" accept=".xml" name="xml" @change="processFile($event,'xml')">
        <br>
        <span>GML-Datei</span>
        <input id="gml" type="file" accept=".gml" name="gml" @change="processFile($event, 'gml')">
      </div>
      
      <div class="settings-element">
        <h1 id="address" style="font-family: 'Open Sans Condensed'; font-weight: normal; letter-spacing: 0.2em" class="anchor-link">
          ADRESSE
        </h1>
        <span class="text">
          Die Adresse Ihrer Hofstelle wird benötigt, um die Hof-Feld Entfernungen
          der von Ihnen bewirtschafteten Flächen zu errechnen. Mit dieser Information
          werden schlagspezifische Transportkosten und Arbeitszeitbedarfe für
          Sie errechnet.
        </span>
        <br>
        <br>
        <span class="text">Geben Sie im Suchfeld in der Karte die Adresse Ihres Betriebes an.<br>
        Ziehen Sie falls nötig anschließend den Mittelpunkt der Karte (Ähre im grünen Kreis) auf Ihren Betrieb.</span>
        <div style="margin-top: 15px;">
          <addressMap :coordsForward="homeCoords" :width="'100%'" :showText="false" :includeGeocoder="true" :zoom="15" />
        </div>
      </div>
      
      <div class="settings-element">
        <h1 style="font-family: 'Open Sans Condensed'; font-weight: normal; letter-spacing: 0.2em" class="anchor-link">
          PERSÖNLICHE DATEN
        </h1>
        <span class="text">Persönlich angelegte Daten, z.B. Flächen, Kulturen oder Nebenbedingungen können an dieser Stelle für einzelne Jahre gelöscht werden. So können Sie beispielsweise verhindern, dass vorherige Planungsdaten als duplikate zu den Elan-Daten auftauchen.</span>
        <div style="width: 100%; height: 12px; border-bottom: 1px solid black; text-align: center; margin-top: 40px; margin-bottom: 40px" />
        <div style="text-align: center;">
          <select v-model="selectedDeleteYear" class="deleteYear select" name="">
            <option v-for="year in years" :key="`${year}_option`" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <div style="text-align: center;">
          <button id="zid-btn" type="button" class="invekosBtn button" name="zid-btn" @click="deleteYear">
            LÖSCHEN
          </button>
        </div>
      </div>

      <!-- 
      <h1 style="padding-top: 40px; font-family: 'Open Sans Condensed'; font-weight: normal; letter-spacing: 0.2em">
        Düngeverordnung 2020
      </h1>
      <input type="checkbox" :checked="duev2020" @change="save($event)">
    -->
    </div>
  </div>
</template>

<script>
import geo from '~/assets/js/geo'
import notifications from '~/components/notifications'

export default {
  components: {
    loading: () => import('~/components/loading.vue'),
    addressMap: () => import('~/components/address_map.vue'),
    modal: () => import('~/components/modal.vue')
  },
  data() {
    return {
      loading: false,
      isModalOpen: false,
      duev2020: true,
      status:
        'Flächenanträge werden von der Landwirtschaftskammer heruntergerladen.',
      interval: '',
      zidId: '',
      zidPass: '',
      curYear: 2019,
      street: '',
      city: '',
      homeCoords: [7.685235, 51.574318],
      selectedDeleteYear: 2019,
      years: _.range(2016,2030)
    }
  },
  notifications: notifications,
  watch: {
    street() {
      if (this.street !== this.settings.street) this.debouncedGetHome()
    },
    city() {
      if (this.city !== this.settings.city) this.debouncedGetHome()
    }
  },
  async created() {
    // we don't want to call MapQuest for geocoding the new address
    // while the user is still typing -> debouncing request
    this.debouncedGetHome = _.debounce(this.getHome, 500)

    try {
      // get settings from db (if available)
      this.settings = await this.$db.get('settings')

      // allocate settings to reactive properties
      this.zidId = this.settings.zidId
      // this.zidPass = this.settings.zidPass
      this.duev2020 = this.settings.duev2020
      this.curYear = this.settings.curYear
      this.street = this.settings.street
      this.city = this.settings.city
      this.homeCoords = this.settings.home
    } catch (e) {
      console.log(e)
    }
  },
  methods: {
    // get settings object, forward gecode the farm address
    // and store coordinates in settings.home
    async getHome() {
      if (!this.street || !this.city) return this.showAddressWarn()
      try {
        const settings = await this.$db.get('settings')
        const address = await geo.forward(this.street)

        settings.street = this.street
        settings.city = this.city
        settings.home = address.home
        settings.state_district = address.state_district

        await this.$db.put(settings)
        this.showAddressSucc()
      } catch (e) {
        console.log(e)
        this.noAddressErr()
      }
    },
    arrayBufferToString(arrayBuffer, decoderType = 'utf-8') {
      const decoder = new TextDecoder(decoderType)
      return decoder.decode(arrayBuffer)
    },
    readFileAsync(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
          resolve(reader.result)
        }

        reader.onerror = reject

        reader.readAsArrayBuffer(file)
      })
    },
    clearStatus() {
      clearInterval(this.interval)
    },
    getStatus(request, settings) {
      this.interval = setInterval(async () => {
        try {
          const { data } = await this.$axios.post(
            process.env.baseUrl + 'elan/status/',
            request,
            { progress: true }
          )
          this.status = `Bearbeite Schlag ${data.plot} von ${
            data.outOfPlots
          }, Anbaujahr ${data.year}`

          if (data.docs) {
            clearInterval(this.interval)
            // save zid id in settings, however don't store password for security reasons
            settings.zidId = this.zidId
            settings.elanYears = settings.elanYears
              ? request.years.concat(settings.elanYears)
              : request.years
            const update = data.docs.concat(settings)

            await this.$db.bulkDocs(update)
            this.loading = false
            this.showZidSucc()
          }
        } catch (e) {
          clearInterval(this.interval)
          this.loading = false
          console.log(e)
        }
      }, 2000)
    },
    async processFile(event, type) {
      try {
        const file = event.target.files[0]
        if (!file) return
        const buffer = await this.readFileAsync(file)
        const fileContent = this.arrayBufferToString(buffer)
        if (type === 'xml' && !this.xml) this.xml = fileContent
        if (type === 'gml' && !this.gml) this.gml = fileContent

        if (this.xml && this.gml) {
          this.loading = true
          const settings = await this.$db.get('settings')

          // parse elan year
          const yearRegex = /<antragsjahr>(.*?)<\/antragsjahr>/
          const yearMatch = yearRegex.exec(this.xml)
          if (!yearMatch) throw new Error('Datei beschädigt.')

          // parse farm number
          const farmNoRegex = /<bnrzd>(.*?)<\/bnrzd>/
          const farmNoMatch = farmNoRegex.exec(this.xml)
          if (!farmNoMatch) throw new Error('Datei beschädigt.')

          const request = {
            xml: this.xml,
            gml: this.gml,
            years: [Number(yearMatch[1])],
            farmno: Number(farmNoMatch[1]),
            pass: Math.random(),
            settings: settings
          }
          console.log(request)
          const { headers } = await this.$axios.post(
            process.env.baseUrl + 'elan/files/',
            request,
            { progress: true }
          )
          console.log(headers)
          this.getStatus(request, settings)
        }
      } catch (e) {
        this.showError()
        this.loading = false
        console.log(e)
      }
    },
    async save(e) {
      this.duev2020 = e.target.checked
      const settings = await this.$db.get('settings')
      settings.duev2020 = this.duev2020
      await this.$db.put(settings)
    },
    getLatestElanYear(year, month) {
      // The Elan Download portal is generally updated on the 1st of September
      if (month >= 8) return year
      else return year - 1
    },
    getOldestElanYear(year, month) {
      // The data is generally downloadable for 5 years.
      if (month >= 8) year = year + 1
      if (year - 5 < 2016) return 2016
      else return year - 5
    },
    range(start, end) {
      return Array(end - start + 1)
        .fill()
        .map((_, idx) => start + idx)
    },
    getAvailYears() {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth()

      const latest = this.getLatestElanYear(year, month)
      const oldest = this.getOldestElanYear(year, month)

      return this.range(oldest, latest)
    },
    async deleteYear() {
      try {
        const year = Number(this.selectedDeleteYear)
        const result = await this.$db.find({
          selector: { year: year },
          fields: ['_id', '_rev']
        })
        console.log(result)
        if (result && result.docs && result.docs.length > 0) {
          const toDelete = result.docs.map(o => {
            o._deleted = true
            return o
          })
          await this.$db.bulkDocs(toDelete)
          this.showZidSucc({
            title: 'DATEN GELÖSCHT',
            message: 'Die Daten wurden erfolgreich gelöscht.'
          })
        } else {
          this.showInfo({
            title: 'KEINE DATEN',
            message: 'Es wurden keine Daten gefunden.'
          })
        }
      } catch (e) {}
    },
    async deleteElanData() {
      try {
        const result = await this.$db.find({
          selector: { elan: true },
          fields: ['_id', '_rev']
        })
        if (result && result.docs && result.docs.length > 0) {
          const settings = await this.$db.get('settings')
          const toDelete = result.docs.map(o => {
            o._deleted = true
            return o
          })
          delete settings.elanYears
          const docs = toDelete.concat(settings)
          await this.$db.bulkDocs(docs)

          this.showZidSucc({
            title: 'DATEN GELÖSCHT',
            message: 'Die ELAN Daten wurden erfolgreich gelöscht.'
          })
        } else {
          this.showInfo()
        }
      } catch (err) {
        console.log(err)
      }
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
    },
    async getElan() {
      try {
        const settings = await this.$db.get('settings')
        const stateCode = this.zidId.slice(0, 5)
        console.log(this.zidId.length, stateCode, this.zidPass)
        if (this.zidId.length === 15 && stateCode === '27605' && this.zidPass) {
          this.loading = true
          // check if older elan data is already stored in db => only download new data
          let years = this.getAvailYears()
          years = years.filter(year => {
            if (!settings.elanYears || settings.elanYears.indexOf(year) === -1)
              return year
          })
          if (years.length === 0) {
            this.loading = false
            return this.showInfo({
              title: 'DATEN AKTUELL',
              message: 'Die ELAN Daten sind auf dem neuesten Stand.'
            })
          }
          settings.region = settings.state_district
          // if (!settings.home || !settings.region) return this.showAddressWarn()
          const farmno = this.zidId.slice(3)
          // make request
          const request = {
            farmno: farmno,
            pass: this.zidPass,
            years: years,
            settings: settings
          }
          console.log(request)
          const { headers } = await this.$axios.post(
            process.env.baseUrl + 'elan/',
            request,
            {
              progress: true
            }
          )
          console.log(headers)
          this.getStatus(request, settings)
        } else {
          this.showZidErr()
        }
      } catch (e) {
        this.loading = false
        console.log(e)
        this.showError({ message: e })
      }
    }
  }
}
</script>

<style scoped>
.settings-element {
  margin: 0px 60px 40px 60px;
  min-width: 500px;
  max-width: 680px;
  flex-basis: 100%;
}
.input {
  margin-bottom: 5px;
  width: 485px;
  height: 33px;
  border-style: solid;
  border-width: 1px;
  border-color: grey;
  background-color: white;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 18px;
  padding-left: 5px;
  border-radius: 0 !important;
}
.invekosBtn {
  margin-top: 20px;
  width: 241px;
}
.text {
  font-size: 14px;
}
.deleteYear {
  width: 240px;
  font-size: 18px;
  border-color: black;
  padding-left: 12px;
  margin-bottom: 15px;
  height: 40px;
  padding-right: 25px;
  background-image: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: 100% 50%;
}

.anchor-link::before {
  content: '';
  display: block;
  height:      75px;
  margin-top: -75px;
  visibility: hidden;
}

</style>
