<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
    data(){
    return{
    }
  },
  name: "app",
  components: {},
  created() {}
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.mirrorMode{
  transform: rotateY(180deg);
}
.body {
  background: #F6F6F6;
}
.shadow {
  box-shadow: 5px 10px 10px rgba(0, 0, 0, 0.03);
}
</style>
