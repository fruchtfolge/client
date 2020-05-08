<template lang="html">
  <div class="">
    <div class="address-label">
      Geben Sie im Eingabefeld 'Adresse' die Adresse Ihres Betriebes an.<br>
      Ziehen Sie falls nötig anschließend den Mittelpunkt der Karte auf Ihren Betrieb.
      <a href="#warum-muss-ich-meine-adresse-bei-der-registrierung-angeben" class="link">Wofür wird meine Adresse benötigt?</a>
    </div>
    <div id="address-map" class="address-map" />
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'

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
    coordsForward: {
      type: Array,
      required: false,
      default() {
        return []
      }
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
      style: 'mapbox://styles/mapbox/light-v10?optimize=true',
      // style: 'mapbox://styles/mapbox/light-v10?optimize=true',
      center: this.coords,
      zoom: 8,
      drageRotate: false
    })
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-left')

    const el = document.createElement('div')
    el.className = 'marker'

    this.marker = new mapboxgl.Marker(el)
      .setLngLat([7.685235, 51.574318])
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
  },
  destroyed() {
    this.map.remove()
  }
}
</script>

<style lang="css">
.address-map {
  width: 375px;
  height: 430px;
}
.address-label {
  width: 375px;
  font-family: Inter, sans-serif;
  font-size: 12px;
  margin-top: 45px;
  margin-bottom: 15px;
}
.marker {
  background-image: url('/icon.png');
  box-shadow: 0 0 0 2pt white;
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
