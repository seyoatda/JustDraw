// pages/room/room.js
var util = require('../../utils/util.js');
const gData = getApp().globalData;
var ownerId=0;
var userNum=0;


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
      url: '../game/game?users='+JSON.stringify(this.data.users)
    })
  },

  addUser:function(user){
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
    for (var i = 0; i < 6; i++) {
      if (u.id == id) {
        return i;
      }
    }
  },

  //进入房间后初始化数据，包括房间内的各种信息
  initData:function(){
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var user = JSON.parse(options.user);
    if(options.isOwner=true){
      ownerId = user.id;
    }
    console.log(ownerId);
    that.addUser(user);
    
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