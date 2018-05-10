// pages/room/room.js
var util = require('../../utils/util.js');
const gData = getApp().globalData;
var roomId = 0;
var ownerId = 0;
var userNum = 0;

var Stomp = require('../../utils/stomp.js').Stomp;
var socketOpen = false
var socketMsgQueue = []
function sendSocketMessage(msg) {
  console.log('send msg:')
  console.log(msg);
  if (socketOpen) {
    wx.sendSocketMessage({
      data: msg
    })
  } else {
    socketMsgQueue.push(msg)
  }
}

function closeSocket() {
  console.log('close socket')
  if (socketOpen) {
    wx.closeSocket({
      code: 0,
      reason: 'hide room',
      success: function (res) {
        console.log("closeSocket:", res);
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
}

var ws = {
  send: sendSocketMessage,
  close: closeSocket,
  onopen: null,
  onmessage: null
}
Stomp.setInterval = function () { }
Stomp.clearInterval = function () { }
var client = Stomp.over(ws);

Page({
  /**
   * 页面的初始数据
   */
  data: {
    flag_show1: true,
    flag_disabled: true,
    roomNo: 0,
    btn_style: "border-radius:60rpx;border:none;color: rgb(240,220,200);background-color: gray;opacity:0.9;",
    users: [
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
    ]
  },

  startGame: function () {
    var dest = '/topic/roomId/' + roomId;
    client.send(dest, { priority: 9 }, JSON.stringify({ type: "START" }))
    wx.navigateTo({
      url: '../game/game?roomId=' + roomId + '&users=' + JSON.stringify(this.data.users)
    })
  },

  getUserNum: function(){
    var u = this.data.users;
    var num = 0;
    for(var i = 0;i < u.length;i++)
    {
      if(u[i].id!=0)
      {
        num++;
      }
    }
    return num;
  },
  addUser: function (user) {
    if (this.findId(user.id) != -1) {
      return;
    }
    var u = this.data.users;
    for (var i = 0; i < 6; i++) {
      if (u[i].id == 0) {
        this.setData({
          ["users[" + i + "]"]: user
        });
        break;
      }
    }
    userNum++;

    //如果当前用户数量大于2，开始按钮取消disabled
    if (this.getUserNum() >= 2) {
      this.setData({
        flag_disabled: false,
        btn_style: "border-radius:60rpx;border:none;color: rgb(240,220,200);background-color: dodgerblue;opacity:0.9;"
      })
    }
    console.log("当前房间内用户：", this.data.users);
  },

  delUser: function (id) {
    var that = this;
    //删除玩家
    //成功后将玩家信息从前端清除
    var u = that.data.users;
    for (var i = 0; i < 6; i++) {
      if (u[i].id == id) {
        that.setData({
          ["users[" + i + "]"]: new util.user(0, "空位", "")
        });
      }
    }
    userNum--;

    //如果玩家数量为0，删除房间
    if (that.getUserNum() == 0) {
      wx: wx.request({
        url: '',
        data: '',
        header: {},
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },
  findId: function (id) {
    var u = this.data.users;
    for (var i = 0; i < 6; i++) {
      if (u[i].id == id) {
        return i;
      }
    }
    return -1;
  },

  //进入房间后初始化数据，包括房间内的各种信息
  initData: function () {
    var that = this;
    //连接websocket
    wx.connectSocket({
      url: 'ws://liuyifan.club:8080/webSocket',
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    })

    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
      socketOpen = true
      for (var i = 0; i < socketMsgQueue.length; i++) {
        sendSocketMessage(socketMsgQueue[i])
      }
      socketMsgQueue = []
      ws.onopen && ws.onopen()
    })

    wx.onSocketMessage(function (res) {
      console.log('收到onmessage事件:', )
      ws.onmessage && ws.onmessage(res)
    });

    var destination = '/topic/roomId/' + roomId;
    client.connect('user', 'pass', function (sessionId) {
      // 接收广播并将加入房间的新用户初始化
      client.subscribe(destination, function (body, headers) {
        var data = JSON.parse(body.body);
        if (data.type == "START") {
          if (gData.id != ownerId) {
            console.log("startGame:", data.type);
            wx.navigateTo({
              url: '../game/game?roomId=' + roomId + '&users=' + JSON.stringify(that.data.users)
            });
          }
        } else if (data.type == "USER") {
          //查询房间内所有用户的id
          util.req_findRoom({
            roomId: roomId
          }, (res) => {
            var players = res.data.info.players;
            var userIds = [];
            userIds.push(res.data.info.userId);
            for (var i = 0; i < players.length; i++) {
              userIds.push(players[i].userId);
            }
            //查询房间内所有用户的信息并加入
            util.req_findUser(userIds, (res) => {
              console.log("GET--user/find:", res);
              var users = res.data;
              for (var i = 0; i < users.length; i++) {
                that.addUser(new util.user(users[i].userId, users[i].nickName, users[i].photo))
              }
            });
          })
        }
      });
      client.send(destination, { priority: 9 }, JSON.stringify({ type: "USER", content: gData.id }));
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user = JSON.parse(options.user);
    roomId = options.roomId;
    that.setData({
      roomNo: roomId
    })
    console.log("button:", options);
    //将自己的信息广播给其他已经进入房间的用户
    if (options.isOwner == "true") {
      ownerId = user.id;
      that.addUser(user);

    } else {
      //如果不是房主，隐藏开始游戏按钮
      that.setData({
        flag_show1: false
      })
    }
    that.initData();


    console.log("roomId:", roomId);

    console.log(gData);








  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // client.disconnect(function () {
    //   console.log("stomp disconnected success");
    // });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    client.disconnect(function () {
      console.log("stomp disconnected success");
    });
    console.log("unload");
    console.log("roomId:::::::::", roomId);
    //如果用户是房主，则退出时，解散房间，否则调用退出接口
    if (ownerId != 0) {
      wx: wx.request({
        url: 'http://liuyifan.club:8080/room/dismiss',
        data: {
          roomId: roomId,
          userId: gData.id
        },
        header: { "content-Type": "application/x-www-form-urlencoded" },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          console.log("POST--room/dismiss", res);
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    } else {
      wx: wx.request({
        url: 'http://liuyifan.club:8080/room/quit',
        data: {
          roomId: roomId,
          userId: gData.id
        },
        header: { "content-Type": "application/x-www-form-urlencoded" },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          console.log("POST--room/quit", res);
        }
      })
    }


  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})