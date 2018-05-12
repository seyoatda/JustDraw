const app = getApp()
var util = require('../../utils/util.js');
Page({
  onShow: function () {
  },
  onLoad: function () {
  },
  userInfoHandler: function (data) {
    console.log(data);
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey
        if (res.code) {
          var that = this;

          //解密用户信息 获取unionId
          wx.request({
            url: 'http://101.200.62.252:8080/decryption/decodeUserInfo',
            data: {
              encryptedData: data.detail.encryptedData,
              iv: data.detail.iv,
              code: res.code
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            dataType: 'json',
            responseType: 'text',
            success: function (data) {
              console.log(data);
              if (data.data.status == 1) {
                var u = data.data.userInfo;
                app.globalData.user = new util.user(u.openId, u.nickName, u.avatarUrl);
                app.globalData.id = u.openId;
                app.globalData.icon = u.avatarUrl;
                app.globalData.name = u.nickName;
                that.register();
                wx.navigateTo({
                  url: '/pages/index/index'
                })
              } else {
                console.log('解密失败');
              }
            }
          })

        }
      }
    })
  },
  register: function () {
    var that = this;
    wx.request({
      url: 'http://101.200.62.252:8080/user/register',
      data: {
        userId: app.globalData.id,
        nickName: app.globalData.name,
        photo: app.globalData.icon
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
  onUnload: function () {

  }
})