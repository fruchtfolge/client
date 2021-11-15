<template>
  <div id="map" class="map" />
</template>

<script>
import area from '@turf/area'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw'
// load Mapbox Draw configuration file
import drawConfig from '../assets/js/draw.config.js'
import notifications from '~/components/notifications'

export default {
  name: 'MapBox',
  data() {
    return {
      curYear: ''
    }
  },
  notifications: notifications,
  async mounted() {
    let settings
    try {
      settings = await this.$db.get('settings')
      this.curYear = settings.curYear
      // initialize map
      this.createMap(settings)
      // initially draw plots, if available
      if (this.$store.curPlots) {
        this.curPlots = this.$store.curPlots
        // console.log(this.curPlots)
        this.drawPlots(this.curYear, this.curPlots)
      }
    } catch (e) {
      if (e.status === 404) {
        this.showAddressWarn()
        return $nuxt.$router.replace({ path: 'settings' })
      }
      console.log(e)
    }
    // if (!settings.home) {
    //  this.showAddressWarn()
    //  return $nuxt.$router.replace({path: 'settings'})
    // }
  },
  created() {
    // listen to changes in settings and plots (current planning year etc.)
    this.$bus.$on('changeCurrents', () => {
      this.curYear = this.$store.curYear
      this.curPlots = this.$store.curPlots
      this.removeDraw()
      if (this.curPlots) {
        this.drawPlots(this.curYear, this.curPlots)
      }
    })
    // listen to flyTo events
    this.$bus.$on('flyTo', plot => {
      if (!plot || !plot.center) return
      this.map.flyTo({
        center: plot.center,
        zoom: 15
      })
    })

    this.$bus.$on('resize', () => {
      setTimeout(() => {
        this.map.resize()
      }, 500)
    })

    this.$bus.$on('drawPlot', geometry => {
      this.Draw.add(geometry)
    })
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
    this.$bus.$off('resize')
    this.$bus.$off('flyTo')
    this.$bus.$off('drawPlot')
    this.map.remove()
  },
  methods: {
    createMap(settings) {
      mapboxgl.accessToken =
        'pk.eyJ1IjoidG9mZmkiLCJhIjoiY2l3cXRnNHplMDAxcTJ6cWY1YWp5djBtOSJ9.mBYmcCSgNdaRJ1qoHW5KSQ'

      // init the map
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v11?optimize=true',
        // style: 'mapbox://styles/mapbox/light-v10?optimize=true',
        center: settings.home || [7.685235, 51.574318],
        zoom: settings.home ? 14 : 8,
        dragPan: false,
        drageRotate: false
      })

      this.Draw = new MapboxDraw(drawConfig)
      this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-left')
      this.map.addControl(this.Draw, 'bottom-left')
      this.map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl
      }))
      // add drawing event listeners
      this.map.on('draw.create', this.create)
      this.map.on('draw.update', this.update)
      this.map.on('draw.delete', this.delete)
      this.map.on('draw.combine', this.combine)
      this.map.on('draw.selectionchange', this.select)
    },
    drawPlots(year, plots) {
      try {
        // const geometries = []
        plots.forEach(plot => {
          plot.geometry.properties._id = plot._id
          this.Draw.add(plot.geometry)
          // geometries.push(plot.geometry)
        })
        // fit map to the bounds of the plots
        // const extent = featureCollection(geometries)
        // const bounds = bbox(extent)
        // this.map.fitBounds(bounds, {padding: 40, duration: 0})
      } catch (e) {
        console.log(e)
      }
    },
    async delete(data) {
      try {
        // fetch plot object from DB
        const plot = await this.$db.get(data.features[0].properties._id)
        // remove from Database
        await this.$db.remove(plot)
        this.showPlotRemoveSucc()
      } catch (e) {
        this.showError()
        console.log(e)
      }
    },
    async update(data) {
      try {
        // get plot object from Database
        const plot = await this.$db.get(data.features[0].properties._id)
        // update geometry
        plot.geometry = data.features[0]
        // update size
        plot.size = this.getSize(plot.geometry)
        // store changes in Database
        await this.$db.put(plot)
      } catch (e) {
        console.log(e)
      }
    },
    getSize(geometry) {
      const m2 = area(geometry)
      return Number((m2 / 10000).toFixed(2))
    },
    combine() {},
    create(data) {
      this.$emit('addPlot', data)
      this.Draw.delete(data.features[0].id)
    },
    removeDraw() {
      if (this.Draw) this.Draw.deleteAll()
    },
    select(data) {
      if (data.features.length !== 1) return
      this.$bus.$emit('selectedPlot', data.features[0].properties._id)
    }
  }
}
</script>

<style>
.map {
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
}
</style>
