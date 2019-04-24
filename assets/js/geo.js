import axios from 'axios'

export default {
  async distance(plot, home) {
    // mapquest uses lng/lat instead of lat/lng, so we have to reverse
    // the coordinates
    const start = [plot.center[1], plot.center[0]]
    const end = [home[1], home[0]]

    // request directions from mapqest
    const url = `https://open.mapquestapi.com/directions/v2/route?key=BvBLJHXPz5l9HthuTFRC9Nrt16F2yK7B&location&from=${start}&to=${end}&unit=k`
    const request = await axios.get(url)
    return request.data.route.distance
  },

  async autocomplete(street, postcode) {
    if (!postcode) throw Error('Bitte zuerst Postleizahl eingeben.')
    if (!street || street.length < 3) return
    const { data } = await axios.get(
      'https://api.openrouteservice.org/geocode/autocomplete',
      {
        params: {
          api_key: '5b3ce3597851110001cf624840afc87995d74264ab078793584fa381',
          text: `${street},${postcode}`,
          layers: 'address',
          'focus.point.lat': 51.0968582,
          'focus.point.lon': 5.9690268,
          size: 5,
          lang: 'DE'
        }
      }
    )
    if (data && data.features) {
      const match = data.features
      return match.map(o => o.properties.name)
    }
  },

  async forward(street, postcode) {
    const { data } = await axios.get(
      'https://api.openrouteservice.org/geocode/search/structured',
      {
        params: {
          api_key: '5b3ce3597851110001cf624840afc87995d74264ab078793584fa381',
          address: street,
          postalcode: postcode,
          'focus.point.lat': 51.0968582,
          'focus.point.lon': 5.9690268,
          lang: 'DE',
          size: 1
        }
      }
    )

    if (data && data.features) {
      const match = data.features[0]
      const coordinates = [
        match.geometry.coordinates[0],
        match.geometry.coordinates[1]
      ]
      if (coordinates[0] === 0)
        throw Error('Keine Koordinaten für die angegebene Adresse gefunden.')

      const stateDistrict = match.properties.macrocounty
        ? match.properties.macrocounty.split(' ')[0]
        : 'Deutschland'
      const town = match.properties.locality
      return {
        home: coordinates,
        state_district: stateDistrict,
        city: town
      }
    } else {
      throw Error('Kartenservice nicht erreichbar.')
    }
  },

  async reverse(plot) {
    const url = `https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=${
      plot.center[1]
    }%2C${
      plot.center[0]
    }%2C250&mode=retrieveAddresses&maxresults=1&&app_id=Tf6IBd55mIYG3ylNRvzg&app_code=LSWYmWINcFaal_f1q9LtUw`
    const { data } = await axios.get(url)
    if (data.Response.View[0].Result[0].Location.Address.District) {
      return data.Response.View[0].Result[0].Location.Address.District
    } else if (data.Response.View[0].Result[0].Location.Address.City) {
      return data.Response.View[0].Result[0].Location.Address.City
    } else {
      return data.Response.View[0].Result[0].Location.Address.Street
    }
  }
}
