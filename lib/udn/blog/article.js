const cheerio = require('cheerio');
const Article = {
  analysisContent: (html) => {
    const $ = cheerio.load(html);
    const title = $('#article_show .article_topic').text();
    const content = $('#article_show_content').html();
    const createAt = $('#article_show .article_datatime').text();
    let categoryIdStr = $('#also_my a').attr('href');
    const categoryId = categoryIdStr.match(/=(\d+)$/)[1] || categoryIdStr;
    const categoryTile = $('#also_my a').text();
    // return { articleId, title, createAt, categoryId, categoryTile };
    // return { title, categoryId, categoryTile };
    return { title, content, createAt, categoryId, categoryTile };
  },
  analysisIdsContent: (html) => {

    const $ = cheerio.load(html);
    const articleListIds = [];

    $('.article_list_more a').each((i, el) => {
      let parts = $(el).attr('href').split('/');
      let articleId = parts[parts.length - 1];
      articleListIds.push(articleId);
    });
    return articleListIds;
  },
  analysisLastPageFromIndex: (html) => {
    const $ = cheerio.load(html);
    const lastPage = $('.pagenum a').last().attr('href').match(/(\d+)/)[1];
    return parseInt(lastPage, 10);
  }
}
module.exports = Article;