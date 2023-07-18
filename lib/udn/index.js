
const { tryFetch, getContentCache, unsetContentCache } = require('../helper');
const Article = require('./blog/article');
const UDN_URL = 'https://blog.udn.com';


class udn {
  $account = '';
  constructor(config) {
    const { account } = config;
    this.account = account;
  }
  getUrl(path = '') {
    return `${UDN_URL}/${this.account}/${path}`;
  }
  getArticleUrl(articleId) {
    return this.getUrl(articleId);
  }
  getArticlePageUrl(page = 1) {
    //https://blog.udn.com/blog/article/article_list_head_ajax.jsp?uid=mt112&pno=1
    return `${UDN_URL}/blog/article/article_list_head_ajax.jsp?uid=${this.account}&pno=${page}`
  }

  async getArticle(articleId) {
    const url = this.getArticleUrl(articleId);
    try {
      const content = await getContentCache(url, async () => {
        return await tryFetch(url)
      }, 'article', articleId)
      // console.log(`getArticle ${url}`)
      const article = Article.analysisContent(content);
      return {
        articleId,
        ...article
      }
    } catch (error) {
      console.log(error)
      await unsetContentCache(url, 'article', articleId);
    }
  }

  async getArticleList(page = 1) {
    const url = this.getArticlePageUrl(page);
    try {
      const content = await getContentCache(url, async () => {
        const time = new Date().getTime()
        const msec = new Date().getMilliseconds();
        console.log(`getArticleList ${url}&_=${time}${msec}`)
        return await tryFetch(`${url}&_=${time}${msec}`)
      }, 'page', page)
      try {
        return Article.analysisIdsContent(content);
      } catch (error) {
        console.log(error)
        throw error
      }
    } catch (error) {
      console.log(error)
      await unsetContentCache(url, 'page', page);
      throw error
    }
  }
  async getLastPage()
  {
    const url = this.getUrl('article');
    try {
      const content = await getContentCache(url, async () => {
        return await tryFetch(url)
      })
      return Article.analysisLastPageFromIndex(content);
    } catch (error) {
      console.log(error)
      throw error
    }   
  }
}
module.exports = udn;