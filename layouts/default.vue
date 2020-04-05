<template>
  <div v-if="settings">
    <div class="header">
      <div type="button" name="button" class="navIcon" @click="toggle" />
      <div class="logo">
        FRUCHTFOLGE
      </div>
      <!-- Planning year selector -->
      <select
        v-model="settings.curYear"
        class="select planYear hoverPointer"
        type="button"
        value="2019"
        title="Wählen Sie das aktuelle Planungsjahr für die Optimierung aus"
        @change="saveSettings"
      >
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
          class="sidenav-links"
          :class="{ active: isClicked(route), subPage: route.subPage }"
          @click="follow(route)"
        >
          {{ route.name }}
        </li>
      </ul>
      <div class="footer-container">
        <div class="footer-sidebar">
          <nuxt-link class="link" to="/kontakt">
            Kontakt
          </nuxt-link>
          <nuxt-link class="link" to="/impressum">
            Impressum
          </nuxt-link>
          <br>
          <nuxt-link class="link" to="/nutzungsbedingungen">
            Nutzungsbedingungen
          </nuxt-link>
          <nuxt-link class="link" to="/Datenschutz">
            Datenschutz
          </nuxt-link>
        </div>
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
          // compact database on logout
          await this.$axios.post(process.env.baseUrl + 'auth/compact')
          await this.$axios.post(process.env.baseUrl + 'auth/logout')
        } else if (route.path === this.curPage) return
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
  },
  transition: {
    name: 'InAndOut',
    mode: ''
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
  border-bottom: #ececec;
  border-bottom-style: solid;
  border-bottom-width: 1px;
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
  background: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
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
  padding-bottom: 150px;
  font-family: 'Open Sans Condensed', sans-serif;
}

.sidenav-container li:first-child {
  margin-bottom: 15px;
}

.sidenav-links {
  position: relative;
  width: 100%;
  cursor: pointer;
  font-size: 18px;
  letter-spacing: 0.1em;
  padding-left: 40px;
  top: 60px;
  line-height: 34px;
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
  padding-left: 50px;
  margin-top: -5px;
  font-family: Inter;
  letter-spacing: 0px;
  font-size: 14px;
  font-weight: 300;
}

.navIcon {
  position: fixed;
  left: 22px;
  top: 19px;
  z-index: 120;
  width: 33px;
  height: 27px;
  cursor: pointer;
  background: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20id%3D%27Ebene_1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20x%3D%270px%27%20y%3D%270px%27%20width%3D%2733px%27%20height%3D%2727px%27%20viewBox%3D%270%200%2033%2027%27%20enable-background%3D%27new%200%200%2033%2027%27%20xml%3Aspace%3D%27preserve%27%3E%20%3Cg%3E%20%3Crect%20width%3D%2733%27%20height%3D%272%27%2F%3E%20%3C%2Fg%3E%20%3Cg%3E%20%3Crect%20y%3D%2725%27%20width%3D%2733%27%20height%3D%272%27%2F%3E%20%3C%2Fg%3E%20%3Cg%3E%20%3Crect%20y%3D%2712%27%20width%3D%2733%27%20height%3D%272%27%2F%3E%20%3C%2Fg%3E%20%3C%2Fsvg%3E')
    no-repeat;
  background-size: 23px 25px;
  background-repeat: no-repeat;
  border-radius: 0 !important;
  border-style: solid;
  border-width: 0px;
  -moz-user-select: -moz-none;
}

.footer-container {
  bottom: 0px;
  position: fixed;
  width: inherit;
  overflow: hidden;
}

.footer-sidebar {
  background-color: #e8e8e8;
  width: 250px;
  padding: 10px;
  padding-top: 5px;
}

.footer-sidebar a {
  color: grey;
  font-family: Inter;
  font-weight: 300;
  text-decoration: none;
  margin-right: 5px;
  font-size: 11px;
}
</style>
