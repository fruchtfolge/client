<template>
  <div class="cropsSidebar">
    <div v-if="cropsAvailable">
      <div v-for="(curCrops, i) in displayGroups" :key="i">
        <div class="container" @click="expand(curCrops[0].displayGroup)">
          <h2 class="regionText">
            {{ curCrops[0].displayGroup.toUpperCase() }}
          </h2>
          <div class="arrow" :class="{ rotate: shown[curCrops[0].displayGroup]}" />
        </div>
        <transition
          name="expand"
          @before-enter="beforeEnter"
          @enter="enter"
          @before-leave="beforeLeave"
          @leave="leave"
        >
          <div v-show="shown[curCrops[0].displayGroup]" class="body">
            <p
              v-for="(crop, n) of curCrops"
              :key="n"
              class="cropsText"
              :class="{ active: isClicked(crop)}"
              @click="changeCrop(crop)"
            >
              {{ crop.name }}
            </p>
          </div>
        </transition>
      </div>
    </div>
    <div v-else class="helpText">
      Klicken Sie auf den "Hinzufügen" Button um eine neue Kultur für das aktuelle Planungsjahr und Szenario hinzuzufügen
    </div>
    <div style="text-align: center; margin-top: 40px;margin-bottom: 40px;">
      <button class="button" @click="addCrop">
        HINZUFÜGEN
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    crops: {
      type: Array,
      default: undefined,
      required: false
    },
    selectedCrop: {
      type: Object,
      default: undefined,
      required: false
    }
  },
  data() {
    return {
      shown: {}
    }
  },
  computed: {
    cropsAvailable() {
      if (this.crops && this.crops.length > 0) {
        return true
      } else {
        return false
      }
    },
    displayGroups() {
      return _.groupBy(this.crops, 'displayGroup')
    },
    cropGroups() {
      return _.groupBy(this.crops, 'cropGroup')
    }
  },
  watch: {
    crops() {
      this.updateState()
    }
  },
  created() {
    this.updateState()
  },
  methods: {
    beforeEnter(el) {
      el.style.height = '0px'
    },
    enter(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    beforeLeave(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    leave(el) {
      el.style.height = '0px'
    },
    expand(displayGroup) {
      if (!this.shown[displayGroup]) {
        this.shown[displayGroup] = true
      } else {
        this.shown[displayGroup] = false
      }
    },
    addCrop() {
      this.$emit('showAddCrop')
    },
    updateState() {
      // initially collapse all regions, if they aren't opended yet
      Object.keys(this.displayGroups).forEach(group => {
        const shown = true
        this.$set(this.shown, group, shown)
      })
    },
    isClicked(crop) {
      return crop.name === this.selectedCrop.name
    },
    changeCrop(crop) {
      this.$emit('changeCrop', crop)
    }
  }
}
</script>
<style>
.cropsSidebar {
  position: fixed;
  padding-top: 20px;
  overflow-y: scroll;
  top: 60px;
  right: 0px;
  width: 275px;
  cursor: default;
  height: calc(100vh - 70px);
  background: #ececec;
  z-index: 94;
}

.cropCollaps {
  background: url('data:image/svg+xml,%3Csvg%20width%3D%2724%27%20height%3D%2724%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%20%3Cg%3E%20%3Ctitle%3Ebackground%3C%2Ftitle%3E%20%3Crect%20fill%3D%27none%27%20id%3D%27canvas_background%27%20height%3D%27402%27%20width%3D%27582%27%20y%3D%27-1%27%20x%3D%27-1%27%2F%3E%20%3C%2Fg%3E%20%3Cg%3E%20%3Ctitle%3ELayer%201%3C%2Ftitle%3E%20%3Cpath%20transform%3D%27rotate(-180%2012%2C11.531000137329102)%20%27%20id%3D%27svg_1%27%20d%3D%27m7.406%2C7.828l4.594%2C4.594l4.594%2C-4.594l1.406%2C1.406l-6%2C6l-6%2C-6l1.406%2C-1.406z%27%20fill%3D%27%23444%27%2F%3E%20%3C%2Fg%3E%20%3C%2Fsvg%3E');
  background-position: 100% 50%;
  background-repeat: no-repeat;
}

.expand {
  height: 0;
  overflow: hidden;
  transition: height 0.8s ease;
}

.geclickt {
  background-color: #e0e0e0;
}

.cropsText {
  font-size: 14px;
  padding-left: 45px;
  padding-top: 5px;
  padding-bottom: 5px;
  margin: 0px;
  font-family: 'Open Sans';
  font-weight: 300;
}

.groupText {
  font-size: 18px;
  letter-spacing: 0.2em;
  margin-bottom: 5px;
  margin-top: 5px;
  margin-left: 30px;
  font-weight: normal;
}

.helpText {
  padding-left: 20px;
  padding-right: 20px;
}

.expand {
  height: 0;
  overflow: hidden;
  transition: height 0.8s ease;
}

.cropInput {
  font-family: 'open_sanscondensed_light', sans-serif;
  font-size: 16px;
  letter-spacing: 0.1em;
}

/*
.addCrop {
  padding: 0px;
  margin-top: 20px;
  margin-bottom: 20px;
  position: relative;
  left: 50%;
  margin-left: -16.5px;
  margin-bottom: 15px;
  width: 33px;
  height: 33px;
  background: transparent;
  border: none;
  background-color: grey;
  -webkit-mask: url(~assets/img/add.svg), none;
  -webkit-mask-size: cover;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center center;
}
*/

.container {
  width: 100%;
  display: inline-flex;
  align-items: center;
}

.container:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.02);
}

.arrow {
  width: 24px;
  height: 24px;
  background: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
  background-position: 100% 100%;
  background-repeat: no-repeat;
  transform: rotate(0deg);
  transition-duration: 0.5s;
}

.arrow.rotate {
  transform: rotate(180deg);
  transition: 0.5s;
}

.expand-enter-active,
.expand-leave-active {
  transition: height 0.5s ease-in-out;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}

.body p:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.02);
}

.active {
  background-color: rgba(0, 0, 0, 0.05);
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
</style>
