<template>
  <div class="rtc-demo" :class="isFullScreen ? 'fullScreen' : ''">
    <div class="header" v-show="$store.state.data.classNum">
      <span @click="hCopy" id="channel">Meeting code：{{ $store.state.data.classNum }}</span>
      <span>&nbsp;Nick name：{{ $store.state.data.userName }}</span>
    </div>
    <div class="container">
      <div class="container-box">
        <!-- <div v-if="toastVideo!==''" class="toast-video">{{toastVideo}}<span @click="toastVideo=''">x</span></div> -->
        <div class="center-avatar">{{ $store.state.data.classNum }}</div>
        <video :class="{ transform: !$store.state.data.isSwitchScreen }" id="localVideo" autoplay></video>
        <!-- <i @click="myFullscreen" :style="!this.isFullScreen ? 'background-image:url('+ fullUrl +')' : 'background-image:url('+ fullOnUrl +')'"></i> -->
      </div>
      <div class="container-memberVideo" :class="showSlide ? 'showright' : 'hideright'">
        <div class="memberContainer">
          <div v-show="isFullScreen" class="memberTab" @click="showSlide = !showSlide">
            <i class="iconfont" :class="!showSlide ? 'icon-zuobian' : 'icon-youbian'"></i>
          </div>
          <div class="member-content">
            <userlist></userlist>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="logo">
        <i class="iconfont icon-rtcyinshipintongxin"></i><span>古冈药妆</span>
      </div>

      <div class="function">
        <div class="mic">
          <i @click="muteLocalMic" :style=" this.audio ? 'background-image:url(' + micUrl + ')' : 'background-image:url(' + micOnUrl + ')'"></i>
          <span>Mute</span><!-- 静音 -->
        </div>
        <div class="camera">
          <i @click="muteLocalCamera" :style=" this.video ? 'background-image:url(' + cameraUrl + ')' : 'background-image:url(' + cameraOnUrl + ')'"></i>
          <span>Camera</span><!-- 摄像头-->
        </div>
        <div class="off">
          <i @click="leaveShadow = true" :style="'background-image:url(' + offUrl + ')'" ></i>
          <span>Leave the meeting</span><!-- 离开会议-->
        </div>
        <div class="screenShare">
          <i @click="publishScreen" 
            :style="!this.$store.state.data.isPublishScreen ? 'background-image:url(' + screenUrl + ')': 'background-image:url(' + screenOnUrl + ')'">
          </i>
          <span>Share screen</span><!-- 共享屏幕-->
        </div>
        <div class="muteAll">
          <i @click="muteAll" :style="!this.muteAllState ? 'background-image:url(' + muteAllUrl + ')' : 'background-image:url(' + muteAllOnUrl + ')'"></i>
          <span>Mute all staff</span><!--全员静音 -->
        </div>

        <!-- 合計 -->
        <div>
          <span>
            <form action="https://gw.ccps.jp/payment.aspx" method="get">
              <input type="hidden" name="sid" value="110106"><!-- 店舗ID-->
              <input type="hidden" name="svid" value="23">
              <input type="hidden" name="ptype" value="8">
              <input type="hidden" name="job" value="REQUEST">
              <input type="hidden" name="lang" value="cn">
              <input type="hidden" name="sod" value="オーダー番号">
              <input type="hidden" name="method" value="QR">
              <input type="hidden" name="sinm1" value="商品名">
              合計：<input type="text" id="name" name="siam1" size="10" v-model="amount" v-on:keyup.enter="submit" placeholder="Enter the amount"/>
              <!-- <input type="txt" name="siam1" value="1000"> -->
              <input type="hidden" name="sisf1" value="500">
            </form>
          
            
          </span>
        </div>
        <div>
          <button @click="submit()">決済</button>
        </div>
      </div>
      <div class="nsetting">
        <el-popover placement="top" width="247" trigger="click">
          <div>
            <span style="font-size: 12px">下次加入会议自动触发</span><!-- 다음에 회의에 참가할 때 자동으로 트리거 -->
            <br />
            <hr />
            <br />
            <span style="margin-right:20px">c</span>
            <el-switch active-color="#016EFF" v-model="preSetMic"> </el-switch>
            <br />
            <br />
            <span style="margin-right:20px">打开自己的摄像头</span><!-- 나만의 마이크 켜기 -->
            <el-switch active-color="#016EFF" v-model="preSetCamera"></el-switch>
          </div>
          <i slot="reference" :style="'background-image:url(' + settingUrl + ')'"></i>
        </el-popover>
        <span>设置</span>
      </div>
    </div>
    <div v-show="leaveShadow" class="shadow">
      <div class="leaveShadow">
        <p>Do you want to end the meeting?</p>
        <!-- 你想要结束会议吗？-->
        <div>
          <span @click="leaveShadow = false">Cancel</span>
          <span class="goBack" @click="goBack">Yes</span
          ><!--结束会议-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RTCClient from "../../core/rtc-client";
