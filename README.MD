# 自定义小说爬取阅读
平时有看小说打发时间的习惯，手机阅读app有广告，网站网页阅读不能缓存，所以想到自己写一个轻量级的，合自己心意的。开始想开发app，不过想到自己不会原生开发，hybird架构不可避免的安装包会比较大，最终决定做成pwa网站，使用IndexedDB缓存小说内容。

涉及技术：
- python爬虫
- json-server构建api服务
- react网页开发
- IndexedDB存取数据

### python爬虫
python版本为python3，使用`urllib`爬取网页，`BeautifulSoup`处理网页内容提取。

### json-server
`json-sever`链接：[https://github.com/typicode/json-server](https://github.com/typicode/json-server)

### react使用
目前新版本通过`create-react-app`生成的react项目已经支持pwa，相关文件包括：
- `/public/manifest.json`
- `/src/serviceWorker.js`
- `/src/index.js`中默认不开启pwa
```
serviceWorker.unregister();
```
修改为
```
serviceWorker.register();
```

### pwa带来的优势
有了pwa，我们就可以在手机上生成一个和app看起来一样的图标，每次不需要输入网址，点击图标就可以愉快的阅读了。

### 部署启动
1. 爬取网站，保存内容到json文件
```
$ cd api
$ python book.py
```
如果部署在`linux`服务器，使用`crontab`命令设置定时爬取网站：
```
#打开crontab编辑
$ crontab -e

#每一小时爬取一次
0 */1 * * * python3 /home/xxx/book-pwa/api/book.py
```

2. 启动api服务
其实api服务的`package.json`已经设置好了, 可以直接启动`npm start`
```
$ cd api
$ npm start
```
文件`book.json`更新后api服务不会自动重启，所以`linux`服务器如果安装有`pm2`, 可以这样设置：
```
#启动pm2服务
$ pm2 start npm --book "app" -- start

#打开crontab编辑
$ crontab -e

#每一小时重启一次api服务并执行爬取
0 */1 * * * pm2 restart book
```

3. 生成react网站
```
$ cd web
$ npm run build
```
然后将生成的build文件夹部署到服务器即可。


