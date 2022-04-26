import { Message } from 'element-ui';
import RTCClient from "../rtc-client";
import state from '../../vuex/state';
export default class Util {
    /**
     * 정보 표시
     * @param {*} v 
     */
    static toast(v) {
        Message(v);
    }
    /**
     * 복사
     * @param {*} id 
     */
    static hCopy(id) {
        if (id) {
            try {
                var range = document.createRange();
                var tar = document.getElementById(id);
                range.selectNodeContents(tar);
                var selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('copy');
                selection.removeAllRanges();
            } catch (error) {
                console.log(error);
                return false;
            }
            return true;
        } else {
            return true;
        }
    }
    /**
     * 
     * @param {*} id 
     */
    static inputCopy(id) {
        try {
            var Url2 = document.getElementById(id);
            Url2.select(); // 개체 선택
            document.execCommand("Copy");
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    /**
  * 브라우저 주소 표시줄 매개변수 가져오기(쿼리스트링)
  * @param {*} url 
  * @param {*} name 
  */
    static getUrlParam(name) {
        let url = window.location.href;
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
        let urlArr = url.split("?");
        if (urlArr.length > 1) {
            url = "?" + urlArr[1];
            var r = url.substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]); return null;
        } else {
            return null;
        }
    }
    /**
     * 방 나가기
     */
    static exitRoom() {
        RTCClient.instance
            .logout()
            .then(() => { }).catch(err => { }).then(() => {
                hvuex({ isPublishScreen: false, isPublish: false, isPreview: RTCClient.instance.isPreview });
                hv.$router.push("/");
            });
    }
    /**
     * 미리보기
     */
    static startPreview(view) {
        return new Promise((resolve,reject)=>{
            RTCClient.instance
            .startPreview(view) // MediaStream을 얻는다
            .then(() => {                
                AppConfig.localStream = view.srcObject;
                // 현재 사용하는 카메라 
                var mediaStreamTracks = view.srcObject.getVideoTracks()[0];
                console.log("mediaStreamTracks: ", mediaStreamTracks);
                
                hvuex({ isPreview: true });
                resolve();
            })
            .catch(err => {
                reject(err);
                console.error("", err);
            });
        })
    }
    /**
     * 원격 사용자 표시
     * @param {*} data 
     */
    static showRemoteVideo(data) {
        let userInfo = RTCClient.instance.getUserInfo(data.userId);
        let video = document.getElementById(data.userId);
        let subUserId = document.getElementById("localVideo").getAttribute("subUserId");      
        if (subUserId) {
            if(subUserId == data.userId){
                video = document.getElementById("localVideo");
                let index = userInfo.streamConfigs.findIndex(item=>{ return item.label=="sophon_video_camera_large"&&item.subscribed })
                if(index==-1){
                    RTCClient.instance.subscribeLarge(data.userId).then((code)=>{
                        RTCClient.instance.setDisplayRemoteVideo(data.userId, video, code);
                    });
                    return false;  
                }
            } else {
                if(userInfo.displayName.indexOf("_老师")>-1){
                    hvuex({switchUserId:data.userId});
                }
            }
        } else {
            if(userInfo.displayName.indexOf("_老师")>-1){
                hvuex({switchUserId:data.userId});
            }
        }
        RTCClient.instance.setDisplayRemoteVideo(data.userId, video, data.code);
    }

    /**
     * 
     * @param {*} code 
     */
    static onByeMessage(code) {
        console.log(code);
        let messageTxt = "";
        if (code == 1) {
            messageTxt = "10分钟体验时间已到";
        } else if (code == 2) {
            messageTxt = "10分钟体验时间已到"; // 체험시간 10분 종료
        } else {
            messageTxt = "同一个用户ID在其他端登录"; // 다른 쪽에서 동일한 사용자 ID로 로그인
        }
        hv.$alert(messageTxt, "", {
            confirmButtonText: '确定',
            callback: action => {
                hv.$router.push("/");
            }
        });
    }
    /**
     * 显示错误
     */
    static showErrorMsg(data) {
        let resmsg = "";
        switch (data.errorCode) {
            case 10000:
                resmsg += "设备未知错误";
                break;
            case 10001:
                resmsg += "未找到音频设备";
                break;
            case 10002:
                resmsg += "未找到视频设备";
                break;
            case 10003:
                resmsg += "浏览器禁用音频设备";
                break;
            case 10004:
                resmsg += "浏览器禁用视频设备";
                break;
            case 10005:
                resmsg += "系统禁用音频设备";
                break;
            case 10006:
                resmsg += "系统禁用视频设备";
                break;
            case 10010:
                resmsg += "屏幕共享未知错误";
                break;
            case 10011:
                {
                    resmsg += "屏幕共享被禁用"; // 화면 공유가 비활성화되었습니다.
                    hvuex({ isPublishScreen: false });

                }
                break;
            case 10012:
                resmsg += "屏幕共享已取消"; // 화면 공유 취소됨
                hvuex({ isPublishScreen: false });
                if (state.data.isSwitchScreen) {
                    if (state.data.isPublishScreen) {
                        document.getElementById(RTCClient.instance.userId).srcObject = RTCClient.instance.screenStream;
                    } else {
                        document.getElementById(RTCClient.instance.userId).srcObject = AppConfig.localStream;
                    }
                } else {
                    if (state.data.isPublishScreen) {
                        document.getElementById("localVideo").srcObject = RTCClient.instance.screenStream;
                    } else {
                        document.getElementById("localVideo").srcObject = AppConfig.localStream;
                    }
                }
                if (document.getElementById(RTCClient.instance.userId).srcObject == AppConfig.localStream) {
                    document.getElementById(RTCClient.instance.userId).srcObject = null;
                }
                break;
            case 10201:
                resmsg += "自动播放失败";
                break;
            case 10300:
                resmsg += "直播拉流失败，请重新拉流";
                document.getElementById("localVideo").srcObject = null;
                break;
            default:
                break;
        }
        resmsg ? Util.toast(resmsg) : Util.toast(data);
    }
}
