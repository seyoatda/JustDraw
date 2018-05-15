// pages/home/home.js
var util = require('../../utils/util.js');
var start_s;
var end_s; 
var start_c;
var end_c;
var style1= "color:rgb(240,220,200);border:2px solid rgb(240,220,200);border-radius:5px;opacity:0.8;font-family: fantasy;";
var style2 ="color:rgb(0,0,0);border:2px solid rgb(240,220,200);border-radius:5px;opacity:0.8;font-family: fantasy;background:rgb(240,220,200);";
var gData = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setShow: false,
    display: false,//是否弹出
    flags:[
      false,//加入房间弹窗是否显示
      false,//创建房间弹窗是否显示
      false //正在匹配弹窗是否显示
    ],
    
    styles:[
      style2,
      style1
    ],
    maxStyles:[
      style1,
      style1,
      style2
    ],  
    maxNum:6,
    isPrivate:false,
    plain: true,
    animationP: {},//item位移,透明度  
    focus: true,
  },
  // 滑动开始  
  touchstart: function (e) {
    start_s = e.changedTouches[0].clientY;
  },
  // 滑动结束  
  touchend: function (e) {
    end_s = e.changedTouches[0].clientY;
    if (start_s - end_s > 80) {
      this.openIt();
      this.setData({
        display: "true",
      })
    } 
    else if (start_s - end_s > 0) {
      this.setData({
        display: "false",
      })
    }
  },  
  //弹出动画
  openIt: function(){
    var ani = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    })  
    ani.translate(0, -40).opacity(1).step();  
    this.setData({
      animationP: ani.export(),
    })
  },
  //关闭弹窗
  closePage: function(){
    this.closeIt();

  },
  closeIt: function () {
    var ani = wx.createAnimation({
      duration: 300,
      timingFunction: 'linear',
      delay: 0
    })
    ani.opacity(0).step();
    this.setData({
      animationP: ani.export(),
    }) 
    setTimeout(function () {
      ani.translateY(0).step()
      this.setData({
        animationP: ani.export(),
        'display': false,
      })
    }.bind(this), 300)
  },

  showWin: function (i) {
    var animation_btn = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation_btn
    animation_btn.opacity(0.7).step()
    this.setData({
      btnAnimationJoi: animation_btn.export(),
    })
    //界面弹出
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(1).step()
    this.setData({
      animationData: animation.export(),
      ["flags["+i+"]"]: true,
    })
    animation.translateY(0).step()
    this.setData({
      animationData: animation.export(),
    });
  },
  hideWin: function (i) {
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
        ["flags["+i+"]"]: false,
      })
    }.bind(this), 300)
  },
  //拦截点击事件，空函数体，do nothing
  stop: function () {

  },
  //点击创建房间按钮时触发事件
  btnCreClicked: function () {
    this.showWin(1);
  },
  btnJoinClicked: function () {
    this.showWin(0);
  },
  vwCreClicked:function(){
    this.hideWin(1);

  },
  vwJoinClicked:function(){
    this.hideWin(0);
  },
  //点击弹窗内房间类型时触发事件
  btnPriClicked:function(e){
    var id=e.currentTarget.id.substring(7,8);
    this.setData({
      styles:[style1,style1],
      isPrivate: false,
    });
      this.setData({
        isPrivate:false,
        ["styles["+id+"]"]:style2
    });
  },
  btnMaxClicked:function(e){
    var id=e.currentTarget.id.substring(7,8);
    this.setData({
      maxStyles:[style1,style1,style1]
    });
    this.setData({
      maxNum: (parseInt(id)+1)*2,
      ["maxStyles[" + id + "]"]: style2
    });
    
  },
  //跳转至房间页面
  jump2Room: function () {
    var that = this;
    //request 查询用户是否在房间
    util.req_getPlayer({
      userId: gData.id
    }, (res) => {
      console.log("POST--player/get", res);
      if (res.data.status == "SUCCESS") {
        //request 将用户退出房间
        util.req_quitRoom({
          roomId: res.data.info.roomId,
          userId: res.data.info.userId
        }, (res) => {
          console.log("POST--room/quit", res);
          that.cbCreateRoom();
        });
      } else {
        that.cbCreateRoom();
      }
    });
  },

  //加入房间访问后台
  enterRoom: function (e) {
    var no = e.detail.value.roomNumber;
    console.log("INPUT----roomNumber:", e.detail);
    var that = this;
    //request 查询用户是否在房间
    util.req_getPlayer({
      userId: gData.id
    }, (res) => {
      console.log("POST--player/get", res);
      if (res.data.status == "SUCCESS") {
        //request 将用户退出房间
        util.req_quitRoom({
          roomId: res.data.info.roomId,
          userId: res.data.info.userId
        }, (res) => {
          console.log("POST--room/quit", res);
          that.cbEnterRoom(no);
        });
      } else {
        that.cbEnterRoom(no);
      }
    });
  },

  jump2Ran: function () {
    var that=this;
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.opacity(0.7).step()
    this.setData({
      btnAnimationRan: animation.export(),
    });
    that.setData({
      "flags[2]":true
    });
    util.req_match({
      userId:gData.id
    },res=>{
      console.log("POST----room/match:", res);
      //关闭“正在加载”弹窗
      that.setData({
        "flags[2]": false
      });
      if(res.data.status=="SUCCESS"){
        
        wx.navigateTo({
          url: '../room/room?isOwner=false&roomId=' + res.data.info.roomId + "&maxNum=" + res.data.info.maxSize,
        });
      }
    })
  },

  cbCreateRoom: function () {
    var that = this;
    //request 房主向后台申请创建房间
    util.req_createRoom({
      userId: gData.id,
      roomName: "test",
      maxSize: that.data.maxNum,
      level: 1,
      picProvided: false,
      diyEnable: false,
      appendEnable: that.data.isPrivate
    }, (res) => {
      console.log("POST--room/create", res);
      if ("ERROR" == res.data.status) {
        console.log("用户无法创建房间,错误代码：", res.data.info);
        return;
      }
      //成功之后进行跳转页面，注明房主身份
      //TODO: 封装动画
      var animation = wx.createAnimation({
        duration: 40,
        timingFunction: "linear",
        delay: 0
      })
      that.animation = animation
      animation.opacity(0.7).step()
      animation.opacity(1).step()
      that.setData({
        btnAnimationCre: animation.export(),
      })
      wx.navigateTo({
        url: '../room/room?isOwner=true&roomId=' + res.data.info + "&maxNum="+this.data.maxNum,
      })
    })
  },
  cbEnterRoom:function(no){
    //request 向后台请求加入房间
    util.req_enterRoom({
      roomId: no,
      userId: gData.id
    }, res => {
      console.log("POST--room/enter:", res);
      if ("ERROR" == res.data.status) {
        console.log("用户无法进入房间！错误代码：", res.data.info);
        return;
      }
      util.req_findRoom({
        roomId:no
      },res=>{
        console.log("POST-----room/find:",res); 
        wx.navigateTo({
            url: '../room/room?isOwner=false&roomId=' + no + '&user=' + "&maxNum=" + res.data.info.maxSize,
        })
      })
    });
  },
  //在页面加载时完成初始设置
  initData:function(){
    this.hideWin(0);
    this.hideWin(1);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData();
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
    this.initData();
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