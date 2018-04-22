//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey
        if (res.code) {
          //获取openId
          wx.request({
            //自己的服务器API
            url: '',
            data: {
              js_code: res.code
            },
            success: function (res) {
              // 判断openId是否获取成功
              if (res.data.openid != null & res.data.openid != undefined) {
                console.info("登录成功返回的openId：" + res.data.openid);
                this.globalData.id = res.data.openid;
              } else {
                console.info("获取用户openId失败");
              }
            },
            fail: function (error) {
              console.info("获取用户openId失败");
              console.info(error);
            }
          })
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              this.globalData.icon = res.userInfo.avatarUrl
              this.globalData.name = res.userInfo.nickName

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
      
    })
  },
  globalData: {
    userInfo: null,
    id:"",
    icon:"",
    name:""
  }
})