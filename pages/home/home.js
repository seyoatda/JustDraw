// pages/home/home.js
var util = require('../../utils/util.js');
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

var gData=getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setShow:false,
    plain:true
  },
  showWin:function(){
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(0).step()
    animation.opacity(1).step()
    this.setData({
      animationData: animation.export(),
      'setShow': true
    })
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
  },
  hideWin: function () {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(0).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        'setShow':false
      })
    }.bind(this), 300)
  },
  stop:function(){

  },
  jump2Room:function(){
    
    //房主向后台申请创建房间
    
    //
    wx:wx.request({
      url: 'http://101.200.62.252:8080/room/create',
      data: {
        userId:gData.id,
        roomName:"test",
        maxSize:6,
        level:1,
        picProvided:false,
        diyEnable:false,
        appendEnable:false
      },
      header: { "content-Type": "application/json"},
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        console.log("create room success")
        console.log(res);

        wx.connectSocket({
          url: 'ws://101.200.62.252:8080/websocket',
          success: function (res) {
            console.log("socketsuccess")
            console.log(res);
          },
          fail: function (res) {
            console.log(res);
          }
        })

        var destination = '/topic/room'+res.data.info;
        client.connect('user', 'pass', function (sessionId) {
          console.log('sessionId', sessionId)
          client.subscribe(destination, function (body, headers) {
            console.log('From MQ:', body);
          });
          client.send(destination, { priority: 9 }, 'hello workyun.com !');
        })
        
        //成功之后进行跳转页面，注明房主身份
        wx.navigateTo({
          url: '../room/room?isOwner=true&user='+JSON.stringify(gData.user),
        })
      },
      fail: function(res) {
        console.log("fail");
        console.log(res);
      },
      complete: function(res) {
        console.log("complete");
      },
    })
  },
  //加入房间访问后台
  enterRoom:function(e){
    var no = e.detail.roomNumber;
    wx:wx.request({
      url: 'http://101.200.62.252:8080//room/enter',
      data: {
        roomId:no,
        userId: gData.id
      },
      header: { "content-Type": "application/json"},
      method: 'POST',
      dataType: 'json',
      responseType: 'json',
      success: function(res) {
        wx.navigateTo({
          url: '../room/room?isOwner=false & user=' + JSON.stringify(gData.user),
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  
  },
  
})