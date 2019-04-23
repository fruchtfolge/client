<template>
  <div v-if="settings">
    <div class="header">
      <div type="button" name="button" class="navIcon" @click="toggle" />
      <div class="logo">
        FRUCHTFOLGE
      </div>
      <!-- Scenario selector -->
      <select v-model="settings.curScenario" class="planYear scenario" type="button" value="Standard" @change="saveSettings">
        <option disabled value="">
          Szenario
        </option>
        <option v-for="(scenario,j) in scenarios" :key="j" :value="scenario.name">
          {{ scenario.name }}
        </option>
        <!-- <option>Neues Szenario</option> -->
      </select>
      <!-- Planning year selector -->
      <select v-model="settings.curYear" class="planYear" type="button" value="2019" @change="saveSettings">
        <option disabled value="">
          Planungsjahr
        </option>
        <option v-for="(year,i) in years" :key="i" :value="year.single">
          {{ year.full }}
        </option>
      </select>
    </div>
    <!-- navigation bar on the side -->
    <div class="sidenav" :style="sidenavStyle">
      <ul class="sidenav-container">
        <li
          v-for="(route, index) in routes"
          :key="index"
          @click="follow(route)"
        >
          <p class="sidenav-links" :class="{ active: isClicked(route), subPage: route.subPage }">
            {{ route.name }}
          </p>
        </li>
      </ul>
      <div class="footer-sidebar">
        <nuxt-link to="/kontakt">
          Kontakt
        </nuxt-link>
        <nuxt-link to="/impressum">
          Impressum
        </nuxt-link>
        <nuxt-link to="/nutzungsbedingungen">
          Nutzungsbedingungen
        </nuxt-link>
        <nuxt-link to="/Datenschutz">
          Datenschutz
        </nuxt-link>
      </div>
    </div>
    <!-- this is where the main application lives -->
    <nuxt class="nuxt" :style="mainStyle" />
  </div>
  <div v-else>
    <!-- loading component -->
  </div>
</template>

<script>
import Setting from '~/constructors/Settings'
import routes from '~/assets/js/routes.js'
// console.log(routes);
export default {
  data() {
    return {
      settings: {
        curYear: 2019,
        curScenario: 'Standard'
      },
      curPage: '',
      years: [],
      scenarios: [
        {
          name: 'Standard'
        }
      ],
      isOpen: true,
      sidenavStyle: {
        width: '250px'
      },
      mainStyle: {
        marginLeft: '250px'
      },
      clickedPage: {
        backgroundColor: 'rgba(0, 0, 0, .05)'
      },
      routes
    }
  },
  async created() {
    try {
      // set active route
      this.curPage = this.$nuxt.$route.path
      // construct planning periods for future/past
      this.constructYears()
      // get settings from db (if available)
      const settings = await this.$db.get('settings')
      this.settings.curYear = settings.curYear
      this.settings.curScenario = settings.curScenario
      // auto open sidenav when window width is greater than x
      const width = window.innerWidth > 0 ? window.innerWidth : screen.width
      if (width <= 1000) this.close()
    } catch (e) {
      if (e.status === 404) {
        this.settings = new Setting(this.settings)
        // store in db
        await this.$db.put(this.settings)
      } else {
        console.error(e)
      }
    }
  },
  methods: {
    open() {
      this.sidenavStyle.width = '250px'
      this.mainStyle.marginLeft = '250px'
      // this.mainStyle.width = 'calc(100% - 250px)'
      this.isOpen = true
    },
    close() {
      this.sidenavStyle.width = '0px'
      this.mainStyle.marginLeft = '0px'
      // this.mainStyle.width = '100%'
      this.isOpen = false
    },
    toggle() {
      this.$bus.$emit('resize', null)
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },
    async follow(route) {
      try {
        if (route.path === '/') {
          await this.$axios.post(process.env.baseUrl + 'auth/logout')
        }
        this.curPage = route.path
        return $nuxt.$router.replace({ path: route.path })
      } catch (e) {
        console.log(e)
        return $nuxt.$router.replace({ path: route.path })
      }
    },
    isClicked(route) {
      if (route.subPage) {
        return this.curPage === route.path
      }
    },
    async saveSettings() {
      try {
        const settings = await this.$db.get('settings')
        settings.curYear = this.settings.curYear
        settings.curScenario = this.settings.curScenario
        console.log(settings)
        await this.$db.put(settings)
      } catch (e) {
        console.log(e)
      }
    },
    constructYears() {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth()

      for (let i = year - 3; i < year + 6; i++) {
        this.years.push({
          single: i,
          full: `${i - 1}/${i}`
        })
      }
      // switch to new planning period after April
      if (month > 4) {
        this.settings.curYear = year + 1
      } else {
        this.settings.curYear = year
      }
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

.planYear {
  width: 125px;
  font-size: 18px;
  border-color: black;
  padding-left: 12px;
  margin-bottom: 15px;
  height: 40px;
  padding-right: 25px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='%23444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-repeat: no-repeat;
  background-position: 100% 50%;
  position: fixed;
  right: 30px;
  top: 10px;
}

.planYear:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.scenario {
  right: 175px;
}

.nuxt {
  position: relative;
  top: 60px;
  transition: margin-left 0.5s;
  padding-bottom: 50px;
}

.sidenav {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  transition: width 0.5s;
  background-color: #ececec;
  overflow-x: hidden;
  padding-top: 10px;
}

.sidenav-container {
  list-style: none;
  padding-left: 0px;
  padding-bottom: 50px;
}

.sidenav-links {
  position: relative;
  width: 100%;
  cursor: pointer;
  font-size: 18px;
  letter-spacing: 0.1em;
  padding-left: 40px;
  top: 60px;
  line-height: 40px;
  font-weight: normal;
  margin-top: 5px;
  margin-bottom: 5px;
}
.sidenav-links:not(.active):hover {
  background-color: rgba(0, 0, 0, 0.02);
}
.active {
  background-color: rgba(0, 0, 0, 0.05);
}

.subPage {
  padding-left: 60px;
  margin-top: -5px;
}

.navIcon {
  position: fixed;
  left: 22px;
  top: 19px;
  z-index: 120;
  width: 33px;
  height: 27px;
  cursor: pointer;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='33px' height='27px' viewBox='0 0 33 27' enable-background='new 0 0 33 27' xml:space='preserve'> <g> <rect width='33' height='2'/> </g> <g> <rect y='25' width='33' height='2'/> </g> <g> <rect y='12' width='33' height='2'/> </g> </svg>")
    no-repeat;
  background-size: 23px 25px;
  background-repeat: no-repeat;
  border-radius: 0 !important;
  border-style: solid;
  border-width: 0px;
  -moz-user-select: -moz-none;
}

.footer-sidebar {
  position: sticky;
  background-color: rgba(0, 0, 0, 0.02);
  bottom: 0px;
  padding: 10px;
  padding-bottom: 10px;
}

.footer-sidebar a {
  color: grey;
  font-family: 'Open Sans Light';
  text-decoration: none;
  font-size: 14px;
}
</style>
