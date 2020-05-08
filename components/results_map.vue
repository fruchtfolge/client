<template>
  <div class="results-container">
    <div id="results-map" />
    <div class="legend">
      <h4><b>{{ selection }}</b></h4>
      <div v-for="elem in iteratee" :key="`layer_${elem.name}`" class="layer">
        <span :style="{ backgroundColor: elem.backgroundColor}" />
        {{ elem.name }}
      </div>
      <div v-if="duev2020">
        <h4 style="margin-top: 10px;">
          <b>Sonstige</b>
        </h4>
        <div class="layer">
          <span style="backgroundColor: #FEE8D7;" />
          Belastete Gebiete durch Nitrat (§ 13 DüV)
        </div>
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
    },
    selection: {
      type: String,
      required: true
    }
  },
  data: () => ({
    duev2020: false,
    curLayers: [],
    iteratee: []
  }),
  watch: {
    shares(newShares, oldShares) {
      this.removePlots()
      this.drawPlots()
    },
    selection() {
      this.removePlots()
      this.drawPlots()
    }
  },
  destroyed() {
    this.resultsMap.remove()
  },
  async mounted() {
    const settings = await this.$db.get('settings')
    this.duev2020 = settings.duev2020
    this.createMap(settings)
    this.resultsMap.on('load', () => {
      if (this.duev2020) this.addDuevEndangered()
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
      try {
        if (!this.resultsMap) return
        // create a feacture collection out of all plots, add currently
        // selected crop to geometry properties, also a description (plot + crops)
        // and the center of the plot in order to show a popup
        let fc = this.data.map(plot => {
          plot.geometry.properties.center = plot.center
          if (this.selection === 'Org. Düngung') {
            plot.geometry.properties.elem = `${Number(
              plot.selectedOption.manAmount
            ) + Number(plot.selectedOption.solidAmount)}m³`
          } else {
            plot.geometry.properties.elem = plot.selectedCrop
          }
          plot.geometry.properties.description = `${plot.name}: ${
            plot.selectedCrop
          }, ${Number(plot.selectedOption.manAmount) +
            Number(plot.selectedOption.solidAmount)}m³`
          return plot.geometry
        })
        fc = featureCollection(fc)

        this.resultsMap.addSource('plots', {
          type: 'geojson',
          data: fc
        })

        // add a layer for each crop / man amount
        if (this.selection === 'Org. Düngung') {
          // get unique manure values
          const manColors = {
            '0': '#fff',
            '5': '#eef5f2',
            '10': '#eef5f2',
            '15': '#deebe5',
            '20': '#cde1d8',
            '25': '#bcd7cc',
            '30': '#abccbf',
            '40': '#9bc2b2',
            '50': '#8ab8a5',
            '60': '#5a8271'
          }
          this.iteratee = [
            ...new Set(
              this.data.map(
                p =>
                  Number(p.selectedOption.manAmount) +
                  Number(p.selectedOption.solidAmount)
              )
            )
          ]
            .sort((a, b) => a - b)
            .map((a, i) => {
              return {
                name: a + 'm³',
                backgroundColor: manColors[a]
              }
            })
        } else {
          this.iteratee = this.shares
        }
        this.iteratee.forEach(elem => {
          this.curLayers.push(elem.name)
          this.curLayers.push(elem.name + '_line')

          this.resultsMap.addLayer({
            id: elem.name,
            type: 'fill',
            source: 'plots',
            paint: {
              'fill-color': elem.backgroundColor,
              'fill-opacity': 1
            },
            filter: ['==', 'elem', elem.name]
          })
          // also add an outline
          this.resultsMap.addLayer({
            id: elem.name + '_line',
            type: 'line',
            source: 'plots',
            minzoom: 12,
            paint: {
              'line-color': 'white',
              'line-width': 2
            },
            filter: ['==', 'elem', elem.name]
          })
          // add a popup on hover for each plot
          this.addPopUp(elem.name)
        })

        // fit the map to the extent of all plots
        this.resultsMap.fitBounds(bbox(fc), { duration: 0, padding: 20 })
      } catch (e) {
        console.log(e)
      }
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
      this.resultsMap.addLayer(
        {
          id: 'rote-gebiete',
          type: 'raster',
          source: {
            type: 'raster',
            tiles: [
              `${
                process.env.baseUrl
              }maps/duev?BBOX={bbox-epsg-3857}&FORMAT=image/png&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&CRS=EPSG:25832&TRANSPARENT=TRUE&width=256&height=256&LAYERS=belastete_gebiete_nitrat_2020`
            ],
            tileSize: 256
          },
          paint: {}
        },
        this.curLayers[0]
      )
    },
    removePlots() {
      try {
        this.curLayers.forEach(layer => {
          this.resultsMap.removeLayer(layer)
        })
        this.curLayers = []
        this.resultsMap.removeSource('plots')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style lang="css" scoped>
.results-container {
  width: 100%;
  height: calc(60vh - 60px);
  position: relative;
  margin-bottom: -50px;
}

#results-map {
  width: 100%;
  height: 100%;
}

.legend {
  /*border-radius: 3px;*/
  /*box-shadow: 0 1px 2px rgba(0,0,0,0.10);*/
  background-color: #fff;
  top: 10px;
  font: 14px Inter, Arial, Helvetica, sans-serif;
  padding: 15px;
  position: absolute;
  left: 10px;
  z-index: 1;
}

.legend h4 {
  margin: 0 0 10px;
}

.legend div span {
  /* border-radius: 50%; */
  display: inline-block;
  height: 15px;
  margin-right: 10px;
  width: 15px;
}

.layer {
  display: flex;
  align-items: center;
  line-height: 25px;
}
</style>
