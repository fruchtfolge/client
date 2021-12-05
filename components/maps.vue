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
import {
  union
} from 'polygon-clipping'

export default {
  name: 'MapBox',
  data() {
    return {
      curYear: '',
      addPlots: false
    }
  },
  notifications: notifications,
  async mounted() {
    let settings
    try {
      settings = await this.$db.get('settings')
      this.curYear = settings.curYear
      // initialize map
      await this.createMap(settings)
      // initially draw plots, if available
      if (this.$store.curPlots) {
        this.curPlots = this.$store.curPlots
        // console.log(this.curPlots)
        this.drawPlots(this.curYear, this.curPlots)
      }
    } catch (e) {
      if (e.status === 404) {
        this.showAddressWarn()
        return $nuxt.$router.push({
          path: 'settings'
        })
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
      this.Draw.changeMode('direct_select', {
        featureId: plot._id
      })
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
    merge(inputs) {
      const output = {
        id: inputs[0].id,
        type: inputs[0].type,
        geometry: {
          coordinates: union(...inputs.map(i => i.geometry.coordinates)),
          type: 'MultiPolygon'
        },
        properties: inputs[0].properties
      }
      return output
    },
    createMap(settings) {
      return new Promise(resolve => {
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
        this.geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: false,
          localGeocoder: this.geocodePlots,
        })
        this.map.addControl(this.geocoder)
        this.geocoder.on('result', (r) => {
          // update sidebar to select plot accordingly
          if (r.result.bbox) return
          this.$bus.$emit('selectedPlot', r.result.id)
          // direct select plot in draw
          this.Draw.changeMode('direct_select', {
            featureId: r.result.id
          })
        })

        const that = this
        class HelloWorldControl {
          onAdd(map) {
            this._map = map;
            this._container = document.createElement('div');
            this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
            this._btn = document.createElement('button');
            this._btn.className = "mapbox-gl-draw_ctrl-draw-btn addIcon";
            this._btn.type = "button";
            this._btn["aria-label"] = "Schläge hinzufügen";
            this._btn.title = "Schläge hinzufügen";
            this._container.appendChild(this._btn)

            const layers = ["plots-germany", "plots-germany-crops"]
            this._btn.onclick = () => {
              that.addPlots = !that.addPlots
              if (that.addPlots) {
                this._btn.className = "mapbox-gl-draw_ctrl-draw-btn closeIcon";
                layers.forEach(layer => {
                  this._map.setLayoutProperty(layer, 'visibility', 'visible');
                })
              } else {
                this._btn.className = "mapbox-gl-draw_ctrl-draw-btn addIcon";
                layers.forEach(layer => {
                  this._map.setLayoutProperty(layer, 'visibility', 'none');
                })
              }
            }
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

        // return promise when map is done loading
        let hoveredStateId = null;
        this.map.on('mousemove', 'plots-germany', (e) => {
          if (e.features.length > 0) {
            if (hoveredStateId !== null) {
              this.map.setFeatureState({
                source: 'plot-shapes',
                sourceLayer: "plots_germany",
                id: hoveredStateId
              }, {
                hover: false
              });
            }
            hoveredStateId = e.features[0].id;

            this.map.setFeatureState({
              source: 'plot-shapes',
              sourceLayer: "plots_germany",
              id: hoveredStateId
            }, {
              hover: true
            });
          }
        });

        this.map.on('click', (e) => {
          if (!this.addPlots) return
          let features = this.map.queryRenderedFeatures(e.point)
          features = features.filter(f => f.source === "plot-shapes")

          let feature
          if (features[0]) {
            const source = features[0].source
            // make sure to return early when a Draw polygon (existing field)
            // is clicked
            if (source.includes('gl-draw')) return
            try {
              let featureData = this.map.querySourceFeatures("plot-shapes", {
                sourceLayer: "plots_germany",
                filter: ['==', 'area', features[0].properties.area]
              })

              // make sure the feature has the same id as the clicked one
              featureData = featureData.filter(f => f.id === features[0].id)

              if (Array.isArray(featureData)) {
                feature = this.merge(featureData)
              } else {
                feature = featureData
              }
              this.$emit('addPlot', {
                features: [feature]
              })
            } catch (e) {
              console.log(e)

              // clicked on a non-feature, fail silently
              return
            }
          }
        })
        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        this.map.on('mouseleave', 'plots-germany', () => {
          if (hoveredStateId !== null) {
            this.map.setFeatureState({
              source: 'plot-shapes',
              sourceLayer: "plots_germany",
              id: hoveredStateId
            }, {
              hover: false
            });
          }
          hoveredStateId = null;
        });

        this.map.on('load', () => {
          // add source for
          this.map.addSource('plot-shapes', {
            "url": "mapbox://toffi.plots-germany",
            "type": "vector"
          });

          this.map.addSource('plot-data', {
            "url": "mapbox://toffi.plots-germany-centroids",
            "type": "vector"
          });

          this.map.addLayer({
            "id": "plots-germany",
            "type": "fill",
            "source": "plot-shapes",
            "source-layer": "plots_germany",
            "minzoom": 10,
            "layout": {
              'visibility': 'none'
            },
            "paint": {
              "fill-color": "hsl(0, 0%, 100%)",
              "fill-outline-color": "hsl(0, 0%, 100%)",
              "fill-antialias": false,
              "fill-opacity": ["interpolate", ['linear'], ["zoom"],
                13,
                [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.6,
                  0
                ],
                14,
                [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.6,
                  0.4
                ]
              ]
            }
          }, "country-label")

          this.map.addLayer({
            "id": "plots-germany-crops",
            "type": "symbol",
            "source": "plot-data",
            "source-layer": "plots_germany_centroids",
            "minzoom": 10,
            "layout": {
              'visibility': 'none',
              "text-field": [
                "format",
                [
                  "number-format",
                  ["get", "area"],
                  {
                    "max-fraction-digits": 2
                  }
                ],
                " ha",
                {},
                "\n",
                {},
                "",
                {
                  "text-font": [
                    "literal",
                    ["DIN Offc Pro Italic"]
                  ],
                  "font-scale": 0.8
                },
                [
                  "case",
                  ["has", "name_2021"],
                  [
                    "concat",
                    "2021: ",
                    ["get", "name_2021"]
                  ],
                  ""
                ],
                {
                  "text-font": [
                    "literal",
                    ["DIN Offc Pro Italic"]
                  ],
                  "font-scale": 0.8
                }
              ],
              "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
              "text-size": 12
            },
            "paint": {
              "text-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                0,
                13,
                0,
                14,
                1
              ]
            }
          }, "country-label")

          resolve()
        })
      })
    },
    geocodePlots(query) {
      if (!this.curPlots) return null
      // search for plots that include the query string
      const filteredPlots = this.curPlots.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      // create CARMEN GeoJSON FC from the results
      // https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
      const results = filteredPlots.map(p => {
        p.geometry.text = p.name
        p.geometry.center = p.center
        p.geometry.place_name = p.name
        p.geometry.place_type = ['coordinate']
        return p.geometry
      })
      return results
    },
    drawPlots(year, plots) {
      try {
        // add plots as DRAW geometries
        plots.forEach(plot => {
          plot.geometry.properties._id = plot._id
          plot.geometry.id = plot._id
          this.Draw.add(plot.geometry)
          // geometries.push(plot.geometry)
        })
        // add names and plot sizes as GL layers
        const plotsSource = this.map.getSource('plots')
        if (plotsSource) {
          // this.map.removeLayer('plots-label')
          this.map.removeLayer('plots-label-prev-crop')
          this.map.removeSource('plots')
        }
        this.map.addSource('plots', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            properties: {},
            features: plots.map(p => {
              p.geometry.properties.name = p.name
              p.geometry.properties.size = p.size
              return p.geometry
            })
          }
        })

        this.map.addLayer({
          id: 'plots-label-prev-crop',
          type: 'symbol',
          source: 'plots',
          minzoom: 14,
          layout: {
            'text-field': ['format',
              ['number-format', ['get', 'size'], {
                'max-fraction-digits': 2
              }], ' ha', {}, // ['get', 'AREA_HA'], {}, // Use default formatting
              '\n', {},
              '', {
                'text-font': ['literal', ['DIN Offc Pro Italic']],
                'font-scale': 0.8
              },
              [
                'case',
                ['has', 'prevCrop'],
                ['get', 'prevCrop'], // vorfrucht wenn vorhanden
                ['get', 'name'] // sonst vorfrucht "gruppe"
              ],
              {
                'text-font': ['literal', ['DIN Offc Pro Italic']],
                'font-scale': 0.8
              }
            ],
            'text-font': [
              'DIN Offc Pro Medium',
              'Arial Unicode MS Bold'
            ],
            'text-size': 12
          },
          paint: {
            'text-color': '#ffffff',
          }
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
            this.Draw.changeMode('direct_select', {
              featureId: plotId
            })
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

.mapboxgl-ctrl-geocoder {
  border-radius: 0px;
  box-shadow: none;
  /* border: 1px solid #cccccc; */
  font-family: 'Inter', Helvetica, sans-serif;
}

.mapboxgl-ctrl-geocoder .suggestions {
  border-radius: 0px;
  font-family: 'Inter', Helvetica, sans-serif;
}

.mapboxgl-ctrl-group:not(:empty) {
  border-radius: 0px;
  border: 1px solid black;
  box-shadow: none;
}

.addIcon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15' height='15' width='15'%3E%3Ctitle%3Ehospital.svg%3C/title%3E%3Crect fill='none' x='0' y='0' width='15' height='15'%3E%3C/rect%3E%3Cpath fill='%23333' transform='translate(0 0)' d='M7,1C6.4,1,6,1.4,6,2v4H2C1.4,6,1,6.4,1,7v1 c0,0.6,0.4,1,1,1h4v4c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1V9h4c0.6,0,1-0.4,1-1V7c0-0.6-0.4-1-1-1H9V2c0-0.6-0.4-1-1-1H7z'%3E%3C/path%3E%3C/svg%3E");
}

.closeIcon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15' height='15' width='15'%3E%3Ctitle%3Ecross.svg%3C/title%3E%3Crect fill='none' x='0' y='0' width='15' height='15'%3E%3C/rect%3E%3Cpath fill='%23333' transform='translate(0 0)' d='M2.64,1.27L7.5,6.13l4.84-4.84C12.5114,1.1076,12.7497,1.0029,13,1c0.5523,0,1,0.4477,1,1 c0.0047,0.2478-0.093,0.4866-0.27,0.66L8.84,7.5l4.89,4.89c0.1648,0.1612,0.2615,0.3796,0.27,0.61c0,0.5523-0.4477,1-1,1 c-0.2577,0.0107-0.508-0.0873-0.69-0.27L7.5,8.87l-4.85,4.85C2.4793,13.8963,2.2453,13.9971,2,14c-0.5523,0-1-0.4477-1-1 c-0.0047-0.2478,0.093-0.4866,0.27-0.66L6.16,7.5L1.27,2.61C1.1052,2.4488,1.0085,2.2304,1,2c0-0.5523,0.4477-1,1-1 C2.2404,1.0029,2.4701,1.0998,2.64,1.27z'%3E%3C/path%3E%3C/svg%3E");
}
</style>
