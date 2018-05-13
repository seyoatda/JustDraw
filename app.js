//app.js
//var util = require('/utils/util.js');
App({
  
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    // 前往授权登录界面
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     var that = this;
    //     console.log(res);
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           // var u = res.userInfo;
    //           // this.globalData.icon = res.userInfo.avatarUrl
    //           // this.globalData.name = res.userInfo.nickName
    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
      
    // })
  },
  
  isRegistered:function(){
    console.log("globalData.id:", this.globalData.id)
    var that=this;
    wx.request({
      url: 'http://101.200.62.252:8080/user/isRegistered',
      data: {
        userId:that.globalData.id
      },
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      dataType: 'json',
      responseType: 'text',
      success: function (data) {
        console.log("GET--user/isRegistered:",data);
        if(data.data.info=="YES"){
          that.update();
        }else{
          that.register();
        }
      }
    }) 
  },

  register:function(){
    var that = this;
    wx.request({
      url: 'http://101.200.62.252:8080/user/register',
      data: {
        userId: that.globalData.id,
        nickName:that.globalData.name,
        photo: that.globalData.icon
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      dataType: 'json',
      responseType: 'text',
      success: function (data) {
        console.log("POST--user/register:", data);
      }
    })
  },
  update:function(){

  },
  globalData: {
    user: null,
    id:1,
    icon:"",
    name:""
  }
})