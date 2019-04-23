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
    console.log(request)
    return request.data.route.distance
  },

  async autocomplete(street, postcode) {
    console.log(street, postcode)
    if (!postcode) throw Error('Bitte zuerst Postleizahl eingeben.')
    if (!street || street.length < 3) return
    const { data } = await axios.get(
      'https://api.openrouteservice.org/geocode/autocomplete',
      {
        params: {
          api_key: '5b3ce3597851110001cf624840afc87995d74264ab078793584fa381',
          text: `${street},${postcode}`,
          country: 'DE',
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
          country: 'DE',
          lang: 'DE',
          size: 1
        }
      }
    )
    console.log(data)
    if (data && data.features) {
      const match = data.features[0]
      const coordinates = [
        match.geometry.coordinates[0],
        match.geometry.coordinates[1]
      ]
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
      return {
        error: 'Keine Koordinaten für die angegebene Adresse gefunden.'
      }
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
