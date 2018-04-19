// pages/room/room.js
Page({


  /**
   * 页面的初始数据
   */
  data: {
  
  },

  startGame:function(){
    wx.redirectTo({
      url: '../game/game',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.connectSocket({
      url: "",
    })

    //连接成功
    wx.onSocketOpen(function () {
      wx.sendSocketMessage({
        data: 'stock'
      })
    })

    //获取其他用户信息
    wx.onSocketMessage(function (data) {
      var obj=JSON.parse(data.data);
    })

    wx.onSocketError(function () {
      console.log('websocket连接失败！');
    })

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