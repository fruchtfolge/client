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

  async forward(street, postcode) {
    const url = `http://open.mapquestapi.com/nominatim/v1/search.php?key=BvBLJHXPz5l9HthuTFRC9Nrt16F2yK7B&format=json&q=${street},${postcode}&addressdetails=1&limit=1`
    const results = await axios.get(url)
    console.log(results)
    if (results.data && results.data[0]) {
      const coordinates = [results.data[0].lon, results.data[0].lat]
      const stateDistrict = results.data[0].address.state_district
        ? results.data[0].address.state_district.split(' ')[1]
        : 'Deutschland'
      const town = results.data[0].address.city
        ? results.data[0].address.city
        : results.data[0].address.village
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
