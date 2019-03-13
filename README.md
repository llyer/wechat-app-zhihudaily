# 微信小程序-知否Daily

* 模拟知乎日报的首页，以及内容页

## 使用

克隆本项目 -> 在微信开发工具中添加项目 -> 选择项目目录

## 资源

* [官方文档](https://mp.weixin.qq.com/debug/wxadoc/dev/?t=1474644083132)
* [开发工具下载](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html?t=1474644089359)

## 已知的问题

1. index 界面宽度溢出
  已经解决，同时设定宽度百分之百和 padding left 和 right 的问题
2. detail 界面
  2.1 svg 元素兼容性问题
  2.2 figure 标签内的元素判断问题


## feature

  1. 下拉刷新
  2. 收藏，新的收藏，添加收藏等等
  3. 微信登录
