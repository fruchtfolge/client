<template>
  <section class="container">
    <h1 class="title">
      {{ error.message }}
    </h1>
    <h2 class="info">
      ERROR {{ error.statusCode }}
    </h2>
    <nuxt-link v-if="error.statusCode === 404 || error.statusCode === 403" class="button" to="/">
      Zurück zur Startseite
    </nuxt-link>
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
  text-align: center;
  width: 50%;
  padding: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.title {
  font-size: 3em;
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
