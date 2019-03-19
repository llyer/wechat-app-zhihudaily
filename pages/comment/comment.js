// pages/comment/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    extra: {
      'long_comments': 0,
      'popularity': 0,
      'short_comments': 0,
      'comments': 0
    },
    'long_comments': [],
    'short_comments': []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getExtra(options.id);
    this.getLongComments(options.id);
    this.getShortComments(options.id);
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

  // https://news-at.zhihu.com/api/4/news/9708949/long-comments

  // 加载评论信息
  getExtra(id) {
    let that = this
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/story-extra/' + id,
      headers: {
        'Content-Type': 'application/json'
      },
      success(res) {
        that.setData({
          extra: res.data
        })
        wx.setNavigationBarTitle({
          title: that.data.extra.comments + ' 条点评'
        })
      }
    })
  },

  // 加载长评论信息
  getLongComments(id) {
    let that = this
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/' + id + '/long-comments',
      headers: {
        'Content-Type': 'application/json'
      },
      success(res) {
        that.setData({
          'long_comments': res.data.comments
        })
      }
    })
  },

  // 加载短评论信息
  getShortComments(id) {
    let that = this
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/' + id + '/short-comments',
      headers: {
        'Content-Type': 'application/json'
      },
      success(res) {
        that.setData({
          'short_comments': res.data.comments
        })
      }
    })
  },
})