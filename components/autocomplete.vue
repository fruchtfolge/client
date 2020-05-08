<template>
  <div class="">
    <datalist id="suggestions" class="">
      <option v-for="(suggestion,i) in cleanSuggestions" :key="`suggestion_${i}`" :value="suggestion.properties.label">
        {{ suggestion.properties.clean }}
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
        s.properties.clean = toAscii.fold(s.properties.label)
        return s
      })
    }
  }
}
</script>
<style>
</style>
