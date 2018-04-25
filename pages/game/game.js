// pages/game/game.js
var util = require('../../utils/util.js');
const app = getApp();
const ctx = wx.createCanvasContext('myCanvas')
var x, y
var radius
var countdown = 1;
var currentIndex = 0; 
var moved = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentId:0,
    currentWord:"",
    activeWidthIndex: 3,
    activeColorIndex: 0,

    time1:'',
    time2:'',

    flag_show1:false,
    flag_show2:false,
    flag_show3: false,
    flag_show4: false,

    itemWidth: [10, 20, 30, 40, 50, 60, 70],
    itemColor: ['#000000', '#ff0000', '#00ff00', '#0000ff', '#00ffff', '#ff00ff', '#ffff00','#C0C0C0','#ffffff'],
    words:["a","b","c","d"],
    users:null,
    test:[{hi:"yes"}]
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var u = JSON.parse(options.users);
    that.setData({
      users: u,
      currentId:u[0].id
    });
    console.log(u);
   
    that.count(3, 1,function(){that.whenStart();});  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var iniIndex = this.data.activeWidthIndex
    var iniWidth = this.data.itemWidth[iniIndex]
    ctx.setLineWidth(iniWidth/2.5) // 设置线宽
    radius = iniWidth/4.5
    ctx.setLineCap('round') //设置线条的端点样式
    ctx.setStrokeStyle('#000000') //描边样式
    ctx.setFillStyle('#000000') //填充样式
    
  },

  /**
   * 每轮绘画结束时调用函数，切换玩家，弹出正确答案，跳出选词窗口
   */
  whenFinish: function () {
    var that = this;
    that.clearWin();

    if (currentIndex >= 11) {
      return;
    }
    
    //弹出正确答案界面，3s后关闭
    that.showWin(2);
    that.count(3, 2,function () { 
      that.hideWin(2);
      that.whenStart();
     });
  },

  whenStart: function () {
    var that=this;
    
    console.log("currentIndex:" + currentIndex);
    console.log("currentId:" + this.data.currentId);
    console.log("userId:" + app.globalData.id);

    //设置当前画画用户id
    that.setData({
      currentId: that.data.users[currentIndex % 6].id
    })
    currentIndex++;

    //判断当前用户为绘画用户或回答用户
    if (that.data.currentId == app.globalData.id) {
      that.showWin(1);
      that.hideWin(3);

      //如果倒计时结束仍未选择词，则默认选择第一个
      that.count(3,2,function () {
        that.hideWin(1);
        that.setData({
          "currentWord": that.data.words[0]
        });
        console.log("currentWord:" + that.data.currentWord);

        that.count(3, 1,function(){
          that.whenFinish();
          });
      },function(){
        console.log(that.data.flag_show1);
        
        if(that.data.flag_show1==false){
          return true;
        }
      });
    }
    else {
      that.hideWin(1);
      that.showWin(3);
      that.count(3, 1, function () {
        that.whenFinish();
      });
    }
  },

  /**
   * 点击选词后修改当前的词，并且关闭选词窗口
   */
  btnCWClicked: function (e) {
    var id = e.target.id.substring(4, 5);
    this.setData({
      "currentWord": this.data.words[id]
    });
    console.log(this.data.currentWord);
    this.hideWin(1);
  },

  btnAnsClicked:function(){
    if(this.data.flag_show4){
      this.setData({
        "flag_show4": false
      });
    }else{
      this.setData({
        "flag_show4": true
      });
    }
  },

  /**
   * 设定倒计时时间
   */
  count: function (time, id, func, func2 = function () { return false; }) {
    var that=this;
    var countdown = time;
    that.minus1s(that, func, countdown, id, func2 = function () { return false; });
  },

  /**
   * 倒计时-1s,倒计时为0时执行函数
   */
  minus1s: function (that, func, countdown, id,func2=function(){return false;}) {
    //设置函数使倒计时中途停止
    if(func2())return;
    //倒计时为0时执行指定函数
    if (countdown == 0) {
      func();
      return;
    } else {
      that.setData({
        ["time" + id]: countdown
      })
      countdown--;

    }
    setTimeout(function () {
      that.minus1s(that, func, countdown, id);
    }
      , 1000)
  },

  showWin: function (id) {
    this.setData({
      ['flag_show' + id]: true
    });
  },

  hideWin: function (id) {
    this.setData({
      ['flag_show' + id]: false
    });
  },

  //隐藏所有窗口
  clearWin:function(){
    this.hideWin(1);
    this.hideWin(2);
    this.hideWin(3);
    this.hideWin(4);
  },

  //把点击事件拦截，啥都不用做。
  stop: function () {
  },

//坐标
  start: function (e) {
    x = e.touches[0].x
    y = e.touches[0].y
    moved = 0
  },
  move: function (e) {

    ctx.moveTo(x, y) // 设置路径起点坐标
    x = e.touches[0].x
    y = e.touches[0].y
    ctx.lineTo(x, y) // 绘制一条直线
    ctx.stroke()
    ctx.draw(true)
    moved = 1
  },
  end: function (e) {
    if(moved == 0){
      ctx.arc(x, y, radius, 0, 2 * Math.PI)//圆点
      ctx.fill()
      ctx.draw(true)
    }
  },

  setItemWidth: function (event) {
    var width = event.target.dataset.width
    ctx.setLineWidth(width/2.5)
    radius = width/4.5
    this.setData({
      activeWidthIndex: event.target.dataset.index
    })
  },

  setItemColor: function (event) {
    var color = event.target.dataset.color
    ctx.setFillStyle(color)
    ctx.setStrokeStyle(color)
    this.setData({
      activeColorIndex: event.target.dataset.index
    })
  }

})