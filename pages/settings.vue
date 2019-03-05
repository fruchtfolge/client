<template>
  <div>
    <div v-if="loading" class="blur loading">
      <div class="spinner-container">
        <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        <h2 style="text-align: center;">Daten werden geladen ... <br> Der Vorgang kann einige Minuten in Anspruch nehmen</h2>      
      </div>
    </div>
    <div style="width: 50%; min-width: 500px; margin: auto; top: 120px;">
        <h1 style="font-family: 'Open Sans Condensed'; font-weight: normal; letter-spacing: 0.2em">EINSTELLUNGEN</h1>
        <span>Für die Optimierung wird der Standort Ihres Betriebes benötigt. Dieser wird für die Berechnung der Hof-Feld-Distanzen der einzelnen Schläge verwendet. Anhand dieser Information werden die Deckungsbeiträge schlagspezifisch errechnet.</span>
        <br>
        <div style="width: 100%; height: 12px; border-bottom: 1px solid black; text-align: center; margin-top: 40px; margin-bottom: 40px">
            <span style="font-size: 20px; letter-spacing: 0.2em; background-color: #F3F5F6; padding: 0 20px;">
          ADRESSE <!--Padding is optional-->
        </span>
        </div>
        <div style="text-align: center;">
          <input v-model="street" type="text" class="input" placeholder="Straße und Hausnummer">
          <br>
          <input v-model="postcode" type="text" class="input" placeholder="PLZ">
          <br>
          <input v-model="city" type="text" class="input" placeholder="Stadt">
        </div>
        <br>
        <h1 style="padding-top: 20px; font-family: 'Open Sans Condensed'; font-weight: normal; letter-spacing: 0.2em">DATENEINGABE</h1>
        <span>Für die Optimierung werden Daten bezüglich Ihrer bewirtschafteten Flächen benötigt. Dabei werden insbesondere die Schlagskizzen (Geodaten) sowie die Vorfrüchte der Felder für die Optimierungsrechnung verwendet. Wenn Ihr Betrieb den Flächenantrag in Nordrhein-Westfalen stellt, können die Flächendaten aus dem ELAN-Downloadportal durch eingabe der ZID-Nummer und Passwort automatisch eingefügt werden.
        <br>
        <strong>Datenschutzhinweis:</strong> Ihre Invekos-Daten (Betriebsnummer und Passwort) werden über eine gesicherte SSL-Verbindung zur Abfrage im ELAN-Downloadportal übertragen. Die Anmeldedaten werden lokal auf Ihrem Rechner gespeichert.</span>
        <div style="width: 100%; height: 12px; border-bottom: 1px solid black; text-align: center; margin-top: 40px; margin-bottom: 40px">
            <span style="font-size: 20px; letter-spacing: 0.2em; background-color: #F3F5F6; padding: 0 20px;">
          ZID-DATEN ABFRAGE <!--Padding is optional-->
        </span>
        </div>
        <div style="text-align: center;">
          <input v-model="zidId" type="text" id='zid' class="input" name="zid" placeholder="ZID-Betriebsnummer">
          <br>
          <input v-model="zidPass" type="password" id='zid-pw' class="input" name="zid-pw" @keyup.enter="getElan" placeholder="Passwort">
          <br>
        </div>
        <div style="text-align: center;">
          <button type="button" id='zid-btn' class="invekosBtn" name="zid-btn" @click="getElan">ABSENDEN</button>
          <button style="margin-left: 10px" type="button" id='zid-btn' class="invekosBtn" name="zid-btn" @click="deleteElanData">DATEN LÖSCHEN</button>          
        </div>
        
        <div style="width: 100%; height: 12px; border-bottom: 1px solid black; text-align: center; margin-top: 40px; margin-bottom: 40px">
            <span style="font-size: 20px; letter-spacing: 0.2em; background-color: #F3F5F6; padding: 0 20px;">
          ODER ELAN-DATEI UPLOAD
        </span>
        </div>
        <span>XML-Datei</span>
        <input type="file" accept=".xml" id='xml' name="xml" @change="processFile($event,'xml')">
        <br>
        <span>GML-Datei</span>
        <input type="file" accept=".gml" id='gml' name="gml" @change="processFile($event, 'gml')">
        
        <h1 style="padding-top: 40px; font-family: 'Open Sans Condensed'; font-weight: normal; letter-spacing: 0.2em">PERSÖNLICHE DATEN</h1>
        <span>Persönlich angelegte Daten, z.B. Flächen, Kulturen oder Nebenbedingungen können an dieser Stelle für einzelne Jahre gelöscht werden. So können Sie beispielsweise verhindern, dass vorherige Planungsdaten als duplikate zu den Elan-Daten auftauchen.</span>
        <div style="width: 100%; height: 12px; border-bottom: 1px solid black; text-align: center; margin-top: 40px; margin-bottom: 40px">
        </div>
        <div style="text-align: center;">
          <select v-model="selectedDeleteYear" class="deleteYear" name="">
            <option value="2016">2016</option>
            <option value="2017">2017</option>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
          </select>
        </div>
        <div style="text-align: center;">
          <button type="button" id='zid-btn' class="invekosBtn" name="zid-btn" @click="deleteYear">LÖSCHEN</button>
        </div>
    </div>
  </div>
