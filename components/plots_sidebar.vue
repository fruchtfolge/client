<template>
  <div class="plotsSidebar">
    <div class="content-pos">
      <h1 class="sumHa">GESAMT {{ totalHa }} ha</h1>
      <div v-if="regions" v-for="(region, n) in regions" :key='n'>
        <div class="container" @click="expand(region[0].region)">
          <h2 class="regionText"> {{ region[0].region.toUpperCase() }}</h2>
          <div class="arrow" v-bind:class="{ rotate: shown[region[0].region]}"></div>
        </div>
        <transition name="expand"
        v-on:before-enter="beforeEnter" v-on:enter="enter"
        v-on:before-leave="beforeLeave" v-on:leave="leave">
          <div class="body" v-show="shown[region[0].region]">
            <p v-for="(plot, m) in region" :key='m'
            @click="flyTo(plot)"
            class="plotsText"
            v-bind:class="{ active: isClicked(plot)}"> {{plot.name}} ({{plot.size}} ha) </p>
          </div>
        </transition>
      </div>
      <div v-else>
        <p class="regionText">Klicken Sie auf den Rechteck-Button in der Karte links-unten um ein neues Feld eizuzeichnen.</p>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data () {
    return {
      regions: null,
      totalHa: 0,
      curPlot: '',
      shown: {}
    }
  },
  async created() {
    // create initial state
    this.updateState()
    this.$bus.$on('changeCurrents', this.updateState)
    // when a plot is clicked upon on the map, open the region and select a plot in the sidebar
    this.$bus.$on('selectedPlot', id => {
      return this.activatePlot(id)
    })
  },
  destroyed() {
    this.$bus.$off('changeCurrents')
  },
  methods: {
    beforeEnter(el) {
      el.style.height = '0px';
    },
    enter(el) {
      el.style.height = el.scrollHeight + 'px';
    },
    beforeLeave(el) {
      el.style.height = el.scrollHeight + 'px';
    },
    leave(el) {
      el.style.height = '0px';
    },
    expand(region) {
      if (!this.shown[region]) {
        this.shown[region] = true
      } else {
        this.shown[region] = false
      }
    },
    calcTotal() {
      const total = _.sumBy(this.plots, (plot) => { return plot.size })
      if (total) {
        return Number(total).toFixed(2)
      } else {
        return 0
      }
    },
    updateState() {
      this.plots = this.$store.curPlots
      this.regions = _.groupBy(this.plots, 'region')
      // initially collapse all regions, if they aren't opended yet
      Object.keys(this.regions).forEach((region) => {
        let shown = false
        if (this.shown[region]) shown = true
        this.$set(this.shown,region,shown)
      })
      // update ha count
      this.totalHa = this.calcTotal()
    },
    flyTo(plot) {
      this.curPlot = plot
      this.$bus.$emit('flyTo', plot)
    },
    isClicked(plot) {
      return plot === this.curPlot
    },
    activatePlot(id) {
      if (!this.plots) return
      const plot = this.plots.filter(o => {return o._id === id})
      if (!plot || !plot[0] || !plot[0].region) return
      this.shown[plot[0].region] = true
      this.curPlot = plot[0]
    }
  }
}
</script>
<style scoped="true">
.plotsSidebar {
  position: fixed;
  float: right;
  padding-top: 20px;
  padding-right: 20px;
  overflow-y: scroll;
  top: 60px;
  right: 0px;
  width: 275px;
  cursor: default;
  height: calc(100vh - 80px);
  background: #ececec;
  z-index: 94;
}

.content-pos {
  padding-bottom: 50px;
}

.container {
  width: 100%;
  display: inline-flex;
  align-items: center;
}

.container:hover:not(.active) {
  background-color: rgba(0, 0, 0, .02);
}

.arrow {
  width: 24px;
  height: 24px;
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='#444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
  background-position: 100% 100%;
  background-repeat: no-repeat;
  transform: rotate(0deg);
  transition-duration: .5s;
}

.arrow.rotate {
  transform: rotate(180deg);
  transition: .5s;
}

.expand-enter-active, .expand-leave-active {
  transition: height .5s ease-in-out;
  overflow: hidden;
}

.expand-enter, .expand-leave-to {
  height: 0;
}

.body p:hover:not(.active) {
  background-color: rgba(0, 0, 0, .02);
}


.active {
  background-color: rgba(0, 0, 0, .05);
}

.plotsText {
  font-size: 16px;
  letter-spacing: 0.1em;
  padding-left: 45px;
  padding-top: 5px;
  padding-bottom: 5px;
  margin: 0px;
}

.regionText {
  font-size: 18px;
  letter-spacing: 0.2em;
  margin-bottom: 5px;
  margin-top: 5px;
  margin-left: 30px;
  font-weight: normal;
}

.sumHa {
  font-size: 18px;
  letter-spacing: 0.2em;
  margin-left: 30px;
  margin-bottom: 40px;
  font-weight: normal;
}


.plotInput {
  font-family: 'open_sanscondensed_light', sans-serif;
  font-size: 16px;
  letter-spacing: 0.1em;
}

</style>
