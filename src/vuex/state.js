export default {
  //所有
  data: {
    version:"",
    classNum: "",// 教室号
    userName: '',// 用户名
    userId:null,// userId
    role: null,// 角色
    client: null,// rtc 实例
    isShowSetting: false,// 구성 항목 표시 여부
    isPublish:false,
    isPreview:false,
    isPublishScreen:false, //화면 공유
    isSwitchScreen:false,// 크기 스트림을 전환할지 여부
    switchUserId:"",
    userList:[],
    supportInfo:{}
  },
  //网站基础数据
  config: {

  }
}
