<template>
  <div class="results-container">
    <div id="results-map" />
    <div class="legend">
      <h4>Kulturen</h4>
      <div v-for="crop in shares" :key="`layer_${crop.name}`">
        <span :style="{ backgroundColor: crop.backgroundColor}" />
        {{ crop.name }}
      </div>
      <div v-if="duev2020">
        <h4 style="margin-top: 10px;">
          Sonstige
        </h4>
        <span style="backgroundColor: #FEE8D7;" />
        Belastete Gebiete durch Nitrat (§ 13 DüV)
      </div>
    </div>
  </div>
</template>
<script>
import mapboxgl from 'mapbox-gl'
import { featureCollection, bbox } from '@turf/turf'

export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    shares: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    duev2020: false
  }),
  watch: {
    shares(newShares, oldShares) {
      this.removePlots(oldShares)
      this.drawPlots()
    }
  },
  async mounted() {
    const settings = await this.$db.get('settings')
    this.duev2020 = settings.duev2020
    this.createMap(settings)
    this.resultsMap.on('load', () => {
      // if (this.duev2020) this.addDuevEndangered()
      this.drawPlots()
    })
    this.$bus.$on('resize', () => {
      setTimeout(() => {
        this.resultsMap.resize()
      }, 500)
    })
  },
  methods: {
    createMap(settings) {
      mapboxgl.accessToken =
        'pk.eyJ1IjoidG9mZmkiLCJhIjoiY2l3cXRnNHplMDAxcTJ6cWY1YWp5djBtOSJ9.mBYmcCSgNdaRJ1qoHW5KSQ'

      // init the map
      this.resultsMap = new mapboxgl.Map({
        container: 'results-map',
        style: 'mapbox://styles/mapbox/light-v10?optimize=true',
        center: settings.home || [7.685235, 51.574318],
        zoom: settings.home ? 14 : 8
      })
      /*
      this.resultsMap.addControl(
        new mapboxgl.NavigationControl(),
        'bottom-left'
      )
      */
    },
    drawPlots() {
      // create a feacture collection out of all plots, add currently
      // selected crop to geometry properties, also a description (plot + crops)
      // and the center of the plot in order to show a popup
      let fc = this.data.map(plot => {
        plot.geometry.properties.crop = plot.selectedCrop
        plot.geometry.properties.center = plot.center
        plot.geometry.properties.description = `${plot.name}: ${
          plot.selectedCrop
        }`
        return plot.geometry
      })
      fc = featureCollection(fc)

      this.resultsMap.addSource('plots', {
        type: 'geojson',
        data: fc
      })

      // add a layer for each crop
      this.shares.forEach(crop => {
        this.resultsMap.addLayer({
          id: crop.name,
          type: 'fill',
          source: 'plots',
          paint: {
            'fill-color': crop.backgroundColor,
            'fill-opacity': 1
          },
          filter: ['==', 'crop', crop.name]
        })
        // add a popup on hover for each plot
        this.addPopUp(crop.name)
      })
      // fit the map to the extent of all plots
      this.resultsMap.fitBounds(bbox(fc), { duration: 0, padding: 20 })
    },
    addPopUp(crop) {
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })
      this.resultsMap.on('mouseenter', crop, e => {
        // Change the cursor style as a UI indicator.
        this.resultsMap.getCanvas().style.cursor = 'pointer'

        const coordinates = JSON.parse(e.features[0].properties.center)
        const description = e.features[0].properties.description
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(this.resultsMap)
      })

      this.resultsMap.on('mouseleave', crop, () => {
        this.resultsMap.getCanvas().style.cursor = ''
        popup.remove()
      })
    },
    addDuevEndangered() {
      this.resultsMap.addLayer({
        id: 'rote-gebiete',
        type: 'raster',
        source: {
          type: 'raster',
          tiles: [
            `${
              process.env.baseUrl
            }maps/duev?BBOX={bbox-epsg-3857}&FORMAT=image/png&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&CRS=EPSG:25832&TRANSPARENT=TRUE&width=256&height=256&LAYERS=belastete_gebiete_nitrat`
          ],
          tileSize: 256
        },
        paint: {}
      })
    },
    removePlots(layers) {
      layers.forEach(crop => {
        this.resultsMap.removeLayer(crop.name)
      })
      this.resultsMap.removeSource('plots')
    }
  }
}
</script>
<style lang="css" scoped>
.results-container {
  width: 100%;
  height: calc(60vh - 60px);
  position: relative;
  margin-top: 50px;
  margin-bottom: -50px;
}

#results-map {
  width: 100%;
  height: 100%;
}

.legend {
  background-color: #fff;
  border-radius: 3px;
  top: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.10);
  font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  padding: 10px;
  position: absolute;
  left: 10px;
  z-index: 1;
}
 
.legend h4 {
  margin: 0 0 10px;
}
 
.legend div span {
  border-radius: 50%;
  display: inline-block;
  height: 10px;
  margin-right: 5px;
  width: 10px;
}

</style>
