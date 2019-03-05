import { centerOfMass } from '@turf/turf'
import mapquest from './mapquest'
import { soilType, sqr } from 'bgr-apis'
import Plot from '~/constructors/Plot'


export default async function createPlot(properties, settings) {
  // get all required information to create a new plot
  //console.log(settings)
  if (!properties.year) {
    properties.year = settings.curYear
  }
  if (!properties.scenario) {
    properties.scenario = settings.curScenario
  }
  // save centroid of plot to polygon
  properties.center = centerOfMass(properties.geometry).geometry.coordinates
  // create a promise array so that requests are
  // carried out in parallel
  const requests = await Promise.all([
    sqr(properties.geometry),
    soilType(properties.geometry),
    mapquest.reverse(properties),
    mapquest.distance(properties, settings.home)
  ]).catch(err => {
    console.log(err)
  })

  // fill the properties with the values acquired
  properties.quality = requests[0]
  properties.soilType = requests[1]
  properties.region = requests[2]
  properties.distance = requests[3]

  // create the plot
  const plot = new Plot(properties)
  return plot
}
