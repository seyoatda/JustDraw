// pages/game/game.js
var util = require('../../utils/util.js');
const app = getApp();
const ctx = wx.createCanvasContext('myCanvas')
var x, y
var radius
var countdown = 1;
var currentIndex = 0; 
var moved = 0
var canvasSocket

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

    itemWidth: [15, 20, 25, 30, 35, 40, 45 ],
    itemColor: ['#000000', '#ff0000', '#00ff00', '#0000ff', '#00ffff', '#ff00ff', '#ffff00','#C0C0C0','#ffffff'],
    words:["a","b","c","d"],
    users:null,
    test:[{hi:"yes"}],
    userInfo1:[
      { id: "", icon: "", name: "" }, 
      { id: "", icon: "", name: "" },  
      { id: "", icon: "", name: "" }, 
    ],
    userInfo2: [
      { id: "", icon: "", name: "" }, 
      { id: "", icon: "", name: "" }, 
      { id: "", icon: "", name: "" }, 
    ]
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    that.setData({
      users: JSON.parse(options.users)
    });
    console.log(this.data.users);
    for(var i=0;i<2;i++){
      for(var j=0;j<3;j++){
        that.setData({
          ["userInfo" + (i+1) + "[" + j + "].icon"]: that.data.users[i * 3 + j].icon,
          ["userInfo" + (i+1) + "[" + j + "].name"]: that.data.users[i * 3 + j].name
        })
      }
    }  
    that.count(60, 1,function(){that.whenStart();});   

    //画布socket
    canvasSocket = wx.connectSocket({
      url: 'ws://120.78.200.1:8080/JustDrawServer/canvas'
    })
    canvasSocket.onOpen(function (res) {
      console.log('WebSocket连接已打开！')
    })
    canvasSocket.onError(function (res) {
      console.log('WebSocket连接打开失败，请检查！')
    })
    canvasSocket.onMessage(function (res) {
      console.log('收到服务器内容：' + res.data)
      if (res.data.length < 8 || res.data.substring(0, 7) != "canvas:"){
        return false
      }
      var nums = res.data.substring(7).split(",");
      if (nums.length == 4) {
        if(nums[0]==nums[2]&&nums[1]==nums[3]){
          x = nums[0]
          y = nums[1]
          ctx.moveTo(x,y) //圆心
          ctx.arc(x, y, radius, 0, 2 * Math.PI)//圆点
          ctx.fill()
        }
        else{
          ctx.moveTo(nums[0], nums[1]) // 设置路径起点坐标
          ctx.lineTo(nums[2], nums[3]) // 绘制一条直线
          ctx.stroke()
        }
        ctx.draw(true)
      }
      else if(nums.length == 2){
        //nums[0]=1,2,3；分别进行线宽、颜色、清空操作
        if(nums[0] == 1){
          var width = that.data.itemWidth[nums[1]]
          ctx.setLineWidth(width / 2.5)
          radius = width / 4.5
          that.setData({
            activeWidthIndex: nums[1]
          })
        }
        else if(nums[0] == 2){
          var color = that.data.itemColor[nums[1]]
          ctx.setFillStyle(color)
          ctx.setStrokeStyle(color)
          that.setData({
            activeColorIndex: nums[1]
          })
        }
        else if(nums[0] == 3){
          /*wx.showModal({
            title: '提示',
            content: '确认清除画板所有内容',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定');
                ctx.draw();
              }
            }
          })*/
          ctx.draw();
        }
      }
    })
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
    var msg = "canvas:"
    msg += x + "," + y
    x = e.touches[0].x
    y = e.touches[0].y
    ctx.lineTo(x, y) // 绘制一条直线
    ctx.stroke()
    ctx.draw(true)
    moved = 1
    msg += "," + x + "," + y
    canvasSocket.send({ data: msg })
  },
  end: function (e) {
    if(moved == 0){
      ctx.moveTo(x, y) //圆心
      ctx.arc(x, y, radius, 0, 2 * Math.PI)//圆点
      ctx.fill()
      ctx.draw(true)
      var msg = "canvas:"
      msg += x+","+y+","+x+","+y
      canvasSocket.send({ data: msg })
    }
  },

  setItemWidth: function (event) {
    var width = this.data.itemWidth[event.target.dataset.index]
    ctx.setLineWidth(width / 2.5)
    radius = width / 4.5
    this.setData({
      activeWidthIndex: event.target.dataset.index
    })
    var msg = "canvas:1," + event.target.dataset.index
    canvasSocket.send({ data: msg })
  },

  setItemColor: function (event) {
    var color = this.data.itemColor[event.target.dataset.index]
    ctx.setFillStyle(color)
    ctx.setStrokeStyle(color)
    this.setData({
      activeColorIndex: event.target.dataset.index
    })
    var msg = "canvas:2," + event.target.dataset.index
    canvasSocket.send({ data: msg })
  },

  erase:function(event){
    //白色
    var color = this.data.itemColor[8]
    ctx.setFillStyle(color)
    ctx.setStrokeStyle(color)
    this.setData({
      activeColorIndex: 8
    })
    var msg = "canvas:2,8"
    canvasSocket.send({ data: msg })
  },

  clearAll: function () {
    ctx.draw();
    var msg = "canvas:3,"
    canvasSocket.send({ data: msg })
  }

})