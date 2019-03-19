Page({
  data: {
    // 文章标题，可能为空
    id: '',
    nextId: '',
    title: '',
    image_source: '',
    image: '',
    images: [], // 当前文章的图片集合
    data: '',
    // 屏幕的高度和宽度
    lastX: 0,
    lastY: 0,
    text: "没有滑动",
    isIPX: false, // 当前设备是否为 iPhone X
    screenHeight: 0,
    screenWidth: 0,
    // 问题
    questions: [{
      question_title: 'title',
      // answer 有可能也是数组，但是先不考虑，先考虑只有一个 answer
      answer: {
        meta: {
          image: '',
          author: '',
          bio: ''
        },
        content: {
          // 内容部分，分别有两种，一种是 p, figure
        }
      }
    }],
    // 文章的额外信息
    extra: {
      'long_comments': 0,
      'popularity': 0,
      'short_comments': 0,
      'comments': 0
    },
    // 测试富文本内容
    html: '<div class="div_class" style="line-height: 60px; color: red;">Hello&nbsp;World!</div>'
  },

  // 页面事件 ready
  onReady() {
    // wx.setNavigationBarTitle({
    //   title: '详情页面'
    // })
  },

  // 手指滑动事件
  onTouchMove(event) {
    console.log(event)
    let currentX = event.touches[0].pageX
    let currentY = event.touches[0].pageY

    console.log(currentX)
    console.log(this.data.lastX)
    let text = ""
    if ((currentX - this.data.lastX) < 0)
      text = "向左滑动"
    else if (((currentX - this.data.lastX) > 0)) {
      text = "向右滑动"

    }
      

    //将当前坐标进行保存以进行下一次计算
    this.data.lastX = currentX
    this.data.lastY = currentY
    this.setData({
      text: text,
    });
  },

  // 手指滑动事件
  onTouchStart(event) {
    console.log(event)
    this.data.lastX = event.touches[0].pageX
    this.data.lastY = event.touches[0].pageY
  },

  // ios 下自己写的向左滑动是无法触发系统特效的，自己写的向左滑动判断标准也需要改进
  onTouchEnd: function (event) {
    console.log('touch end')
    this.data.currentGesture = 0
    if (this.data.text == '向右滑动') {
      // wx.navigateBack({
      //   delta: 1
      // })
    }
  },


  // 预览图片
  onTouchImage(e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: this.data.images// 需要预览的图片http链接列表
    })
  },
  

  // 页面转发事件
  onShareAppMessage(Object) {
    var shareObj = {
      'title': this.data.title
    }
    return shareObj;
  },

  // 页面事件加载完成
  onLoad(options) {
    var that = this;
    //获取屏幕宽高
    wx.getSystemInfo({
      success: function (res) {
        let isIPX = false
        if (res.model.search('iPhone X') != -1) isIPX = true
        that.setData({
          isIPX: isIPX,
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
        });
      }
    });
    this.setData({
      id: options.id,
      nextId: options.nextId
    })
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/' + options.id,
      headers: {
        'Content-Type': 'application/json'
      },
      success(res) {
        // 因为日报返回的是富文本的内容，所以需要日报端来解析一下
        // 如果是日报之类的内容，则可能会有多了 title body 等内容，所以在切分之前，要先判断文章的结构把文章结构截取好
        if (res.data.body) {
          that.change(res.data.body)
        }

        that.setData({
          title: res.data.title,
          image_source: res.data.image_source,
          image: res.data.image
        })
      }
    })
    this.getExtra(options.id);
  },

  // 富文本正则表达式匹配转换
  change(html) {
    // ([\s\S]*?) 可以匹配换行等字符，(.*?) 是不可以的
    let questionsHtml = html.match(/<div class=\"question\">([\s\S]*?)<\/a>(\n*)<\/div>(\n*)<\/div>/g);

    // 转换之后的数据集合
    let questions = [];
    let images = []; // 图片集合

    // 循环遍历 question
    for (var i = 0; i < questionsHtml.length; i++) {
      // console.log(questionsHtml[i]);

      var question = {
        'question-title': '',
        'answer': [],
        'view-more': ''
      }

      // 截取 title 现在是截取多个
      var title = questionsHtml[i].match(/<h2.*?<\/h2>/g);
      if (title != null && title.length > 0) {
        title = title[0].substring(27, title[0].length - 5);
      } else {
        title = '';
      }
      // console.log(title);

      // 截取 answer
      let answersHtml = questionsHtml[i].match(/<div class=\"answer\">([\s\S]*?)<\/div>(\n*)<\/div>/g);
      let answers = [];

      for (var j = 0; j < answersHtml.length; j++) {
        // console.log(answersHtml[j]);

        // 截取 author
        var avatar = answersHtml[j].match(/<img class=\"avatar\"(.*?).jpg\">/g);
        var author = answersHtml[j].match(/<span class=\"author\">(.*?)<\/span>/g);
        var bio = answersHtml[j].match(/<span class=\"bio\">(.*?)<\/span>/g);

        if (avatar != null && avatar.length > 0) {
          avatar = avatar[0].substring(25, avatar[0].length - 2);
        } else {
          avatar = '';
        }

        if (author != null && author.length > 0) {
          author = author[0].substring(21, author[0].length - 7);
        } else {
          author = '';
        }

        if (bio != null && bio.length > 0) {
          bio = bio[0].substring(18, bio[0].length - 7);
        } else {
          bio = '';
        }

        // 正文，段落列表，需要添加兼容性，p标签是段落正文，figure 标签有可能内嵌图片信息 
        var contentsHtml = answersHtml[j].match(/(<p>|<figure).*?(<\/p>|<\/figure>)/g);
        // console.log('contentsHtml', contentsHtml)
        var isImage = false;
        if (contentsHtml) {
          
          for (var k = 0; k < contentsHtml.length; k++) {
            // 当前段落内部是否有图片，test() 函数返回 true or false
            isImage = /<img.*?>/.test(contentsHtml[k]);
            var temp = {
              type: '',
              content: ''
            }
            if (isImage) {
              temp.content = contentsHtml[k].match(/src=".*?"/);
              temp.content = temp.content[0].substring(5, temp.content[0].length - 1);
              temp.type = 'IMAGE';
              contentsHtml[k] = temp;
              images.push(temp.content)
            } else {
              temp.type = 'PARAGRAPH';
              temp.content = contentsHtml[k]
                // .replace(/<p>/g, '')
                // .replace(/<\/p>/g, '')
                // 不屏蔽 strong 标签
                // .replace(/<strong>/g, '')
                // .replace(/<\/strong>/g, '')
                .replace(/<a.*?\/a>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&ldquo;/g, '"')
                .replace(/&rdquo;/g, '"');
              contentsHtml[k] = temp;
            }
          }
        }
        var answer = {
          'avatar': avatar,
          'author': author,
          'bio': bio,
          'content': contentsHtml
        }
        answers[j] = answer;
      }

      var question = {
        'title': title,
        'answers': answers
      }
      questions[i] = question
    }

    this.setData({
      questions: questions,
      images: images
    })
  },

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
      }
    })
  },

  // 返回按钮，暂时修改为跳转到首页
  onBack(e) {
    console.log('点击了返回按钮');
    console.log(getCurrentPages());
    wx.switchTab({
      url: '/pages/index/index'
    })
    // wx.navigateBack({
    //   delta: 1
    // })
  },

  // 下一篇如何实现循环，一直点下一篇可以准确的直达下一篇文章
  onDown(e) {
    console.log('点击了下一篇按钮');
  },

  onLike(e) {
    console.log('点击了喜欢按钮');
    wx.showToast({
      title: '小程序端暂不支持点赞',
      icon: 'none',
      duration: 3000
    })
  },

  onShare(e) {
    console.log('点击了分享按钮');
  },

  // 跳转到评论页面
  onComment(e) {
    wx.navigateTo({
      url: '../comment/comment?id=' + this.data.id
    })
  }

})