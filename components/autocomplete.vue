<template>
  <div class="">
    <ul>
      <li v-for="(suggestion,i) in suggestions" :key="`suggestion_${i}`">
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    suggestions: {
      type: Array,
      required: true
    }
  }
}
</script>
<style>
</style>
