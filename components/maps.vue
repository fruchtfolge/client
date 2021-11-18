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
        return $nuxt.$router.push({ path: 'settings' })
      }
      console.log(e)
    }
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
      // direct select plot in draw
      this.Draw.changeMode('direct_select', {featureId: plot._id})
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

      class HelloWorldControl {
        onAdd(map) {
          this._map = map;
          this._container = document.createElement('div');
          this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
          this._container.innerHTML = '<button class="mapbox-gl-draw_ctrl-draw-btn addIcon" title="Schläge hinzufügen"></button>'
          return this._container;
        }

        onRemove() {
          this._container.parentNode.removeChild(this._container);
          this._map = undefined;
        }
      }
      this.map.addControl(new HelloWorldControl(), 'bottom-left')

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
          plot.geometry.id = plot._id
          this.Draw.add(plot.geometry)
          // geometries.push(plot.geometry)
        })

        // check for query params, in that case center the given plot
        if (this.$route.query && this.$route.query.plot) {
          const plotId = this.$route.query.plot
          const match = this.curPlots.find(p => p._id === plotId)
          if (match) {
            this.map.flyTo({
              center: match.center,
              zoom: 15
            })
            // update sidebar to select plot accordingly
            this.$bus.$emit('selectedPlot', plotId)
            // direct select plot in draw
            this.Draw.changeMode('direct_select', {featureId: plotId})
          }
        }
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
        // show success toast
        this.saveSuccess()
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
.addIcon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15' height='15' width='15'%3E%3Ctitle%3Ehospital.svg%3C/title%3E%3Crect fill='none' x='0' y='0' width='15' height='15'%3E%3C/rect%3E%3Cpath fill='%23333' transform='translate(0 0)' d='M7,1C6.4,1,6,1.4,6,2v4H2C1.4,6,1,6.4,1,7v1 c0,0.6,0.4,1,1,1h4v4c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1V9h4c0.6,0,1-0.4,1-1V7c0-0.6-0.4-1-1-1H9V2c0-0.6-0.4-1-1-1H7z'%3E%3C/path%3E%3C/svg%3E");
}
</style>
