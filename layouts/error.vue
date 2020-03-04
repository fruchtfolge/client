<template>
  <div class="error-container">
    <div class="wrapper">
      <h1 v-if="error.statusCode === 404" class="title">
        Diese Seite gibt es leider nicht 😞
      </h1>
      <h1 v-else class="title">
        {{ error.message }}
      </h1>
      <h2 class="info">
        ERROR {{ error.statusCode }}
      </h2>
      <nuxt-link v-if="error.statusCode === 404 || error.statusCode === 403" class="button error-button" to="/">
        Zurück zur Startseite
      </nuxt-link>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    error: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.error-container {
  width: 100%;
  height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.title {
  font-size: 3em;
}

.wrapper {
  text-align: center;
}

.info {
  font-weight: 300;
  color: #9aabb1;
  margin: 0;
  margin-bottom: 50px;
}

.error-button {
  margin-top: 50px;
  text-decoration: none;
  font-size: 18px;
  padding: 10px;
  letter-spacing: 0.1em;
}
</style>
