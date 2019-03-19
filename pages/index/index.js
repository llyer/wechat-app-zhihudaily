//index.js
//获取应用实例
var app = getApp()
var utils = require('../../utils/util.js')
Page({
  data: {
    list: [],
    duration: 500,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    loading: false,
    plain: false
  },

  // 页面转发事件
  onShareAppMessage(Object) {
    var shareObj = {
      'title': '每天三次，每次七分钟'
    }
    return shareObj;
  },

  // 加载日报内容，加载的是最新的内容
  onLoad() {
    this.fetchArticles()

    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function(userInfo){
    //   //更新数据
    //   that.setData({
    //     userInfo:userInfo
    //   })
    // })

  },

  // 下拉刷新
  onPullDownRefresh() {
    // 上拉刷新 
    if (!this.loading) {
      // 加载更多内容
      this.fetchArticles()
      // 处理完成后，终止下拉刷新
      wx.stopPullDownRefresh()
      // console.log('加载内容完成');
    }
  },

  // 上拉加载
  onReachBottom() {
    // 下拉触底，先判断是否有请求正在进行中 // 以及检查当前请求页数是不是小于数据总页数，如符合条件，则发送请求 
    this.loadMore()
    console.log('上拉加载更多内容完成')
  },

  // 加载更多，加载之前的日报
  loadMore(e) {
    if (this.data.list.length === 0) return
    var date = this.getNextDate()
    var that = this
    that.setData({
      loading: true
    })
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/before/' + (Number(utils.formatDate(date)) + 1),
      headers: {
        'Content-Type': 'application/json'
      },
      success(res) {
        that.setData({
          loading: false,
          list: that.data.list.concat([{
            header: utils.formatDate(date, '-')
          }]).concat(res.data.stories)
        })
      }
    })
  },

  // 获取下个日期
  getNextDate() {
    const now = new Date()
    now.setDate(now.getDate() - this.index++)
    return now
  },

  // 加载文章
  fetchArticles() {
    let that = this
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/latest',
      headers: {
        'Content-Type': 'application/json'
      },
      success(res) {
        that.setData({
          // 顶部 swiper 内容
          banner: res.data.top_stories,
          // 中间 list 内容
          list: res.data.stories
        })
        // 如果文章内容过少，加载更多
        if (that.data.list != null && that.data.list.length <= 5) {
          that.loadMore()
        }
      }
    })
    this.index = 1
  }

})