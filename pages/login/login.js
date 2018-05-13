const app = getApp()
var util = require('../../utils/util.js');
var code = null;
Page({
  onShow: function () {
    if (code == null) {
      wx.login({
        success: res => {
          if (res.code) {
            code = res.code;
          }
          else {
            console.log("login fail");
          }
        }
      })
    }
  },
  onLoad: function () {
    wx.login({
      success: res => {
        if (res.code) {
          code = res.code;
        }
        else {
          console.log("login fail");
        }
      }
    })
  },
  decode: function (userInfo){
    var that = this;
    // 登录
    if(code == null)
    {
      wx.login({
        success: res => {
          if (res.code) {
            code = res.code;
          }
          else {
            console.log("login fail");
          }
        }
      })
    }
    wx.request({
      url: 'http://liuyifan.club:8080/decryption/decodeUserInfo',
      data: {
        encryptedData: userInfo.detail.encryptedData,
        iv: userInfo.detail.iv,
        code: code
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
          code = null;
          wx.navigateTo({
            url: '/pages/index/index'
          })
        } else {
          console.log('解密失败');
        }
      }
    })
  },
  userInfoHandler: function (userInfo) {
    console.log(userInfo);
    if(userInfo.detail.errMsg.indexOf('fail')==-1)
    {
      var that = this;
      that.decode(userInfo);
    }
    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey
    //     if (res.code) {
    //       var that = this;
    //       //that.decode(userInfo.detail.encryptedData,userInfo.detail.iv,res.code);
    //       //解密用户信息 获取unionId
    //       wx.request({
    //         url: 'http://101.200.62.252:8080/decryption/decodeUserInfo',
    //         data: {
    //           encryptedData: userInfo.detail.encryptedData,
    //           iv: userInfo.detail.iv,
    //           code: res.code
    //         },
    //         method: "POST",
    //         header: {
    //           'content-type': 'application/x-www-form-urlencoded'
    //         },
    //         dataType: 'json',
    //         responseType: 'text',
    //         success: function (data) {
    //           console.log(data);
    //           if (data.data.status == 1) {
    //             var u = data.data.userInfo;
    //             app.globalData.user = new util.user(u.openId, u.nickName, u.avatarUrl);
    //             app.globalData.id = u.openId;
    //             app.globalData.icon = u.avatarUrl;
    //             app.globalData.name = u.nickName;
    //             that.register();
    //             wx.navigateTo({
    //               url: '/pages/index/index'
    //             })
    //           } else {
    //             console.log('解密失败');
    //           }
    //         }
    //       })

    //     }
    //   }
    // })
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