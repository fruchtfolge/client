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
    <div style="text-align: center; margin-top: 40px;">
      <button @click="addCrop">
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
  background: url("data:image/svg+xml;utf8,<svg width='24' height='24' xmlns='http://www.w3.org/2000/svg'> <g> <title>background</title> <rect fill='none' id='canvas_background' height='402' width='582' y='-1' x='-1'/> </g> <g> <title>Layer 1</title> <path transform='rotate(-180 12,11.531000137329102) ' id='svg_1' d='m7.406,7.828l4.594,4.594l4.594,-4.594l1.406,1.406l-6,6l-6,-6l1.406,-1.406z' fill='#444'/> </g> </svg>");
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
  font-size: 16px;
  letter-spacing: 0.1em;
  padding-left: 45px;
  padding-top: 5px;
  padding-bottom: 5px;
  margin: 0px;
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
  background: url("data:image/svg+xml;utf8,<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24' viewBox='0 0 24 24'><path fill='%23444' d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'></path></svg>");
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
