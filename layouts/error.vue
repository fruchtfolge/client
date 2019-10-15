<template>
  <section class="container">
    <div class="wrapper">
      <h1 v-if="error.statusCode === 404" class="title">
        Diese Seite gibt es leider nicht :(
      </h1>
      <h1 v-else class="title">
        {{ error.message }}
      </h1>
      <h2 class="info">
        ERROR {{ error.statusCode }}
      </h2>
      <nuxt-link v-if="error.statusCode === 404 || error.statusCode === 403" class="button" to="/">
        Zurück zur Startseite
      </nuxt-link>
    </div>
  </section>
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
.container {
  display: flex;
  justify-content: center;
  height: calc(100vh - 120px);
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
}
.button {
  margin-top: 50px;
}
</style>
