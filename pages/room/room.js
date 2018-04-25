// pages/room/room.js
var util = require('../../utils/util.js');
const gData = getApp().globalData;
var roomId=0;
var ownerId=0;
var userNum=0;

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

var ws = {
  send: sendSocketMessage,
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
    
    users:[
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
      new util.user(0, "空位", ""),
    ]
  },

  startGame:function(){
    wx.redirectTo({
      url: '../game/game?roomId='+roomId+'&users='+JSON.stringify(this.data.users)
    })
  },

  addUser:function(user){
    if(this.findId(user.id)!=-1){
      return;
    }
    var u = this.data.users;
    for(var i=0;i<6;i++){
      if(u[i].id == 0){
        this.setData({
          ["users[" + i + "]"]: user
        });
        break;
      }
    }
    userNum++;
    console.log(this.data.users);
  },

  delUser:function(id){
    var that=this;
    //删除玩家
    wx:wx.request({
      url: '',
      data: '',
      header: {},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {

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
        if (userNum == 1) {
          var u = this.data.users;
          for (var i = 0; i < 6; i++) {
            if (u[i].id != 0) {
              ownerId = u[i].id;
            }
          }
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })

    //如果玩家数量为0，删除房间
    if(userNum == 0){
      wx:wx.request({
        url: '',
        data: '',
        header: {},
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    }
  },
  findId:function(id){
    var u=this.data.users;
    for (var i = 0; i < 6; i++) {
      if (u[i].id == id) {
        return i;
      }
    }
    return -1;
  },
  
  //进入房间后初始化数据，包括房间内的各种信息
  initData:function(){
    var that=this;
    // //进入房间时，先获取房间内所有用户的信息，进行初始化
    // wx.request({
    //   url: 'http://101.200.62.252:8080/room/find',
    //   data: {
    //     roomId: roomId
    //   },
    //   header: { "content-Type": "application/x-www-form-urlencoded" },
    //   method: 'POST',
    //   dataType: 'json',
    //   responseType: 'text',
    //   success: function (res) {
    //     console.log("hPOST--room/find:", res);

    //     var players = res.data.info.players;
    //     players.push(res.data.info.userId);
    //     console.log("players:", players);
        
    //   },
    //   fail: function (res) { },
    //   complete: function (res) { }
    // })
    //连接websocket
    wx.connectSocket({
      url: 'ws://101.200.62.252:8080/webSocket',
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
        // 接收广播并将加入房间的新用户初始化
      console.log("body:", res.data.version);
        if(res.type=="ROOM_MESSAGE"){
          wx.request({
            url: 'http://101.200.62.252:8080/user/find',
            data: {
              userIds: users
            },
            header: { "content-Type": "application/x-www-form-urlencoded" },
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            success: function (res) {
              console.log("GET--user/find:", res);
              var users = res.data;
              for (var i = 0; i < users.length; i++) {
                that.addUser(new user(users[i].userId, users[i].nickName, users[i].photo))
              }
            }
          });
        }
      
      
  
    })
    
    var destination = '/topic/roomId/' + roomId;
    client.connect('user', 'pass', function (sessionId) {
      console.log('sessionId', sessionId)
      client.subscribe(destination, function (body, headers) {
        
        
      });
    })

    
  },
  dismiss:function(){
    wx: wx.request({
      url: 'http://101.200.62.252:8080/room/dismiss',
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var user = JSON.parse(options.user);
    roomId = options.roomId;
    //将自己的信息广播给其他已经进入房间的用户

    if (options.isOwner = true) {
      ownerId = user.id;
      
      that.initData();
      that.addUser(user);
    } else {
      that.initData();
    }
    

    console.log("roomId:",roomId);

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
   
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
      wx:wx.closeSocket({
        code: 0,
        reason: 'leave room',
        success: function(res) {
          console.log("closeSocket:",res);
        },
        fail: function(res) {},
        complete: function(res) {},
      })
      console.log("unload");
      console.log("roomId:::::::::", roomId)
      var that = this;
      wx: wx.request({
        url: 'http://101.200.62.252:8080/room/dismiss',
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