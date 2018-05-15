const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function user(id, name, icon) {
  this.id = id;
  this.name = name;
  this.icon = icon;
}
/**
 * http请求封装
 */

//加入房间请求
var req_enterRoom = (data, callback) => {
  wx: wx.request({
    url: 'http://liuyifan.club:8080/room/enter',
    data: data,
    header: { "content-Type": "application/x-www-form-urlencoded" },
    method: 'POST',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  })
}
//创建房间请求
var req_createRoom = (data, callback) => {
  wx: wx.request({
    url: 'http://liuyifan.club:8080/room/create',
    data: data,
    header: { "content-Type": "application/json" },
    method: 'POST',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  });
}
//退出房间请求
var req_quitRoom = (data, callback) => {
  wx.request({
    url: 'http://liuyifan.club:8080/room/quit',
    data: data,
    header: { "content-Type": "application/x-www-form-urlencoded" },
    method: 'POST',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  })
}
//开始游戏请求
var req_startGame=(data,callback)=>{
  wx.request({
    url: 'http://liuyifan.club:8080/room/startGame',
    data: data,
    header: { "content-Type": "application/x-www-form-urlencoded" },
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  })
}
//退出游戏
var req_endGame = (data, callback) => {
  wx.request({
    url: 'http://liuyifan.club:8080/endGame',
    data: data,
    header: { "content-Type": "application/x-www-form-urlencoded" },
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  })
}
//查询用户是否在房间
var req_getPlayer=(data,callback)=>{
  wx.request({
    url: 'http://liuyifan.club:8080/player/get',
    data: data,
    header: { "content-Type": "application/x-www-form-urlencoded" },
    method: 'POST',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  })
}
//解散房间
var req_dismissRoom = (data, callback) => {
  wx.request({
    url: 'http://liuyifan.club:8080/room/dismiss',
    data: data,
    header: { "content-Type": "application/x-www-form-urlencoded" },
    method: 'POST',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  })
}
//查询房间
var req_findRoom = (data, callback) => {
  wx.request({
    url: 'http://liuyifan.club:8080/room/find',
    data: data,
    header: { "content-Type": "application/x-wwww-formencoded" },
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  });
}
//查询用户
var req_findUser=(data,callback)=>{
  wx.request({
    url: 'http://liuyifan.club:8080/user/find',
    data:data,
    header: { "content-Type": "application/json" },
    method: 'POST',
    dataType: 'json',
    responseType: 'text',
    success: function (res) {
      callback(res);
    }
  });
}

module.exports = {
  formatTime: formatTime,
  user: user,
  req_enterRoom: req_enterRoom,
  req_createRoom: req_createRoom,
  req_findRoom:req_findRoom,
  req_findUser:req_findUser,
  req_dismissRoom:req_dismissRoom,
  req_getPlayer:req_getPlayer,
  req_quitRoom:req_quitRoom,
  req_startGame:req_startGame
}