import Utils from "../../core/utils/utils";
import offUrl from "../../assets/icon/off.png";
import micUrl from "../../assets/icon/mic.png";
import micOnUrl from "../../assets/icon/mic-on.png";
import cameraUrl from "../../assets/icon/camera.png";
import cameraOnUrl from "../../assets/icon/camera-on.png";
import screenUrl from "../../assets/icon/screen.png";
import screenOnUrl from "../../assets/icon/screen-on.png";
import muteAllUrl from "../../assets/icon/muteall.png";
import muteAllOnUrl from "../../assets/icon/muteall-on.png";
import fullUrl from "../../assets/icon/full.png";
import fullOnUrl from "../../assets/icon/full-on.png";
import settingUrl from "../../assets/icon/setting.png";
import micListUrl from "../../assets/icon/micList.png";
import micListOffUrl from "../../assets/icon/micList-off.png";

export default {
  data() {
    return {
      audio: true,
      video: true,
      leaveShadow: false, //창을 떠나
      isFullScreen: false, //전체 화면 상태
      // toastVideo: "", //메인 창 상단에 표시되는 정보
      showSlide: true, //전체 화면 상태 측면 표시 상태
      muteAllState: false, //모든 구성원은 침묵
      offUrl: offUrl,
      micUrl: micUrl,
      micOnUrl: micOnUrl,
      cameraUrl: cameraUrl,
      cameraOnUrl: cameraOnUrl,
      screenUrl: screenUrl,
      screenOnUrl: screenOnUrl,
      muteAllUrl: muteAllUrl,
      muteAllOnUrl: muteAllOnUrl,
      fullUrl: fullUrl,
      fullOnUrl: fullOnUrl,
      settingUrl: settingUrl,
      micListUrl: micListUrl,
      micListOffUrl: micListOffUrl,
      preSetMic: true, //기본 마이크
      preSetCamera: true, //기본 카메라
      amount: '',
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      window.rtcClient = RTCClient.instance;
      this.init();
    });
  },
  methods: {
    // 初始化 开启预览
    init() {
      this.registerCallBack();
      RTCClient.instance.setAutoPublishSubscribe(true, true);
      RTCClient.instance
        .login(this.$store.state.data.classNum, this.$store.state.data.userName)
        .then((userId) => {
          if (RTCClient.instance.getRoomUserList().length === 0) {
            this.$message(
              "当前只有你一个人，你可以点击页面顶部【复制会议码】给其他参会人员"
            );// 현재 본인만 있습니다. 페이지 상단의 [회의 코드 복사]를 클릭하여 다른 참가자에게 제공할 수 있습니다.
          }
          hvuex({
            isSwitchScreen: false,
            userId: userId,
            isPublish: true,
          }).then(() => {
            Utils.startPreview(document.getElementById(userId)).then((re) => {
              RTCClient.instance.setDisplayLocalVideo(
                document.getElementById("localVideo"),
                1
              );
            });
          });
        })
        .catch((err) => {
          this.$message(err.message);
        });
    },
    // 콜백 등록
    registerCallBack() {
      RTCClient.instance.registerCallBack((eventName, data) => {
        switch (eventName) {
          case "onJoin":
          case "onPublisher":
          case "onUnPublisher":
          case "onNotify":
            hvuex({
              userList: RTCClient.instance.getRoomUserList(),
            });
            break;
          case "onSubscribeResult":
            Utils.showRemoteVideo(data);
            break;
          case "onUserVideoMuted":
            break;
          case "onUserAudioMuted":
            break;
          case "onError":
            Utils.showErrorMsg(data);
            break;
          case "onBye":
            Utils.onByeMessage(data);
            break;
          case "onLeave":
            hvuex({
              userList: RTCClient.instance.getRoomUserList(),
            });
            break;
        }
      });
    },
    goBack() {
      Utils.exitRoom();
    },
    // 로컬 마이크 수집 제어
    muteLocalMic() {
      if (!this.$store.state.data.isPublish) {
        this.$message("未推流");
        return;
      }
      RTCClient.instance.muteLocalMic(!this.audio);
      this.audio = !this.audio;
    },
    // 카메라 금지
    muteLocalCamera() {
      if (!this.$store.state.data.isPublish) {
        this.$message("未推流");
        return;
      }
      RTCClient.instance
        .muteLocalCamera(document.getElementById("localVideo"))
        .then((re) => {
          RTCClient.instance.setDisplayLocalVideo(
            document.getElementById(RTCClient.instance.userId)
          );
        });
      this.video = !this.video;
    },
    // push screen stream
    publishScreen() {
      if (!this.$store.state.data.isPublish) {
        Util.toast("未推流"); // 未推流
        return false;
      }
      if (this.$store.state.data.isPublishScreen) {
        RTCClient.instance
          .stopPublishScreen()
          .then((re) => {
            hvuex({
              isPublishScreen: false,
            });
          })
          .catch((err) => {});
      } else {
        RTCClient.instance
          .startPublishScreen()
          .then(() => {
            hvuex({
              isPublishScreen: true,
            });
          })
          .catch((err) => {});
      }
    },
    // 회의 코드 이벤트를 클릭하여 회의 코드를 복사합니다
    hCopy() {
      this.$message(
        Utils.hCopy("channel") ? "The meeting code has been copied" : ""
      ); // 회의 코드가 복사되었습니다.
    },
    // 모든 멤버 음소거 켜기/끄기)
    muteAll() {
      this.muteAllState = !this.muteAllState;
      if (this.muteAllState) {
        RTCClient.instance.muteAllRemoteAudioPlaying(true);
        this.$message("All current members have been muted"); // 모든 현재 회원이 음소거되었습니다
      } else {
        RTCClient.instance.muteAllRemoteAudioPlaying(false);
        this.$message("All mute is turned off"); // 모든 음소거가 꺼져 있습니다
      }
    },
    submit() {
      var reg = new RegExp(/^([0-9]{1,12})?$/g);
      if (!reg.test(this.amount)) {
        this.$message("Please enter a number");
        return;
      }
      alert(this.amount);

      /*
      hvuex({ classNum: this.room, userName: this.displayName });
      // 페이지 이동
      this.$router.push("/meet");
      */
    },
  },
  watch: {
    /**
     * 사전 설정 마이크 모니터링
     */
    preSetMic(n, o) {
      window.localStorage.removeItem("preSetMic");
      window.localStorage.setItem("preSetMic", this.preSetMic);
    },
    /**
     * 프리셋 카메라 모니터링
     */
    preSetCamera(n, o) {
      window.localStorage.removeItem("preSetCamera");
      window.localStorage.setItem("preSetCamera", this.preSetCamera);
    },
  },
};
</script>

