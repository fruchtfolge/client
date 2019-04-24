<template>
  <div class="">
    <datalist id="suggestions" class="">
      <option v-for="(suggestion,i) in cleanSuggestions" :key="`suggestion_${i}`">
        {{ suggestion }}
      </option>
    </datalist>
  </div>
</template>

<script>
import toAscii from 'fold-to-ascii'

export default {
  props: {
    suggestions: {
      type: Array,
      default: () => {
        return []
      },
      required: false
    }
  },
  computed: {
    cleanSuggestions() {
      return this.suggestions.map(s => {
        return toAscii.fold(s)
      })
    }
  }
}
</script>
<style>
</style>
