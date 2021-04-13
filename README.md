# fazhitoupiao
XianNing tou piao

项目使用 `Express` 作为服务器，使用 `mysql` 数据库，`Echart` 绘图，制作统计表格。

只有两个API:

- index.html 静态网页作为入口
- stat?q=foo 接口查询 foo 关键字统计数据。该接口使用客户端缓存策略

所有接口均采用 basic auth 授权访问。

### 如何运行项目

1. 导入数据库。略
2. npm install
3. 创建 auth-users.jons 文件。这个文件用于 basic auth
<br/>文件例子：
```
{ "admin": "admin" }
```
4. node index.js -u user -p password --database=dbname
<br/>这几个参数用于指定数据库连接
