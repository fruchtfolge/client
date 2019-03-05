<template>
  <div class='zap-slideout' v-bind:class='{ isOpen: isOpen }'>
    <div class="zap-slideout-opener"
           @click="toggle">{{openerText}}</div>
  </div>
</template>
<script>
export default {
  data: () => ({
    openerText: 'Open',
    isOpen: false,
    menu: ['Home', 'Felder', 'Kulturen', 'Nebenbedingungen', 'Ergebnisse']
  }),
  methods: {
    open() {
      this.openerText = 'Close';
      this.isOpen = true;
      console.log(this.isOpen)
    },
    close() {
      this.openerText = 'Open';
      this.isOpen = false;
    },
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }
}
</script>
<style>
.navbar {
  position: fixed;
  background-color: rgb(233, 233, 233);
  left: 0px;
  width: 300px;
  height: calc(100vh - 60px);
  top: 60px;
  }
  
.zap-slideout {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #111;
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
}

.zap-slideout-opener {
  position: absolute;
  top: 80px;
  left: 100%;
  margin-left: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #fff;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}

</style>
