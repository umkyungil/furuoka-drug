<template>
  <div class="rtc-demo" :class="isFullScreen ? 'fullScreen' : ''">
    <!-- 헤더 -->
    <div class="header" v-show="$store.state.data.classNum">
      <span @click="hCopy" id="channel">{{$t("header.classNum")}}：{{ $store.state.data.classNum }}</span>
      <span>&nbsp;{{$t("header.userName")}}：{{ $store.state.data.userName }}</span>
    </div>    
    <!-- 모달 -->
    <div>
      <a-modal :visible="visible" title="Furuokadrug" @ok="goBack">
        <template #footer>
          <a-button key="submit" type="primary" @click="goBack">{{$t("modal.goBack")}}</a-button>
        </template>
        <p>{{$t("modal.header")}}</p>
        <p>{{$t("modal.body")}}</p>
      </a-modal>
    </div>
    <!-- 바디 -->
    <div class="container">
      <div class="container-box">
        <!-- <div class="center-avatar">{{ $store.state.data.classNum }} </div> -->
        <video :class="{ transform: !$store.state.data.isSwitchScreen }" id="localVideo" playsInline autoplay></video>
      </div>
      <!-- 멤버 리스트 -->
      <div class="container-memberVideo" :class="showSlide ? 'showright' : 'hideright'">
        <div class="memberContainer">
          <!-- <div v-show="isFullScreen" class="memberTab" @click="showSlide = !showSlide">
            <i class="iconfont" :class="!showSlide ? 'icon-zuobian' : 'icon-youbian'"></i>
          </div> -->
          <div class="member-content">
            <userlist></userlist>
          </div>
        </div>
      </div>      
      <!-- 결제팝업 -->
      <div class="form-popup" id="wechatForm">
        <form class="form-container">
          <h2>Wechat</h2>
          <input id="wechat_amount" type="text" placeholder="请输入总金额" required>
          <button type="button" class="btn" @click="wechatSubmit()">{{$t("payment.wechat")}}</button>
          <button type="button" class="btn cancel" @click="wechatClose()">Close</button>
        </form>
      </div>
      <div class="form-popup" id="alipayForm">
        <form class="form-container">
          <h2>Alipay</h2>
          <input id="alipay_amount" type="text" placeholder="请输入总金额" required>
          <button type="button" class="btn" @click="alipaySubmit()">{{$t("payment.alipay")}}</button>
          <button type="button" class="btn cancel" @click="alipayClose()">Close</button>
        </form>
      </div>
    </div>
    <!-- 푸터 -->
    <div align="center" class="footer">
      <!-- 로고 -->      
      <!-- <div class="logo">
        <i class="iconfont icon-rtcyinshipintongxin"></i><span>古冈药妆</span>
      </div>  -->
      <div class="function">
        <!-- 마이크 -->
        <div class="mic">
          <i @click="muteLocalMic" :style=" this.audio ? 'background-image:url(' + micUrl + ')' : 'background-image:url(' + micOnUrl + ')'"></i>
          <span>{{$t("footer.mic")}}</span>
        </div>
        <!-- 카메라-->
        <div class="camera">
          <i @click="muteLocalCamera" :style=" this.video ? 'background-image:url(' + cameraUrl + ')' : 'background-image:url(' + cameraOnUrl + ')'"></i>
          <span>{{$t("footer.camera")}}</span>
        </div>
        <!--방 떠나기 -->
        <div class="off">
          <i @click="leaveShadow = true" :style="'background-image:url(' + offUrl + ')'" ></i>
          <span>{{$t("footer.off")}}</span>
        </div>
        <!-- 화면공유-->
        <div class="screenShare">
          <i @click="publishScreen" 
            :style="!this.$store.state.data.isPublishScreen ? 'background-image:url(' + screenUrl + ')': 'background-image:url(' + screenOnUrl + ')'">
          </i>
          <span>{{$t("footer.screenShare")}}</span>
        </div>
        <!-- Wechat결제 --> 
        <div class="wechatBtn">
          <i @click="wechatOpen()" :style="'background-image:url(' + wechatUrl +   ')'" ></i>
          <span>{{$t("footer.wechat")}}</span>
        </div>
        <!-- Alipay결제 --> 
        <div class="alipayBtn">
          <i @click="alipayOpen()" :style="'background-image:url(' + alipayUrl +   ')'" ></i>
          <span>{{$t("footer.alipay")}}</span>
        </div>
        <!-- 카메라 선택 -->
        <div class="cameraSelect">
          <span>Camera Select</span>
          <select id="cameras" v-on:change="handleCameraChange">
            <option v-for="camera in cameras" v-bind:value="camera.deviceId" v-bind:key="camera.id">
              {{ camera.label }}
            </option>
          </select>          
        </div>
      </div>
    </div>
    <div v-show="leaveShadow" class="shadow">
      <div class="leaveShadow">
        <p>{{$t("footer.leaveShadow")}}</p>
        <div>
          <span @click="leaveShadow = false">{{$t("footer.cancel")}}</span>
          <span class="goBack" @click="goBack">{{$t("footer.goBack")}}</span>
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

