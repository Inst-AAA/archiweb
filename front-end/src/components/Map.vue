<template>
  <section>
    <div
      id="gui-container"
      style="position:absolute;right:0;z-index:999"
    ></div>
    <div id="map" style="bottom:2.1em"></div>
  
  </section>

</template>

<script>
export default {
  name: "Map",
  data: () => ({}),
  mounted() {
    if (this.$route.path === '/') {
      const index = require('@/index.js');
      index.main();
    } else {
      const examples = require('@/examples' + this.$route.path + '.js');
      examples.main();
    }
  }
}
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>