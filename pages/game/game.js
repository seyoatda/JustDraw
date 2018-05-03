// pages/game/game.js
var util = require('../../utils/util.js');
const app = getApp();
const ctx = wx.createCanvasContext('myCanvas')
var x, y
var radius
var countdown = 1;
var moved = 0
var canvasSocket
var roomId

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentId:0,
    currentIndex: 0,
    currentWord:"",
    activeWidthIndex: 3,
    activeColorIndex: 0,
    globalData: app.globalData,

    time1:'',
    time2:'',

    flag_show1:false,
    flag_show2:false,
    flag_show3: false,
    flag_show4: false,
    flag_show5:false,

    itemWidth: [15, 20, 25, 30, 35, 40, 45 ],
    itemColor: ['#000000', '#ff0000', '#00ff00', '#0000ff', '#00ffff', '#ff00ff', '#ffff00','#C0C0C0','#ffffff'],
    words:["a","b","c","d"],
    users:null,
    test:[{hi:"yes"}],
    txt:"",
    score:[0,0,0,0,0,0]
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var u = JSON.parse(options.users);
    roomId = options.roomId
    
    that.setData({
      users: u,
      currentId:u[0].id
    });

    //画布socket
    canvasSocket = wx.connectSocket({
      url: 'ws://120.78.200.1:8080/JustDrawServer/canvas/'+roomId
    })
    canvasSocket.onOpen(function (res) {
      console.log('canvasSocket连接已打开！')
    })
    canvasSocket.onClose(function (res) {
      console.log('canvasSocket连接已关闭！')
    })
    canvasSocket.onError(function (res) {
      console.log('canvasSocket连接出错，请检查！')
    })
    canvasSocket.onMessage(function (res) {
      console.log('收到服务器内容：' + res.data)
      if (res.data.length < 8 || res.data.substring(0, 7) != "canvas:"){
        return false
      }
      var msg = res.data.substring(7)
      var nums = msg.split(",")
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
        //4，选词信息
        else if(nums[0] == 4){
          that.setData({
            "currentWord": that.data.words[nums[1]]
          });
        }
        //5,回答正确
        else if(nums[0] == 5){
          var i = parseInt(nums[1])
          that.data.score[i] += 2
          that.setData({
            score: that.data.score
          })
          that.hideWin(1);
          that.count(30, 1, function () {
            that.whenFinish();
          });
        }
      }
    })

    that.whenStart();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("离开绘画页面！")
    canvasSocket.close();//关闭canvasSocket
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
    that.setData({
      currentIndex: that.data.currentIndex + 1
    })
    while (that.data.users[that.data.currentIndex % 6].id == 0) {
      that.setData({
        currentIndex: that.data.currentIndex + 1
      })
    }
    

    //弹出正确答案界面，3s后关闭
    that.showWin(2);
    that.count(3, 2, function () {
      that.hideWin(2);
      
      //只循环一轮
      if (that.data.currentIndex >= 0) {
        //canvasSocket.close();
        that.showWin(5);
        that.hideWin(2);
        /*
        wx.redirectTo({
          url: '../home/home',
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
        */
      }
      else{
        that.whenStart();
      }
    }); 
    
  },

  //返回主界面按钮
  btnBack: function(){
    wx.redirectTo({
      url: '../home/home',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  whenStart: function () {
    var that=this;
    
    console.log("currentIndex:" + that.data.currentIndex);
    console.log("currentId:" + that.data.currentId);
    console.log("userId:" + app.globalData.id);

    //设置当前画画用户id,设置index
    that.setData({
      currentId: that.data.users[that.data.currentIndex % 6].id,
    })

    //重置画布
    ctx.draw()

    //选词默认选择第一项
    that.setData({
      "currentWord": that.data.words[0]
    });

    that.showWin(1);
    //判断当前用户为绘画用户或回答用户
    if (that.data.currentId != app.globalData.id) {
      that.showWin(3);
    }

    //如果倒计时结束仍未选择词，则默认选择第一个
    that.count(10, 2, function () {
      that.hideWin(1);

      console.log("currentWord:" + that.data.currentWord);

      that.count(30, 1, function () {
        that.whenFinish();
      });
    }, function () {
      console.log("flag_show1:"+that.data.flag_show1);
      if (that.data.flag_show1 == false) {
        return true;
      }
    });
  },

  /**
   * 点击选词后修改当前的词，并且关闭选词窗口
   */
  btnCWClicked: function (e) {
    var that = this;
    var id = e.target.id.substring(4, 5);
    this.setData({
      "currentWord": this.data.words[id]
    });
    var msg = "canvas:4,"+id
    canvasSocket.send({ data: msg })
    this.hideWin(1);
    this.count(3, 1, function () {
      that.whenFinish();
    });
  },

  btnAnsClicked:function(){
    if(this.data.flag_show4){
      if (this.data.currentWord == this.data.txt) {
        var i = 0;
        while (i < 6) {
          if (this.data.users[i].id == app.globalData.id) {
            //this.data.score[i] = this.data.score[i] + 2
            this.data.score[i] += 2
            this.setData({
              score: this.data.score
            })
            console.log("score:" + this.data.score[i])
            break;
          }
          i++;
        }
        var msg = "canvas:5," + i
        canvasSocket.send({ data: msg })
      }
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
    that.minus1s(that, func, countdown, id, func2);
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
      that.minus1s(that, func, countdown, id ,func2);
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
    if (this.data.currentId != app.globalData.id) {
      return false
    }
    x = e.touches[0].x
    y = e.touches[0].y
    moved = 0
  },
  move: function (e) {
    if (this.data.currentId != app.globalData.id) {
      return false
    }
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
    if (this.data.currentId != app.globalData.id) {
      return false
    }
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
    if (this.data.currentId != app.globalData.id) {
      return false
    }
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
    if (this.data.currentId != app.globalData.id) {
      return false
    }
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
    if (this.data.currentId != app.globalData.id) {
      return false
    }
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
    if (this.data.currentId != app.globalData.id){
      return false
    }
    ctx.draw();
    var msg = "canvas:3,"
    canvasSocket.send({ data: msg })
  },

  listenerTxtInput: function (e) {
    this.setData({
      txt:e.detail.value
    })

  }

})