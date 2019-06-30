const path = require('path')
const webpack = require('webpack')
const pkg = require('./package')

const features = [
  'fetch',
  'Object.entries',
  'IntersectionObserver',
  'Array.prototype.find',
  'EventSource',
  'Object.assign',
  'Array.prototype.fill'
].join('%2C')

module.exports = {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: 'Fruchtfolge',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, user-scalable=no, initial-scale=1'
      },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    script: [
      {
        src: `https://polyfill.io/v3/polyfill.min.js?features=${features}`,
        body: true
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      },
      {
        rel: 'stylesheet',
        href: 'https://api.tiles.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.css'
      },
      {
        rel: 'stylesheet',
        href:
          'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.0.4/mapbox-gl-draw.css'
      },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300|Open+Sans:300,400,600,700'
      }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: {
    color: '#79ae98',
    height: '5px'
  },

  /*
  ** Global CSS
  */
  css: ['@/assets/css/global.css'],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: ['~/plugins/vue-pouch-db', '~/plugins/vue-notifications'],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/google-analytics'
  ],
  googleAnalytics: {
    id: 'UA-142985518-1'
  },
  /*
  ** Axios module configuration
  */
  axios: {},

  /*
  ** API base url, can be changed for debugging
  */
  env: {
    baseUrl: 'http://fruchtfolge.agp.uni-bonn.de/api/'
    // baseUrl: 'http://localhost:3001/'
  },

  router: {
    middleware: 'auth'
  },
  /*
  ** Build configuration
  */
  build: {
    transpile: ['mini-toastr'],
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      config.node = {
        fs: 'empty'
      }

      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      const alias = (config.resolve.alias = config.resolve.alias || {})
      alias['@mapbox/mapbox-gl-draw'] = path.resolve(
        __dirname,
        'node_modules/@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js'
      )

      const vueLoader = config.module.rules.find(r => r.loader === 'vue-loader')
      vueLoader.options.transformToRequire = {
        video: 'poster',
        source: 'src'
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        _: 'lodash'
      })
    ]
  }
}
