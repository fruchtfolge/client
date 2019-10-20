<template lang="html">
  <div v-on-clickaway="hide" @click="toggle">
    <div class="dropdown">
      Aktionen
    </div>
    <div v-show="clicked" class="dropdown-menu">
      <div class="dropdown-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'

export default {
  mixins: [clickaway],
  data() {
    return {
      clicked: true
    }
  },
  methods: {
    toggle() {
      this.clicked = !this.clicked
    },
    hide() {
      this.clicked = false
    }
  }
}
</script>

<style lang="css">
.dropdown {
  width: 123px;
  height: 38px;
  border: black;
  outline: 1px;
  background-image: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20xmlns%3Axlink%3D%27http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%2523444%27%20d%3D%27M7.406%207.828l4.594%204.594%204.594-4.594%201.406%201.406-6%206-6-6z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: 100% 50%;
  border-color: black;
  border-radius: 0px !important;
  border-style: solid;
  border-width: 1px;
  font-size: 18px;
  letter-spacing: 0.1em;
  font-family: 'Open Sans Condensed', Helvetica, Arial, sans-serif;
  line-height: 40px;
  padding-left: 12px;
}

.dropdown-item {
  color: #4a4a4a;
  display: block;
  font-size: .875rem;
  line-height: 1.5;
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  padding: .375rem 1rem;
  position: relative;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #0a0a0a;
}

.dropdown-content a {
  padding-right: 3rem;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
}

.dropdown-menu {
  left: 0;
  min-width: 12rem;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  z-index: 20;
}

.dropdown-menu hr {
  background-color: #ededed;
  border: none;
  display: block;
  height: 1px;
  margin: .5rem 0;
}

.dropdown-content {
  background-color: #fff;
  border-radius: 0px;
  box-shadow: 0 0.5em 1em -0.125em rgba(10,10,10,.1), 0 0 0 1px rgba(10,10,10,.02);
  padding-bottom: .5rem;
  padding-top: .5rem;
}
</style>
