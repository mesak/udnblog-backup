
const udn = require('./lib/udn');
const config = require('./config.json');
const wpDataBase = require('./lib/wordpress');
const { sleep, getContentCache, setContentCache } = require('./lib/helper')
const udnBlog = new udn(config.udn);
const wpBlog = new wpDataBase(config.wordpress);
const dayjs = require('dayjs');

(async (udnBlog, wpBlog) => {
  await wpBlog.init()

  // 從最後一頁 取得所有文章列表
  const lastPage = await udnBlog.getLastPage();
  
  // 取得所有文章列表
  const allArticleListJSON = await getContentCache('allArticleList', async () => {
    const tmpAllArticleList = [];
    for (let page = lastPage; page > 0; page--) {
      const articleList = await udnBlog.getArticleList(page)
      if (Array.isArray(articleList)) {
        articleList.forEach((articleId) => {
          tmpAllArticleList.push(articleId)
        })
      }
    }
    tmpAllArticleList.sort();
    return JSON.stringify(tmpAllArticleList.map((articleId) => ({ id: articleId, catch: false })))
  })
  // 從快取取得所有文章列表
  const allArticleList = JSON.parse(allArticleListJSON)
  // MAP 紀錄各文章的擷取狀態
  const mapArticleList = new Map(allArticleList.map((articleItem) => [articleItem.id, articleItem]))
  // 所有文章 ID
  // console.log('allArticleList', allArticleList)

  // 取得文章內容快取
  async function oneFetchArticle(queueIsList) {
    const articleItem = queueIsList.shift();
    if (articleItem && !articleItem.catch) {
      try {
        const articleData = await udnBlog.getArticle(articleItem.id)
        const createAt = dayjs(articleData.createAt)
        articleItem.catch = true;
        articleItem.create_time = createAt.unix()
        mapArticleList.set(articleItem.id, articleItem)
        // random 1~3 sec
        // await sleep(Math.floor(Math.random() * 1500) + 500)
      } catch (e) {
        console.log(`${articleItem.id} is catch error`)
      }
    }else{
      console.log(`${articleItem.id} catch is ok`)
    }
    if( queueIsList.length % 10 === 0 ){
      setContentCache('allArticleList', JSON.stringify([...mapArticleList.values()]))
    }
    if (queueIsList.length > 0) {
      oneFetchArticle(queueIsList)
    }
  }
  
  // oneFetchArticle(allArticleList)

  // 依據 發布時間 unix time 排序
  const allArticleListSort = [...mapArticleList.values()].sort((a, b) => a.create_time - b.create_time)

  // setContentCache('allArticleList', JSON.stringify([...mapArticleList.values()]))
  // 寫入快取，以便下次多次讀取
  // setContentCache('allArticleList', JSON.stringify(allArticleListSort))


  // 測試 取得前十筆 get allArticleList 10 item
  const queueIsList = [];
  for (let i = 0; i < 10; i++) {
    const articleItem = allArticleList.shift();
    if (articleItem) {
      queueIsList.push(articleItem)
    }
  }
  
  // 將文章內容寫入 wordpress
  async function fetchArticleToWordPressPost(articleId) {
    const post = await wpBlog.getPostWithPostName(articleId)
    if( !post ){
      const articleData = await udnBlog.getArticle(articleId)
      await wpBlog.createPost(articleData)
    }
  }

  // const pushQueue = queueIsList;
  // 正式資料
  // const pushQueue = allArticleListSort
  console.log('pushQueue',pushQueue);

  (async (queueIsList)=>{
    while( queueIsList.length > 0 ){
      const {id} = queueIsList.shift();
      if( id ){
        await fetchArticleToWordPressPost(id)
      }
      console.log(id ,'db push done')
    }
  })(pushQueue)


})(udnBlog, wpBlog);

