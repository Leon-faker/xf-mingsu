// pages/houseDetail/dianPing/dianPing.js
var wxb = require('../../../utils/wxb.js');

Page({

  /**
   * 页面的初始数据
   */
  data: { 
    commentsList: {
      "grade": 5,
      "total":3,
      "health": 5,
      "service": 5,
      "address": 5,
      "decoration": 5,
      "commentList": [
        {
          "face":"/img/index/home2.jpg",
          "name": "匿名用户",
          "add_time": "2019-04-16",
          "content": "交通便利，服务态度好，周边的商业圈发达，小吃很多，民族文化很浓厚",
          "imgUrls": ["http://api.map.baidu.com/staticimage?width=640&height=380&zoom=19&markers=116.414042,39.896781&markerStyles=L,A,0xff0000"],
          "reply":"祝您生活愉快"
        },
        {
          "face": "/img/index/home2.jpg",
          "name": "匿名用户",
          "add_time": "2019-04-16",
          "content": "交通便利，服务态度好，周边的商业圈发达，小吃很多，民族文化很浓厚",
          "imgUrls": ["http://api.map.baidu.com/staticimage?width=640&height=380&zoom=19&markers=116.414042,39.896781&markerStyles=L,A,0xff0000"],
          "reply": "祝您生活愉快"
        }
      ]
    }
  },
  prevImage(e){
    wx.previewImage({
      current: e.currentTarget.dataset.value,
      urls: e.currentTarget.dataset.imgurls,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wxb.Post(wxb.api.getComment, {
      room_id: options.id,
      type: 1
    }, function(data){
      that.setData({
        commentsList: data
      });
    })
    
  },

})