<style lang="scss">
  .rtc-demo {
    .header {
      position: absolute;
      top: 0;
      left: 0;
      height: 40px;
      font-size: 16px;
      color: #fff;
      background: #016eff;
      width: 100%;
      text-align: center;
      line-height: 40px;
      #channel {
        user-select: text;
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        cursor: pointer;
      }
    }
    .container {
      position: absolute;
      display: flex;
      width: 100%;
      bottom: 113px;
      top: 40px;
      background: #f8f8f8;
      .container-box {
        width: calc(100% - 218px);
        height: 100%;
        position: relative;
        background: #2f2f2f;
        .toast-video {
          width: 100%;
          height: 50px;
          background: rgba(0, 0, 0, 0.8);
          position: absolute;
          top: 0;
          line-height: 50px;
          color: #ffffff;
          font-size: 16px;
          padding-left: 30px;
          z-index: 1;
          span {
            padding: 0 10px;
            position: absolute;
            right: 10px;
            cursor: pointer;
          }
        }
        .center-avatar {
          width: 100px;
          height: 100px;
          position: absolute;
          left: 50%;
          top: 50%;
          margin-left: -50px;
          margin-top: -50px;
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          border-radius: 50%;
          background: #016eff;
          text-align: center;
          line-height: 100px;
        }
        video {
          width: 100%;
          height: 100%;
          background: transparent;
          position: relative;
        }
        i {
          width: 36px;
          height: 36px;
          position: absolute;
          right: 35px;
          bottom: 35px;
          display: inline-block;
          background-repeat: no-repeat;
          background-position: center center;
          cursor: pointer;
        }
      }
      .container-memberVideo {
        .memberContainer {
          width: 209px;
          height: 100%;
          padding: 10px 13px;
          background: #fff;
          .member-title {
            display: flex;
            border-bottom: 1px solid #c0c0c0;
            margin-bottom: 2px;
            li {
              font-size: 14px;
              height: 44px;
              width: 50%;
              line-height: 44px;
              text-align: center;
              position: relative;
              display: inline-block;
              cursor: pointer;
              i {
                position: absolute;
                left: 0;
                bottom: -1px;
                height: 2px;
                width: 100%;
                background: #0079f2;
              }
            }
          }
          .member-content {
            height: calc(100% - 65px);
          }
        }
      }
    }
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 113px;
      width: 100%;
      background: #f8f8f8;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;  // 井上
      .logo {
        display: flex;
        align-items: center;
        // margin-left: 7px; 井上
        flex-wrap: wrap; // 井上
        i {
          font-size: 40px;
          margin: 0 5px;
        }
        span {
          font-size: 16px;
        }
      }
      .function {
        display: flex;

        // 井上
        flex-wrap: wrap;
        background: #f8f8f8;
        align-items: center;
        div {
          // margin: 0 13px; 井上
          margin: 10px 13px; // 井上
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          i {
            width: 120px;
            height: 48px;
            border-radius: 24px;
            background-color: #e5e5e5;
            margin-bottom: 12px;
            cursor: pointer;
            background-repeat: no-repeat;
            background-position: center center;
          }
          span {
            font-size: 15px;
            color: #2f2f2f;
          }
        }
        .off {
          i {
            background-color: #f5222d;
          }
        }
        input[type="text"] {
          padding: 12px 20px;
          margin: 8px 0;
          box-sizing: border-box;
        }
        button {
          outline: none;
          padding: 0 14px;
          width: 100%;
          box-sizing: border-box;
          line-height: 39px;
          height: 39px;
          background-color: #4caf50;
          border: solid 1px #3296fa;
          color: white;
          letter-spacing: 1px;
          font-size: 22px;
          border-radius: 3.5px;
          cursor: pointer;
        }
      }
      .nsetting {
        visibility: hidden;
        margin-right: 34px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        i {
          width: 32px;
          height: 32px;
          display: block;
          background-repeat: no-repeat;
          background-position: center center;
          margin-bottom: 12px;
          cursor: pointer;
        }
      }
    }
    .shadow {
      width: 100%;
      height: 100%;
      position: fixed;
      .leaveShadow {
        width: 308px;
        height: 216px;
        position: fixed;
        z-index: 100;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ffffff;
        border-radius: 8px;
        padding: 65px 30px 36px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        p {
          text-align: center;
          color: #111111;
        }
        div {
          display: flex;
          justify-content: space-between;
        }
        span {
          width: 111px;
          height: 40px;
          border: 1px solid rgba(0, 0, 0, 0.76);
          border-radius: 2.5px;
          display: inline-block;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
        }
        .goBack {
          border: none;
          color: #ffffff;
          background: #3296fa;
        }
      }
    }
    .screenToast {
      width: 288px;
      height: 91px;
      background: #111;
      opacity: 0.9;
      position: fixed;
      left: 50%;
      margin-left: -144px;
      top: 12px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      i {
        width: 18px;
        height: 18px;
        background: red;
        border-radius: 50%;
        margin-right: 16px;
      }
      span {
        color: #fff;
        font-size: 20px;
      }
    }
  }
  .fullScreen {
    .header {
      display: none;
    }
    .container {
      top: 0;
      bottom: 0;
      .container-box {
        width: 100%;
        i {
          bottom: 148px;
        }
      }
      .container-memberVideo {
        position: absolute;
        right: 0;
        .memberContainer {
          height: 420px;
          top: 15%;
          .memberTab {
            width: 24px;
            height: 72px;
            position: absolute;
            right: 209px;
            border-width: 12px;
            border-color: transparent #ffffff transparent transparent;
            border-style: solid;
            top: 42%;
            float: left;
            cursor: pointer;
            i {
              line-height: 48px;
              font-weight: 800;
            }
          }
        }
      }
      .hideright {
        .memberContainer {
          position: fixed;
          right: -209px;
        }
      }
      .showright {
        .memberContainer {
          position: fixed;
          right: 0;
        }
      }
    }
  }
  .transform {
    transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg);
  }

