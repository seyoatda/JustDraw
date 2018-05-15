const app = getApp()
var util = require('../../utils/util.js');
var code = null;
Page({
  data:{
    enterRoom: false,
    roomId: null,
    maxNum: null,
    visitNum: 0
  },
  onShow: function () {
    var that = this;
    that.setData({
      visitNum: that.data.visitNum + 1
    })
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
  onLoad: function (options) {
    var that = this;
    if(options.enterRoom)
    {
      that.setData({
        enterRoom: true
      })
    }
    this.data.roomId = options.roomId;
    this.data.maxNum = options.maxNum;
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
          if(that.data.enterRoom){
            //如果是从链接跳转过来的，先加入房间，然后跳入房间页面
            that.enterRoom(app.globalData);
          }else{
            //否则跳到主页面
            wx.navigateTo({
              url: '/pages/index/index'
            })
          }
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
  enterRoom: function (gData) {
    var that = this;
    var no = that.data.roomId;
    //request 查询用户是否在房间
    util.req_getPlayer({
      userId: gData.id
    }, (res) => {
      console.log("POST--player/get", res);
      if (res.data.status == "SUCCESS") {
        //request 将用户退出房间
        util.req_quitRoom({
          roomId: res.data.info.roomId,
          userId: res.data.info.userId
        }, (res) => {
          console.log("POST--room/quit", res);
          that.cbEnterRoom(no,gData);
        });
      } else {
        that.cbEnterRoom(no,gData);
      }
    });
  },
  cbEnterRoom: function (no,gData) {
    var that = this;
    //request 向后台请求加入房间
    util.req_enterRoom({
      roomId: no,
      userId: gData.id
    }, (res) => {
      console.log("POST--room/enter:", res);
      if ("ERROR" == res.data.status) {
        console.log("用户无法进入房间！错误代码：", res.data.info);
        return;
      }
      wx.navigateTo({
        url: '/pages/room/room?isOwner=false&roomId=' + no + '&user=' + JSON.stringify(gData.user) + '&maxNum=' + that.data.maxNum,
      })
    });
  },
  onUnload: function () {

  },
  toIndex: function() {
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },
  onHide: function(){
    // if(this.data.enterRoom){
    //     console.log('do something');
    // }
  }
})