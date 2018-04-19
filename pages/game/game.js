// pages/game/game.js
const ctx = wx.createCanvasContext('myCanvas')
var x, y
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName:1,
    userPic1:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    wx.getUserInfo({
  
      success: function (res) {
        var userInfo = res.userInfo
        that.setData({
          userName: userInfo.nickName,
          userPic1: userInfo.avatarUrl
        })
      }
    })

    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    ctx.setLineWidth(6) // 设置线宽
    ctx.setLineCap('round') //设置线条的端点样式
    ctx.setStrokeStyle('#000000') //描边样式
    ctx.setFillStyle('#000000') //填充样式
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

  //坐标
  start: function (e) {
    x = e.touches[0].x
    y = e.touches[0].y
    
  },
  move: function (e) {

    ctx.moveTo(x, y) // 设置路径起点坐标
    x = e.touches[0].x
    y = e.touches[0].y
    ctx.lineTo(x, y) // 绘制一条直线
    ctx.stroke()
    ctx.draw(true)

  },
  end: function (e) {
    
    ctx.arc(x ,y , 3, 0, 2 * Math.PI)//圆点
    ctx.fill()
    ctx.draw(true)
  }

})