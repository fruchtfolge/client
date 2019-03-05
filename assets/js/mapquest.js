import axios from 'axios'

export default {
  async distance(plot, home) {
    // mapquest uses lng/lat instead of lat/lng, so we have to reverse
    // the coordinates
    const start = [plot.center[1], plot.center[0]]
    const end = [home[1],home[0]]

    // request directions from mapqest
    const url = `https://open.mapquestapi.com/directions/v2/route?key=eoEN8KRKeFAMe9JR8UG53yw5Gh3XU9Ex&location&from=${start}&to=${end}&unit=k`
    const request = await axios.get(url)
    console.log(request)
    return request.data.route.distance
  },

  async forward(street, postcode, city) {
    const url = `http://open.mapquestapi.com/nominatim/v1/search.php?key=eoEN8KRKeFAMe9JR8UG53yw5Gh3XU9Ex&format=json&q=${street},${postcode},${city}&addressdetails=1&limit=1`
    const results = await axios.get(url)
    console.log(results)
    const coordinates = [results.data[0].lon, results.data[0].lat]
    const state_district = results.data[0].address.state_district.split(' ')[1]

    return {
      home: coordinates,
      state_district: state_district
    }
  },

  async reverse(plot) {
    const url = `https://open.mapquestapi.com/geocoding/v1/reverse?key=eoEN8KRKeFAMe9JR8UG53yw5Gh3XU9Ex&location=${plot.center[1]},${plot.center[0]}`
    const request = await axios.get(url)
    console.log(request)
    if (request.data.results[0].locations[0].adminArea6) {
      return request.data.results[0].locations[0].adminArea6
      request.data.results[0].locations[0].adminArea5
    } else if (request.data.results[0].locations[0].adminArea5){
      return request.data.results[0].locations[0].adminArea5
    } else {
      return request.data.results[0].locations[0].street
    }
  }

}
