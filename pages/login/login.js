const Toast = require('../../components/dist/toast/toast');
var wxb = require('../../utils/wxb.js');
var app = getApp();

Page({
  data: {
    isLogin: true,
    fun_id:2,
    time: '获取验证码', //倒计时 
    currentTime:61,
    userPhone: '',   //手机号码
    valatedCode: '',  //图形验证码
    codeNum: '',  //数字验证码
    tabId: 0,
    disabled: false,
    imgUrl: 'data:image/png;base64,',
    sjn: 1100,
    isFinished: false
  }, 
  onLoad: function (options) {
    // wxb.Post('http://localhost:9000/user/getCaptcha', {
    //   tokenId: that.data.sjn
    // }, function (data) {
    //   console.log(data);
    // }); 
    // wx.getExtConfig({
    //   success: function (res) {
    //     console.log(res)
    //     res.extConfig;
    //     that.setData({
    //       imgUrl: res.extConfig.apiurl + wxb.api.captcha + '?appid=' + res.extConfig.appid + '&appkey=' + res.extConfig.appkey
    //     });
    //   }
    // });
  },
  //刷新图形验证码
  getImg: function () {
    this.setData({
      sjn: Math.random(100, 100000)
    });
  },
  //tab切换
  changeTab: function(){
    var that = this;
    var id = 0;
    if(that.data.tabId == 0)  id = 1;
    that.setData({
      tabId: id
    });
  },
  //验证码倒计时
  getCode: function (options){
    var that = this;
    var currentTime = that.data.currentTime;
    if(that.data.valatedCode == ''){
      Toast({
        message: '请先输入图形验证码',
        selector: '#zan-toast-test'
      });
    }
    else{
      wxb.Post(wxb.api.getSmsCaptcha, {
        phone: that.data.userPhone
      }, function(data){
        console.log(data);
        that.setData({
          disabled: true
        });
        var interval = setInterval(function () {
          currentTime--;
          that.setData({
            time: '已发送(' + currentTime + 's)'
          })
          if (currentTime <= 0) {
            clearInterval(interval)
            that.setData({
              time: '重新发送',
              currentTime: 61,
              disabled: false
            })
          }
        }, 1000);
      });     
    }
  },
  // 验证用户手机号码
  getVerificationCode: function(e){
    var that = this;
    var reg = /^1[3|4|5|7|8][0-9]{9}$/;
    var phone = that.data.userPhone;
    var flag = reg.test(phone);
    if(flag){
      that.getCode();
    }
    else{
        Toast({
          message: '请输入正确的手机号',
          selector: '#zan-toast-test'
        }); 
    }
  },
  // 获取用户手机号码
  getUserPhone: function(e){
    var that = this;
    that.setData({
      userPhone: e.detail.value
    });
    that.formVerity();
  }, 
  //获取数字验证码
  getCodeNum: function(e){
    var that = this;
    that.setData({
      codeNum: e.detail.value
    });
    that.formVerity();
  },
  // 获取图片验证码
  getValatedCode: function (e) {
    var that = this;
    that.setData({
      valatedCode: e.detail.value
    });
    that.formVerity();
  }, 
  //验证3个数据是否填写完整
  formVerity: function(){
    var that = this
    ,phone = that.data.userPhone
    ,codeNum = that.data.codeNum
    ,valatedCode = that.data.valatedCode;
    if(phone.length == 11 && codeNum != '' && valatedCode != ''){
      that.setData({
        isFinished: true
      });
    }
  },
  //提交数据登录
  login: function(){
    var that = this;
    wxb.Post(wxb.api.login, {
      phone: that.data.userPhone,
      captchaCode: that.data.valatedCode,
      smsCode: that.data.codeNum
    }, function (data) {
      console.log(data);
    });  
    // wx.request({
    //   url: 'http://localhost:9000/user/login',
    //   method: 'post',
    //   data: {
    //     phone: that.data.userPhone,
    //     captchaCode: that.data.valatedCode,
    //     smsCode: that.data.codeNum
    //   },
    //   success(res){
    //     console.log(res);
    //   }
    // })

    if(that.data.valatedCode != that.data.codeImg.value){
      Toast({
        message: '图片验证码输入错误',
        selector: '#zan-toast-test'
      });
    }
    else{
      wxb.Post(wxb.api.login, function(data){
        if(data){
          
        }
      });
      // console.log({
      //   phone: that.data.userPhone,
      //   codeNumber: that.data.codeNum
      // })
    }
  },
  //手机号授权
  getPhoneNumber: function (e) {
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny'){
      this.setData({
        tabId: 1
      });
    }
    else{
      // 手机号登录
      Toast.loading({
        message: '登录中',
        selector: '#zan-toast-test',
        timeout: -500
      });
      wx.login({
          success: function (res) {
            if (res.code) {
              wxb.Post(wxb.api.login, {
                code: res.code
              }, function (data) {
                wxb.Post(wxb.api.getPhone, { 
                  sessionKey: data.calback.session_key,
                  iv: e.detail.iv,
                  encryptedData: e.detail.encryptedData   
                }, function(data2){
                  if(data2.phoneNumber){
                    wx.setStorageSync("userinfo", JSON.stringify(data));
                    wx.setStorageSync("isOrder", true);
                    wx.navigateBack();
                  }
                })
              });
            } else {
              wx.showToast({
                title: '拒绝了授权',
              })
            }
          }
      });
    }
  },
  //用户微信授权
  bindGetUserInfo: function(e){
    Toast.loading({
      message: '登录中',
      selector: '#zan-toast-test',
      timeout: -500
    });

    wx.login({
      success: function (res) {
        console.log("code" + res.code)
        if (res.code) {
          wxb.Post(wxb.api.wxAuth, {
            jsCode: res.code  
          }, function (data) {

            if(data.data.code == -100){
              Toast({
                message: data.data.msg,
                selector: '#zan-toast-test'
              });
            }

            if(data.data.code == 200){
              // 查看是否授权
              wx.getSetting({
                success: function (res) {
                  if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                      success: function (res) {
                        wxb.Post(wxb.api.resolveEncryptedData, {
                          ecncryptedData: res.encryptedData,
                          ivb64: res.iv
                        }, function (res) {
                          wx.setStorageSync("userinfo", JSON.stringify(res));
                          wx.setStorageSync("isOrder", true);
                          wx.navigateBack();
                        })
                      }
                    })
                  }
                }
              })
            }
          }); 
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });

    

    // wxb.login(function(res){
    //   console.log(res)
    //   wx.setStorageSync("isOrder", true);
    //   wx.navigateBack();
    // });
  }

})