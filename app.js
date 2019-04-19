//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    this.checkSessionTimeout();
    this.refresh();
  },
  //获取session
  getSession: function () {

    var that = this;
    return new Promise(function (resolve, reject) {
      wx.showLoading({
        title: '加载中...',
      })
      wx.request({
        url: 'http://localhost:9000/sys/getSessionId',
        header: { "Content-Type": "applciation/json" },
        method: 'post',
        success: function (res) {
          console.log(res);
          var data = res.data;
          wx.hideLoading();
          // 添加到全局数据的header中
          if (res && res.header && res.header['Set-Cookie']) {
            resolve(res);
            wx.setStorageSync('cookieKey', res.header['Set-Cookie']);//保存Cookie到Storage
            wx.setStorageSync('sessiondate', Date.parse(new Date())); //保存当前的时间
            that.globalData.cookie += wx.getStorageSync('cookieKey');
            that.globalData.header.Cookie = that.globalData.cookie;
            that.globalData.headerGet.Cookie = that.globalData.cookie;
          } else {wx.getStorageSync('cookieKey')
            wx.showToast({
              title: '加载失败，请重新启动小程序',
              mask: true
            });
            reject('error');
          }
        },
        fail: function () {
          wx.hideLoading();
        }
      })


    })
  },

  //刷新session
  refresh: function () {
    var that = this;
    setInterval(that.getSession, 24 * 60 * 60 * 1000); //24小时之后刷新 刷新就清除  执行获取session 
  },

  //检查sessionid是否过期
  checkSessionTimeout: function () {
    var that = this;

    var sessionTime = wx.getStorageSync('sessiondate');
    var aftertimestamp = Date.parse(new Date())
    //如果现在的时间-保存的时间 >=24*60 分钟 （每24小时就刷新一次）
    if (aftertimestamp - sessionTime >= 24 * 60 * 60 * 1000) {

      that.removeSession();    //清除session缓存
    }

    var cookieKey = wx.getStorageSync('cookieKey');
    var sessionID = wx.getStorageSync('sessionID');

    if (cookieKey == null || cookieKey == undefined || cookieKey == '') {

      that.getSession(); //获取session

    } else {
      that.globalData.header.Cookie = cookieKey;
      that.globalData.sessionID = sessionID;
      console.log(that.globalData.header.Cookie, that.globalData.sessionID)
    }



  },

  //清除session缓存
  removeSession: function () {
    wx.removeStorageSync('cookieKey');
    wx.removeStorageSync('sessionID');
    wx.clearStorage(); //清除缓存
    wx.clearStorageSync();
  },


  //全局变量
  globalData: {
    serverPath: 'http://localhost:9000',
    cookie: 'JSESSIONID=',
    userInfo: null,
    header: { 'Cookie': '', 'content-type': 'application/json' }, //post  Cookie 
    headerGet: { 'Cookie': '', 'content-type': 'application/x-www-form-urlencoded' },//get  Cookie
  }

})