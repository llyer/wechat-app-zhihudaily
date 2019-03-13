Page({
  data: {
    // 文章标题，可能为空
    title: '',
    // 作者头像
    avatar: '',
    // 作者
    author: '',
    // 作者简介
    bio: '',
    art: {},
    // 测试富文本内容
    html: '<div class="div_class" style="line-height: 60px; color: red;">Hello&nbsp;World!</div>'
  },

  // 页面事件 ready
  onReady() {
    wx.setNavigationBarTitle({
      title: '详情页面'
    })
  },

  // 页面事件加载完成
  onLoad(options) {
    var that = this
    wx.request({
      url: 'https://news-at.zhihu.com/api/4/news/' + options.id,
      headers: {
        'Content-Type': 'application/json'
      },
      success(res) {
        // 因为日报返回的是富文本的内容，所以需要日报端来解析一下
        // 如果是日报之类的内容，则可能会有多了 title body 等内容，所以在切分之前，要先判断文章的结构把文章结构截取好
        
        if (res.data.body) {
          var richText = res.data.body;
          // 替换转义字符
          richText.replace(/\"/g, '"')
          // g 表示替换所有字符串
          richText.replace(/<img/g, "<image mode='aspectFill'")
          // 切分多余字符
          richText = richText.substring(0, richText.lastIndexOf("<script"));
          var body = res.data.body;
          console.log(body);
          // 截取 title 现在是截取多个
          var title = body.match(/<h2.*?<\/h2>/g);

          // 截取 author
          var meta = body.match(/<div class=\"meta\">(.*?)<\/div>/g);
          var avatar = body.match(/<img class=\"avatar\">(.*?).jpg\">/g);
          var author = body.match(/<span class=\"author\">(.*?)<\/span>/g);
          author = author[0].substring(21, author[0].length - 7);
          var bio = body.match(/<span class=\"bio\">(.*?)<\/span>/g);
          bio = bio[0].substring(18, bio[0].length - 7);
          console.log(title);
          console.log(meta);
          console.log(avatar);
          console.log(author);
          console.log(bio);
          // 正文，段落列表，需要添加兼容性，p标签是段落正文，figure 标签有可能内嵌图片信息 
          body = body.match(/<p>.*?<\/p>/g);
          var ss = [];
          if (body) {
            // 思路,把原来的段落切成文章的数组,然后再把文章数组渲染出去
            // todo 动态的为所有的图片都加上 mode='aspectFill'
            // 改版后的思路,小程序目前已经提供了渲染富文本的API,所以说要把原来的渲染思路改一下,直接使用 richText 的标签
            // 如果不管是图片还是文字，都当做段落来处理的话，小图片不会被放大
            // 图片单独拿出来做判断，段落的
            for (var i = 0, len = body.length; i < len; i++) {
              // 当前段落内部是否有图片，test() 函数返回 true or false
              ss[i] = /<img.*?>/.test(body[i]);
              // console.log(ss[i]);
              var temp = {
                type: '',
                content: ''
              }
              // 有图片是 true，没有图片是 fasle
              if (ss[i]) {
                // match 就是切分成数组了
                // body[i] = body[i].match(/(http:|https:).*?\.(jpg|jpeg|gif|png)/);
                // 分解为 src 连接
                temp.content = body[i].match(/src=".*?"/);
                temp.content = temp.content[0].substring(5, temp.content[0].length - 1);
                // console.log(temp.content[0]);
                temp.type = 'IMAGE';
                body[i] = temp;
              } else {
                temp.type = 'PARAGRAPH';
                temp.content = body[i]
                  // .replace(/<p>/g, '')
                  // .replace(/<\/p>/g, '')
                  // 不屏蔽 strong 标签
                  // .replace(/<strong>/g, '')
                  // .replace(/<\/strong>/g, '')
                  .replace(/<a.*?\/a>/g, '')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/&ldquo;/g, '"')
                  .replace(/&rdquo;/g, '"');
                body[i] = temp;
              }
            }
          }
          res.data.body = body
          // console.log(body);
        }

        that.setData({
          art: res.data,
          title: title[0],
          author: author,
          bio: bio,
          richText: richText
        })
      }
    })
  }
})