// 井上
// 井上
  @media (max-width: 768px) {
    .rtc-demo .footer{
      bottom: auto;
    }
    .user-list {
      padding: 0 0;
    }
    .user-list .list-video {
      height: auto;
      padding: 0 0;
      flex-wrap: wrap; // 20210907
      display: flex;   // 20210907
      justify-content: space-evenly;  // 20210907
    }
    
    // kium start
    ::-webkit-scrollbar {
      /* width: 5px; */
      height: 0px;
    }
    #localVideo {
      width: 100%;
    }
    .rtc-demo .footer .function div i{
      width: 60px;
      height: 48px;
    }
    // .user-list .list-video li {
    //   border: 1px solid black;
    // }
    .user-list .title {
      display: none;
    }
    .rtc-demo .footer .nsetting {
      display: none
    }
    .rtc-demo .footer .function .screenShare {
      display: none
    }
    .rtc-demo .footer .function .muteAll {
      display: none
    }
    // kium end
    .rtc-demo .container .container-memberVideo .memberContainer {
      width: 100%;
      padding: 10px 0px 0px 0px;
    }
    .rtc-demo .container .container-box {
      width: 100%;
      background: #ffff; // 20210907
    }
    .rtc-demo .container {
      position: inherit;
      display: block;
    }
    .user-list {
      width: 100%;
      height: auto;
    }
  }
</style>
