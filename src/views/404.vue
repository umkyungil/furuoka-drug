<template>
  <div class="login" :style="'background-image:url(' + bgUrl + ')'">
    <div class="main">
      <div class="main-title">
        <!-- <i class="iconfont icon-rtcyinshipintongxin"></i> -->
        <span>For video chat, please connect to the address below.</span><br /><br />
        <a href="https://furuokadrug.herokuapp.com/">Furuokadrug E-Commerce</a>
      </div>
    </div>
  </div>
</template>

<script>
import bgUrl from "../assets/icon/bg.jpg";
export default {
  data() {
    return {  
      bgUrl: bgUrl,
    };
  },
};
</script>

<style lang="scss">
a:link { color: #0000ff; }
a:visited { color: #000080; }
a:hover { color: #ff0000; }
a:active { color: #ff8000; }

.login {
  min-height: 100vh;
  position: relative;
  background-size: 100% 100%;
  .main {
    width: 500px;
    background-color: #fff;
    padding: 30px 40px; //  58px 110px;
    border-radius: 8px;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    font-size: 14px;
    .main-title {
      font-size: 15px;
      text-align: center;
      color: #000000;
      letter-spacing: 1px;
      .iconfont {
        font-size: 64px;
        vertical-align: middle;
        margin-right: 10px;
      }
    }
  }
}
</style>
