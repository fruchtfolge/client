export default {
  displayControlsDefault: false,
  controls: {
    polygon: true,
    combine_features: true,
    trash: true
  },
  styles: [
    // ACTIVE (being drawn)
    // line stroke
    {
      'id': 'gl-draw-line',
      'type': 'line',
      'filter': ['all', ['==', '$type', 'LineString'],
        ['!=', 'mode', 'static']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#ffffff',
        'line-dasharray': [0.2, 2],
        'line-width': 2
      }
    },
    // polygon fill
    {
      'id': 'gl-draw-polygon-fill',
      'type': 'fill',
      'filter': ['all', ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'fill-color': '#ffffff',
        'fill-outline-color': '#ffffff',
        'fill-opacity': 0
      }
    },
    // polygon outline stroke
    // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
    {
      'id': 'gl-draw-polygon-stroke-active',
      'type': 'line',
      'filter': ['all', ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#ffffff',
        // 'line-dasharray': [0.2, 2],
        'line-width': 2
      }
    },
    // vertex point halos
    {
      'id': 'gl-draw-polygon-and-line-vertex-halo-active',
      'type': 'circle',
      'filter': ['all', ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'circle-radius': 8,
        'circle-color': '#FFF'
      }
    },
    // vertex points
    {
      'id': 'gl-draw-polygon-and-line-vertex-active',
      'type': 'circle',
      'filter': ['all', ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#79ae98'
      }
    },
    // midpoints
    {
      'id': 'gl-draw-polygon-and-line-midpoint-active',
      'type': 'circle',
      'filter': ['all', ['==', 'meta', 'midpoint'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'circle-radius': 3,
        'circle-color': '#ffffff'
      }
    },

    // INACTIVE (static, already drawn)
    // line stroke
    {
      'id': 'gl-draw-line-static',
      'type': 'line',
      'filter': ['all', ['==', '$type', 'LineString'],
        ['==', 'mode', 'static']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#ffffff',
        'line-width': 3
      }
    },
    // polygon fill
    {
      'id': 'gl-draw-polygon-fill-static',
      'type': 'fill',
      'filter': ['all', ['==', '$type', 'Polygon'],
        ['==', 'mode', 'static']
      ],
      'paint': {
        'fill-color': '#ffffff',
        'fill-outline-color': '#ffffff',
        'fill-opacity': 0.05
      }
    },
    // polygon outline
    {
      'id': 'gl-draw-polygon-stroke-static',
      'type': 'line',
      'filter': ['all', ['==', '$type', 'Polygon'],
        ['==', 'mode', 'static']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#ffffff',
        'line-width': 3
      }
    }
  ]
}