</template>

<script>
import mapquest from '~/assets/js/mapquest'

export default {
  data() {
    return {
      loading: false,
      zidId: '',
      zidPass: '',
      curYear: 2019,
      street: '',
      city: '',
      postcode: '',
      selectedDeleteYear: 2019
    }
  },
  notifications: {
    showAddressWarn: {
      title: 'ADRESSE UNVOLLSTÄNDIG',
      message: 'Bitte füllen Sie das Adressfeld komplett aus.',
      type: 'warn'
    },
    showZidErr: {
      title: 'INVEKOS FEHLER',
      message: 'Bitte stellen Sie sicher, dass Ihre 12-stellige Betriebsnummer vollständig ist, und Sie das korekkte Passwort eingegeben haben. ',
      type: 'warn'
    },
    noAddressErr: {
      title: 'ADRESSE UNGÜLTIG',
      message: 'Die angegebene Adresse konnte nicht gefunden werden.',
      type: 'error'
    },
    showAddressSucc: {
      title: 'ADRESSE GESPEICHERT',
      message: 'Die Hof-Adresse wurde in den Einstellungen gespeichert.',
      type: 'success'
    },
    showZidSucc: {
      title: 'DATEN IMPORTIERT',
      message: 'Die ELAN Antragsdaten wurden erfolgreich importiert.',
      type: 'success'
    },
    showInfo: {
      title: 'KEINE DATEN',
      message: 'Es wurden keine ELAN Daten gefunden.',
      type: 'info'
    },
    showError: {
      title: 'EIN FEHLER IST AUFGETRETEN',
      message: 'Unbekannter Fehler.',
      type: 'error'
    }
  },
  watch: {
    street() {
      if (this.street !== this.settings.street) this.debouncedGetHome()
    },
    postcode() {
      if (this.postcode !== this.settings.postcode) this.debouncedGetHome()
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
      this.curYear = this.settings.curYear
      this.street = this.settings.street
      this.postcode = this.settings.postcode
      this.city = this.settings.city
      console.log(this.settings);
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
        const address = await mapquest.forward(this.street, this.postcode, this.city)

        settings.street = this.street
        settings.city = this.city
        settings.postcode = this.postcode
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
      let decoder = new TextDecoder(decoderType);
      return decoder.decode(arrayBuffer);
    },
    readFileAsync(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsArrayBuffer(file);
      })
    },
    async processFile(event,type) {
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
          const request = {
            xml: this.xml,
            gml: this.gml,
            settings: settings
          }
          console.log(request);
          const { data } = await this.$axios.post('http://localhost:3001/elan/files/', request,{ progress: true })
          await this.$db.bulkDocs(data)
          this.loading = false
          this.showZidSucc()
        }
      } catch (e) {
        this.showError()
        this.loading = false
        console.log(e)
      }
    },
    getLatestElanYear(year,month) {
      // The Elan Download portal is generally updated on the 1st of September
      if (month >= 8) return year
      else return (year-1)
    },
    getOldestElanYear(year,month) {
      // The data is generally downloadable for 5 years.
      if (month >= 8) year = year + 1
      if (year - 5 < 2016) return 2016
      else return year - 5
    },
    range(start, end) {
      return Array(end - start + 1).fill().map((_, idx) => start + idx)
    },
    getAvailYears() {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth()
      
      const latest = this.getLatestElanYear(year,month)
      const oldest = this.getOldestElanYear(year,month)
      
      return this.range(oldest,latest)
    },
    async deleteYear() {
      try {
        const year = Number(this.selectedDeleteYear)
        const result = await this.$db.find({
          selector: {year: year},
          fields: ['_id','_rev']
        })
        console.log(result);
        if (result && result.docs && result.docs.length > 0) {
          const toDelete = result.docs.map(o => {o._deleted = true; return o})
          await this.$db.bulkDocs(toDelete)
          this.showZidSucc({title: 'DATEN GELÖSCHT', message: 'Die Daten wurden erfolgreich gelöscht.'})
        } else {
          this.showInfo({title: 'KEINE DATEN', message: 'Es wurden keine Daten gefunden.'})
        }
      } catch (e) {
        
      }
    },
    async deleteElanData() {
      try {
        const result = await this.$db.find({
          selector: {elan: true},
          fields: ['_id','_rev']
        })
        if (result && result.docs && result.docs.length > 0) {
          const settings = await this.$db.get('settings')
          const toDelete = result.docs.map(o => {o._deleted = true; return o})
          delete settings.elanYears
          const docs = toDelete.concat(settings)
          await this.$db.bulkDocs(docs)
          
          this.showZidSucc({title: 'DATEN GELÖSCHT', message: 'Die ELAN Daten wurden erfolgreich gelöscht.'})
        } else {
          this.showInfo()
        }
      } catch (err) {
        console.log(err);
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
        const stateCode = this.zidId.slice(0,3)
        console.log(this.zidId.length, stateCode, this.zidPass);
        if (this.zidId.length === 15 && stateCode === "276" && this.zidPass) {
          this.loading = true
          // check if older elan data is already stored in db => only download new data
          let years = this.getAvailYears()
          years = years.filter(year => {
            if (!settings.elanYears || settings.elanYears.indexOf(year) === -1) return year
          })
          if (years.length === 0) {
            this.loading = false
            return this.showInfo({title: 'DATEN AKTUELL', message: 'Die ELAN Daten sind auf dem neuesten Stand.'})
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
          console.log(request);
          const { data } = await this.$axios.post('http://localhost:3001/elan/', request,{ progress: true })
          // save zid id in settings, however don't store password for security reasons
          settings.zidId = this.zidId
          settings.elanYears = settings.elanYears ? years.concat(settings.elanYears) : years
          const update = data.concat(settings)
          await this.$db.bulkDocs(update)
          this.loading = false
          this.showZidSucc()
        } else {
          this.showZidErr()
        }
      } catch (e) {
        this.loading = false
        console.log(e)
        this.showError({message: e})
      }
    }
  }
}
</script>

<style scoped>
.input {
  margin-bottom: 5px;
  width: 485px;
  height: 33px;
  border-style: solid;
  border-width: 1px;
  border-color: grey;
  background-color: transparent;
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
.deleteYear {
  width: 240px;
  font-size: 18px;
  border-color: black;
  padding-left: 12px;
  margin-bottom: 15px;
  height: 40px;
  padding-right: 25px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='#444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-repeat: no-repeat;
  background-position: 100% 50%;
}
</style>
