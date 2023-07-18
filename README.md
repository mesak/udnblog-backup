# udn blog crawler

預防 Blog 網站關閉，將文章備份到本地端，目前可以暫時轉換到 Wordpress

## 使用方式

### 安裝

```bash
npm install
```

### 設定 config.json

目前設計本地端有一個 docker 可以連線到 wordpress 的 mysql

如果只是要抓資料可以不用設定 wordpress 的資料庫

udn 單純只爬帳號的文章，所以只要設定帳號即可

```json
{
  "wordpress": {
    "host": "host.docker.internal",
    "port": "3306",
    "database": "exampledb",
    "user": "exampleuser",
    "password": "examplepass"
  },
  "udn": {
    "account": "webadmin",
    "reTryTimes": 3,
    "sleepTime": 1500
  }
}
```

### 執行

```bash
node index
```

## TODO

- [x] 抓取總頁數
- [x] 抓取該頁數的文章ID
- [x] 抓取文章內容
- [x] 抓取功能快取到本地端，下次執行時先讀取快取
- [ ] 轉換到 Wordpress
- [ ] 文章圖片抽取

