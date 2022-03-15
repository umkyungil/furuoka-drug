<template>
  <div class="user-list">
    <div class="title">
      <p>Member List</p>
    </div>
    <!-- 멤버리스트-->
    <ul class="list-video" v-show="showModel == 0">
      <!-- 멤버리스트에서 자신의 비디오-->
      <li class="li-my">
        <div class="avatar avatar-name">
          {{ $store.state.data.userName }}
        </div>
        <video autoplay class="mirrorMode myUserId" :id="$store.state.data.userId" @click="switchScreen(myUserId)"></video>
        <p class="name">{{ $store.state.data.userName }}</p>
      </li>
      <!-- 멤버리스트에서 자신 이외의 비디오-->
      <li v-for="v in $store.state.data.userList" :key="v.userId">
        <!-- :userInfo="v": props로 유저정보를 hvideo로 넘기 -->
        <!-- @switchScreen="switchScreen": hvideo에서 userId를 받는다 -->
        <hvideo @switchScreen="switchScreen" @preSwitchScreen="preSwitchScreen" :userInfo="v"></hvideo>
      </li>
    </ul>
    <ul class="list-txt" v-show="showModel == 1">
      <li>
        <p class="onlyname">{{ $store.state.data.userName }}</p>
      </li>
      <li v-for="v in $store.state.data.userList" :key="v.userId">
        <p class="onlyname">{{ v.displayName }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import RTCClient from "../core/rtc-client";
import Util from "../core/utils/utils";
export default {
  data() {
    return {
      showModel: 0,
      myUserId: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      
    });
  },
  methods: {
    preSwitchScreen(userId) {
      this.myUserId = RTCClient.instance.userId;

      // 멤버리스트의 내 화면이 메인에 보일때 상대방 화면을 클릭
      document.getElementById("localVideo").setAttribute("subUserId", userId);
      RTCClient.instance.subscribeLarge(userId).then((code) => {
        setTimeout(() => {
          // 원격 비디오에 대한 렌더링 창 및 그리기 매개변수 설정
          RTCClient.instance.setDisplayRemoteVideo(
            userId,
            document.getElementById("localVideo"),
            code
          );
        }, 200);
      }).catch((error) => {
          console.log('error: ', error);
      });
      hvuex({
        isSwitchScreen: true,
      });
    },


    switchScreen(userId) {
      let subUserId = document.getElementById("localVideo").getAttribute("subUserId");
      this.myUserId = RTCClient.instance.userId;

      console.log("userlist userId1: ", userId);
      console.log("userlist subUserId: ", subUserId);
      console.log("userlist myUserId: ", this.myUserId);

      this.$nextTick(() => {
        // 멤버리스트의 상대방화면이 메인에 보일때 내 화면을 클릭
        // 멤버리스트의 상대방화면이 메인에 보일때 상대방 화면을 클릭(메인화면은 보이지 않게 된다)
        if (subUserId) {
          var _userId = subUserId;
          RTCClient.instance.subscribe(_userId).then((code) => {
            RTCClient.instance.setDisplayRemoteVideo(
              _userId,
              document.getElementById(_userId),
              code
            );
          });
        }
        // 멤버리스트의 내 화면이 메인에 보일때 내 화면을 클릭
        // 멤버리스트의 상대방화면이 메인에 보일때 내 화면을 클릭
        if (userId == this.myUserId || userId == subUserId) {
          if (userId == this.myUserId) {
            setTimeout(() => {
              if (this.$store.state.data.isPublishScreen) {
                document.getElementById("localVideo").srcObject = RTCClient.instance.screenStream;
              } else {
                document.getElementById("localVideo").srcObject = AppConfig.localStream;
              }
            }, 200);
            document.getElementById("localVideo").removeAttribute("subUserId");
            hvuex({
              isSwitchScreen: false,
            });
          }
          return;
        } else {
          // 멤버리스트의 내 화면이 메인에 보일때 상대방 화면을 클릭
          document.getElementById("localVideo").setAttribute("subUserId", userId);
          RTCClient.instance.subscribeLarge(userId).then((code) => {
            setTimeout(() => {
              // 원격 비디오에 대한 렌더링 창 및 그리기 매개변수 설정
              RTCClient.instance.setDisplayRemoteVideo(
                userId,
                document.getElementById("localVideo"),
                code
              );
            }, 200);
          }).catch((error) => {
              console.log('error: ', error);
          });
          hvuex({
            isSwitchScreen: true,
          });
        }
      });
    },
  },
  watch: {
    "$store.state.data.switchUserId"(newVal, oldVal) {
      if (newVal) {
        console.log("watch newVal:", newVal);
        this.switchScreen(newVal);
        hvuex({ switchUserId: null });
      }
    },
    "$store.state.data.userList"(newVal, oldVal) {
      if (JSON.stringify(newVal) == JSON.stringify(oldVal)) {
        return;
      }

      console.log("watch userList: ",  newVal);

      let subUserId = document.getElementById("localVideo").getAttribute("subUserId");

      console.log("watch subUserId: ",  subUserId);

      if (subUserId) {
        if (!RTCClient.instance.getUserInfo(subUserId)) {
          if (this.$store.state.data.isPublishScreen) {
            document.getElementById("localVideo").srcObject = RTCClient.instance.screenStream;
            if (this.$store.state.data.isSwitchScreen) {
              document.getElementById(RTCClient.instance.userId).srcObject = AppConfig.localStream;
            }
          } else {
            document.getElementById("localVideo").srcObject = AppConfig.localStream;
          }
          document.getElementById("localVideo").removeAttribute("subUserId");
          hvuex({
            isSwitchScreen: false,
          });
        }
      }
    },
  },
};
</script>

<style lang="scss">
.user-list {
  //width: vw(218);
  width: 196px;
  height: vh(720-40-104); //position: fixed;
  top: 40px;
  right: 0;
  bottom: 104px;
  padding: 0 13px;
  box-sizing: border-box;
  .title {
    margin: 12px 0 12px 0;
    font-size: 16px;
    display: flex;
    text-align: center;
    cursor: pointer;
    p {
      position: relative;
      flex: 1;
      padding: 10px 0;
    }
    p::after {
      display: block;
      content: "";
      height: 1px;
      background-color: black;
      margin-top: 20px;
    }
    .on::after {
      height: 4px;
      background-color: #013ebe;
      margin-top: 18px;
    }
  }
  .list-video {
    overflow-x: scroll;
    height: vh(720-40-104-80);
    padding-bottom: vh(30);
    .li-my {
      position: relative;
      $height: 126px; // 31.1vh;
      height: $height;
      overflow: hidden;
      width: vh(128/3 * 4);
      margin-bottom: 10px;
      .avatar {
        position: absolute;
        text-align: center;
        top: 0;
        width: 100%;
        line-height: $height;
        bottom: 0;
        color: #333333;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: #409eff;
        // background-color: rgba(89, 89, 89, $alpha: 1);
        img {
          display: none;
        }
      }
      .avatar-name {
        color: white;
        font-size: vh(40);
        text-align: center;
        line-height: vh(110);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      video {
        position: absolute;
        top: 0;
        width: 100%;
        height: $height;
        object-fit: fill;
        background-color: transparent;
      }
      .name {
        position: absolute;
        bottom: 10px;
        left: 10px;
        font-size: 18px;
        color: white;
      }
    }
  }
  .list-txt {
    p {
      line-height: 48px;
      cursor: pointer;
      text-indent: 30px;
    }
    p:hover {
      background-color: #d2e1ff;
    }
  }
}
</style>