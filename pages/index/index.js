const app = getApp()

var intervals;
Page({
  data: {
    time: 3
  },

  onShow:function(){
    var animation = wx.createAnimation({
      duration: 1500,
      timingFunction: 'linear',
    })

    this.animation = animation
    this.setData({
      animationData: animation.export()
    })
    var n = 1;

    intervals=setInterval(function () {
      n = 1-n;
      this.animation.opacity(n).step()
      this.setData({
        animationData: this.animation.export()
      })
    }.bind(this), 1500)
  },
  linktohome: function () {
    wx.redirectTo({
      url: '../home/home'
    })

    clearInterval(intervals);
  },
  onLoad: function () {
    var count = setInterval(() => {
      this.setData({
        time: this.data.time - 1
      });
      if (this.data.time == 0) {
        wx.switchTab({
          url: '../home/home',
          complete: function (res) {
          }
        })
        clearInterval(count);
      }
    }, 1000);
  }
})