import fullUrl from "../../assets/icon/full.png";
import fullOnUrl from "../../assets/icon/full-on.png";
import settingUrl from "../../assets/icon/setting.png";
import micListUrl from "../../assets/icon/micList.png";
import micListOffUrl from "../../assets/icon/micList-off.png";
import userlist from '../../components/userlist.vue';
import wechatUrl from "../../assets/icon/wechat.png";
import alipayUrl from "../../assets/icon/alipay.png";
import Util from '../../core/utils/utils';

export default {
  components: { 
    userlist,
  },
  data() {
    return {
      audio: true,
      video: true,
      leaveShadow: false, // 방 떠나기
      isFullScreen: false, //전체 화면
      showSlide: true, //전체 화면 상태 측면 표시 상태
      offUrl: offUrl,
      micUrl: micUrl,
      micOnUrl: micOnUrl,
      cameraUrl: cameraUrl,
      cameraOnUrl: cameraOnUrl,
      screenUrl: screenUrl,
      screenOnUrl: screenOnUrl,
      fullUrl: fullUrl,
      fullOnUrl: fullOnUrl,
      settingUrl: settingUrl,
      micListUrl: micListUrl,
      micListOffUrl: micListOffUrl,
      preSetMic: true, //기본 마이크
      preSetCamera: true, //기본 카메라
      wechatUrl: wechatUrl,
      alipayUrl: alipayUrl,
      cameras: [],
      visible: false, // 모달창
      ModalText: 'Content of the modal',
      confirmLoading: false,
    };
  },
  created() {
    // ECSystem에서 일반사용자가 호출하지 않았을 경우 접속금지
    if (this.$route.query.userId) {
      if (this.$route.query.type !== "ec") {
        this.$router.push('/err')
        return;
      }
      if (!this.$route.query.name) {
        this.$router.push('/err')
        return;
      }
      if (!this.$route.query.room ) {
        this.$router.push('/err')
        return;
      }

      hvuex({ classNum: this.$route.query.room, userName: this.$route.query.name, loginUserId: this.$route.query.userId, type: this.$route.query.type });
    } else {
      // ECSystem에서 스탭 또는 관리자가 호출하지 않았을 경우 접속금지
      if (!this.$store.state.data.loginUserId) {
        this.$router.push('/err')
        return;
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.rtcClient = RTCClient.instance;
      this.init();
    });
  },
  methods: {
    // 초기화
    init() {
      // 룸에 들어가서 10분후에도 혼자인 경우 강퇴(1분:60000)
      setTimeout(() => {this.forceExit()}, 600000);      

      // 다국어 설정
      if(this.$route.query.i18nextLng) {
        this.$i18n.locale = this.$route.query.i18nextLng;
      }

      // 카메라 장치를 전부 추출
      this.getCameras();
      
      // 콜백등록
      this.registerCallBack();
      RTCClient.instance.setAutoPublishSubscribe(true, true);
      RTCClient.instance
        .login(this.$store.state.data.classNum, this.$store.state.data.userName)
        .then((userId) => {
          if (RTCClient.instance.getRoomUserList().length === 0) {
            // 메세지 표시방법
            // this.$message(
            //   "当前只有你一个人，你可以点击页面顶部【复制会议码】给其他参会人员" 
            // );

            // EC시스템에서 관리자 또는 스텝이 접속했을 경우 사용자가 없으면 모달을 뛰우고 강퇴 시킨다.
            // this.$route.query.userId는 login.vue로 관리자가 접속했을때 userId
            if (!this.$route.query.userId) {
              // 모달창 뛰우기
              this.visible = true;
            }
          }
          hvuex({
            isSwitchScreen: true,
            userId: userId,
            isPublish: true,
          }).then(() => {
            Utils.startPreview(document.getElementById(userId)).then((re) => {
              // 로컬 비디오에 대한 렌더링 창 및 그리기 매개변수 설정(매개변수:1)
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
      const sendType = this.$store.state.data.type;
      // ECSystem 종료할 경우 type을 넘겨서 랜딩페이지로 이동하게 함
      if (sendType === "ec") {
        window.parent.postMessage({
          type: "exitRoom"
        }, "*")
      } else {
        Utils.exitRoom();
      }
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
    // 화면 공유
    publishScreen() {
      if (!this.$store.state.data.isPublish) {
        Util.toast("未推流");
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
      );
    },
    handleOk(e) {
      this.ModalText = 'The modal will be closed after two seconds';
      this.confirmLoading = true;
      setTimeout(() => {
          this.visible = false;
          this.confirmLoading = false;
      }, 2000);
    },
    // 선택된 카메라 장치 아이디
    async handleCameraChange(event) {
      await this.getMedia(event.target.value)      
    },
    // 카메라 장치를 전부 추출
    async getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameraDevices = devices.filter(device => device.kind === "videoinput");
        this.cameras = cameraDevices
      } catch (e) {
        console.log("getCameras: ", e);
      }     
    },
    // 선택된 카메라로 전환
    async getMedia(deviceId) {
      const userId = this.$store.state.data.userId;

      // 후면 카메라
      // const backConstrains = { audio: true, video: { facingMode: "environment" } }
      // 셀피 카메라
      const initialConstrains = { audio: true, video: { facingMode: "user" } };
      // 특정 카메라 디바이스 선택(해당 디바이스가 없으면 비디오가 표시되지 않음)
      const cameraConstrains = { audio: true, video: {deviceId: { exact: deviceId } } };
            
      try {
        // 스트림 설정
        const stream = await navigator.mediaDevices.getUserMedia(
          deviceId? cameraConstrains : initialConstrains
        )
        // 멤버리스트에 스트림 대입
        const chgStream = document.getElementById(userId).srcObject = stream
        // 멤버리스트 카메라 전환
        AppConfig.localStream  = chgStream;
        // 메인화면 카메라 전환(메인화면 다시그리기)
        RTCClient.instance._localCameraStream = chgStream;
        RTCClient.instance.setDisplayLocalVideo(
          document.getElementById("localVideo"),
          1
        );
      } catch (e) {
        console.log(e);
      }
    },
    forceExit() {
      // 채팅방에 일정시간동안 혼자인 경우 강제 퇴장
      if (RTCClient.instance.getRoomUserList().length === 0) {
        this.goBack();
      }
    },    
    // 결제 
    wechatOpen() {
      document.getElementById("wechatForm").style.display = "block";
    },
    wechatClose() {
      document.getElementById("wechatForm").style.display = "none";
    },
    alipayClose() {
      document.getElementById("alipayForm").style.display = "none";
    },
    alipayOpen() {
      document.getElementById("alipayForm").style.display = "block";
    },
    // 입력값 체크
    wechatSubmit() {
      const amount = document.getElementById("wechat_amount").value;
      if (amount == "" || amount == undefined) {
        this.$message("会议码格式不正确"); // 숫자를 입력해 주십시요
        return;
      }
      const reg = new RegExp(/^([0-9]{1,12})?$/g);
      if (!reg.test(amount)) {
        this.$message("会议码格式不正确"); // 숫자를 입력해 주십시요
        return;
      }

      // Query Parameter취득
      const sendType = this.$store.state.data.type;
      const classNum = this.$store.state.data.classNum;
      const userName = this.$store.state.data.userName;
      const loginUserId = this.$store.state.data.loginUserId;

      // 상대방 이름 취득(EC시스템에서 서비스 스텝 이름으로 사용:권한이 일반사용자가 아닌경우만)
      const guestName = this.$store.state.data.guestName;

      // 결제결과로 받을수 있는 항목에 임의의 데이타 지정      
      let dateInfo = new Date();
      const sod = new Date(dateInfo.getTime() - (dateInfo.getTimezoneOffset() * 60000)).toISOString()
      const uniqueTime = sod.replace('T',' ').substring(0, 19)
      const uniqueField = 'Wechat' + '_' + uniqueTime + '_' + classNum + '_' + userName;
      
      // ECSystem에서 결제확인 페이지(LiveStreaming)에 데이타 송신(senType:ec)
      if (sendType === "ec") {
        window.parent.postMessage({
          type: "wechat", 
          loginUserId: loginUserId,
          sid: '110106',
          sod: sod,
          siam1: amount,
          uniqueField: uniqueField,
          guestName: guestName,
        }, "*")
      // Live Streaming시스템에서 결제
      } else {  
        let wechat_variable = {
          sid: '110106',
          svid: '23',
          ptype: '8',
          job: 'REQUEST',
          rt: '4',
          sod: sod,
          lang: 'cn',
          siam1: amount,
          sinm1: 'Furuokadrug Product',
          sisf1: '0',
          method: 'QR',
          uniqueField: uniqueField
        }

        let url = "https://gw.ccps.jp/payment.aspx";
        Object.keys(wechat_variable).forEach(function(key, index) {
          url = url + (index === 0 ? "?" : "&") + key + "=" + wechat_variable[key];
        });

        window.open(url,"wechat","toolbar=0,menubar=0,scrollbars=auto,resizable=no,height=770,width=768,top=100px,left=100");
      }
      this.wechatClose();
    },
    alipaySubmit() {
      const amount = document.getElementById("alipay_amount").value;
      if (amount == "" || amount == undefined) {
        this.$message("会议码格式不正确");
        return;
      }
      const reg = new RegExp(/^([0-9]{1,12})?$/g);
      if (!reg.test(amount)) {
        this.$message("会议码格式不正确");
        return;
      }      
      
      // Query Parameter취득
      const sendType = this.$store.state.data.type;
      const classNum = this.$store.state.data.classNum;
      const userName = this.$store.state.data.userName;
      const loginUserId = this.$store.state.data.loginUserId;
      
      // 상대방 이름 취득(EC시스템의 Order관리의 담당자이름)
      const guestName = this.$store.state.data.guestName;

      // 결제결과로 받을수 있는 항목에 임의의 데이타 지정
      const dateInfo = new Date();
      const sod = new Date(dateInfo.getTime() - (dateInfo.getTimezoneOffset() * 60000)).toISOString()
      const uniqueTime = sod.replace('T',' ').substring(0, 19)
      const uniqueField = 'Alipay' + '_' + uniqueTime + '_' + classNum + '_' + userName;

      // ECSystem에서 결제(senType:ec)
      if (sendType === "ec") {
        window.parent.postMessage({
          type: "alipay", 
          loginUserId: loginUserId,
          guestName: guestName,
          sid: '110106',
          sod: sod,
          siam1: amount,
          uniqueField: uniqueField,
        }, "*")
      } else {
        // Live Streaming에서 결제
        let alipay_variable = {
          'sid': '110106',
          'svid': '6',
          'ptype': '8',
          'job': 'REQUEST',
          'sod': sod, // 결제결과로 전송받는 항목(현재는 날자를 지정하고 있으나 변경 가능)          
          'lang': 'cn',
          'sinm1': 'Furuokadrug Product',
          'siam1': amount, // 상품금액
          'sisf1': '0', // 송금 수수료
          'uniqueField': uniqueField
        }

        let url = "https://gw.ccps.jp/payment.aspx";
        Object.keys(alipay_variable).forEach(function(key, index) {
          url = url + (index === 0 ? "?" : "&") + key + "=" + alipay_variable[key];
        });

        window.open(url,"_blank","toolbar=0,menubar=0,scrollbars=auto,resizable=no,height=770,width=768,top=100px,left=100");
      }
      this.alipayClose();
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
  /* The popup form - hidden by default */
  .form-popup {
    display: none;
    position: fixed;
    bottom: 0;
    right: 15px;
    border: 3px solid #f1f1f1;
    z-index: 9;
  }

  /* Add styles to the form container */
  .form-container {
    max-width: 300px;
    padding: 10px;
    background-color: white;
  }

  /* Full-width input fields */
  .form-container input[type=text], .form-container input[type=password] {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    border: none;
    background: #f1f1f1;
  }

  /* When the inputs get focus, do something */
  .form-container input[type=text]:focus, .form-container input[type=password]:focus {
    background-color: #ddd;
    outline: none;
  }

  /* Set a style for the submit/login button */
  .form-container .btn {
    background-color: #04AA6D;
    color: white;
    padding: 16px 20px;
    border: none;
    cursor: pointer;
    width: 100%;
    margin-bottom:10px;
    opacity: 0.8;
  }

  /* Add a red background color to the cancel button */
  .form-container .cancel {
    background-color: red;
  }

  /* Add some hover effects to buttons */
  .form-container .btn:hover {
    opacity: 1;
  }

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
      justify-content: space-evenly;
      flex-wrap: wrap;  // add 20210904
      // .logo {
      //   display: flex;
      //   align-items: center;
      //   margin-left: 7px;
      //   flex-wrap: wrap;
      //   i {
      //     font-size: 40px;
      //     margin: 0 5px;
      //   }
      //   span {
      //     font-size: 16px;
      //   }
      // }
      .function {
        display: flex;

        // 井上
        flex-wrap: wrap;
        background: #f8f8f8;
        align-items: center;
        div {
          // margin: 0 13px; add 20210904
          margin: 10px 13px; // add 20210904
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          i {
            width: 120px;
            height: 48px;
            border-radius: 24px;
            // background-color: #e5e5e5; // 버튼 배경색
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
          border: 2px solid;
          border-radius: 4px;
        }
        // button {
        //   padding: 0 14px;
        //   width: 100%;
        //   box-sizing: border-box;
        //   line-height: 39px;
        //   height: 39px;
        //   background-color: #4caf50;
        //   border: solid 1px #3296fa;
        //   color: white;
        //   letter-spacing: 1px;
        //   font-size: 22px;
        //   border-radius: 3.5px;
        //   cursor: pointer;
        // }
      }
      // 환경설정
      // .nsetting {
      //   visibility: hidden;
      //   margin-right: 34px;
      //   display: flex;
      //   flex-direction: column;
      //   justify-content: center;
      //   align-items: center;
      //   i {
      //     width: 32px;
      //     height: 32px;
      //     display: block;
      //     background-repeat: no-repeat;
      //     background-position: center center;
      //     margin-bottom: 12px;
      //     cursor: pointer;
      //   }
      // }
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

// add 20210904
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
      flex-wrap: wrap;
      display: flex;
      justify-content: space-evenly;
    }
    // modified 20210906
    ::-webkit-scrollbar {
      /* width: 5px; */
      height: 0px;
    }
    // add 20210906
    #localVideo {
      width: 100%;
    }
    .rtc-demo .footer .function div i{
      width: 60px;
      height: 48px;
    }
    .user-list .title {
      display: none;
    }
    .screenShare {
      display: none
    }
    .function { //.muteAll {
      display: none
    }
    // kium end
    .rtc-demo .container .container-memberVideo .memberContainer {
      width: 100%;
      padding: 10px 0px 0px 0px;
    }
    .rtc-demo .container .container-box {
      width: 100%;
      background: #ffff; // add 20210907
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