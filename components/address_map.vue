<template lang="html">
  <div class="">
    <div v-if="showText" class="address-label">
      Geben Sie im Eingabefeld 'Adresse' die Adresse Ihres Betriebes an.<br>
      Ziehen Sie falls nötig anschließend den Mittelpunkt der Karte auf Ihren Betrieb.
      <a href="#warum-muss-ich-meine-adresse-bei-der-registrierung-angeben" class="link">Wofür wird meine Adresse benötigt?</a>
    </div>
    <div id="address-map" :style="mapStyle" />
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

export default {
  props: {
    suggestions: {
      type: Array,
      required: false,
      default() {
        return []
      }
    },
    address: {
      type: String,
      required: false,
      default() {
        return ''
      }
    },
    includeGeocoder: {
      type: Boolean,
      required: false,
      default() {
        return false
      }
    },
    coordsForward: {
      type: Array,
      required: false,
      default() {
        return []
      }
    },
    height: {
      type: String,
      default: '430px'
    },
    width: {
      type: String,
      default: '375px'
    },
    showText: {
      type: Boolean,
      required: false,
      default: true
    },
    zoom: {
      type: Number,
      required: false,
      default: 8
    }
  },
  computed: {
    mapStyle() {
      return {
        width: this.width,
        height: this.height
      };
    }
  },
  data() {
    return {
      coords: []
    }
  },
  watch: {
    address(newValue, oldValue) {
      if (!newValue.length || !this.suggestions.length) return
      this.suggestions.forEach(address => {
        if (address.properties.label === newValue && address.geometry) {
          this.map.setCenter(address.geometry.coordinates)
          this.map.setZoom(15)
          this.marker.setLngLat(address.geometry.coordinates)
        }
      })
    },
    coordsForward(newValue, oldValue) {
      if (newValue === oldValue) return
      this.coords = newValue
      this.map.setCenter(newValue)
      this.map.setZoom(15)
      this.marker.setLngLat(newValue)
    },
    coords(newValue, oldValue) {
      if (newValue === oldValue || newValue === this.coordsForward) return
      this.$emit('updateCoords', newValue)
    }
  },
  mounted() {
    this.coords = this.coordsForward

    mapboxgl.accessToken =
      'pk.eyJ1IjoidG9mZmkiLCJhIjoiY2l3cXRnNHplMDAxcTJ6cWY1YWp5djBtOSJ9.mBYmcCSgNdaRJ1qoHW5KSQ'

    // init the map
    this.map = new mapboxgl.Map({
      container: 'address-map',
      style: 'mapbox://styles/mapbox/satellite-streets-v11?optimize=true',
      // style: 'mapbox://styles/mapbox/light-v10?optimize=true',
      center: this.coords,
      zoom: this.zoom,
      drageRotate: false
    })
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-left')
    if (this.includeGeocoder) {
      this.map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl
      }))
    }


    const el = document.createElement('div')
    el.className = 'marker'

    this.marker = new mapboxgl.Marker(el)
      .setLngLat(this.coords)
      .addTo(this.map)

    this.map.on('movestart', e => {
      this.coords = this.map.getCenter()
      this.marker.setLngLat(this.coords)
    })

    this.map.on('move', e => {
      this.coords = this.map.getCenter()
      this.marker.setLngLat(this.coords)
    })

    this.map.on('moveend', e => {
      this.coords = this.map.getCenter()
      this.marker.setLngLat(this.coords)
    })

    this.$bus.$on('resize', () => {
      setTimeout(() => {
        this.map.resize()
      }, 500)
    })
  },
  destroyed() {
    this.$bus.$off('resize')
    this.map.remove()
  }
}
</script>

<style lang="css">
.address-label {
  width: 375px;
  font-family: Inter, sans-serif;
  font-size: 12px;
  margin-top: 45px;
  margin-bottom: 15px;
}
</style>
