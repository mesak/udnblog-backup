const Sequelize = require('sequelize');
const defineModels = require('./models');
const { getContentCache, unsetContentCache } = require('./../../lib/helper');
const dayjs = require('dayjs')
class wordpress {
  sequelize;
  models;
  categoryList = new Map()
  constructor(config) {
    const { host, port, user, password, database } = config;
    this.sequelize = new Sequelize(database, user, password, {
      dialect: 'mysql',
      host,
      port,
      logging: true,
    });
    this.models = defineModels(this.sequelize);
  }

  async init() {
    await this.reBuildCategory();
  }
  async reBuildCategory() {
    await unsetContentCache('categoryList')
    await this.getCategoryList()
  }
  async getCategoryList() {
    this.categoryListJSON = await getContentCache('categoryList', async () => {
      const categoryList = await this.models.Term.findAll()
      return JSON.stringify(categoryList)
    })
    this.categoryList = new Map(JSON.parse(this.categoryListJSON).map((category) => [category.slug, category.term_id]))
  }
  // 根據slug 從快取取得分類id
  async getCategoryIdBySlug(slug, name) {
    if (this.categoryList.has(slug)) {
      return this.categoryList.get(slug)
    } else {
      const termId = await this.termFindOrCreateId(slug, name)
      this.categoryList.set(slug, termId)
      return termId
    }
  }

  /**
   *  取得分類標籤
   * @param {*} slug 
   * @returns 
   */
  getTermBySlug(slug) {
    return this.models.Term.findOne({
      where: {
        slug
      }
    })
  }

  /**
   *  取得或產生分類標籤
   * @param {*} name 
   * @param {*} slug 
   * @param {*} type 
   * @returns 
   */
  async termFindOrCreateId(slug, name, type = "category") {
    const [term, created] = await this.models.Term.findOrCreate({
      where: {
        slug
      },
      defaults: {
        name,
        slug
      }
    });
    // console.log('created', created)

    if (created) {

      const termTaxonomy = await this.models.TermTaxonomy.create({
        term_id: term.term_id,
        taxonomy: type
      })

      return term.term_id
    } else {
      return term.term_id
    }
  }
  /**
   * 取得文章
   * @param {*} postSlug 
   * @returns 
   */
  async getPostWithPostName(postSlug) {
    const post = await this.models.Post.findOne({
      where: {
        post_name: postSlug
      }
    })
    return post
  }
  /**
   * 建立文章
   * @param {*} articleData
   * @returns
   *  
   */
  async createPost(articleData) {
    const termId = await this.getCategoryIdBySlug(articleData.categoryId, articleData.categoryTile)
    // console.log('termId', termId)
    const createAt = dayjs(articleData.createAt).format('YYYY-MM-DD HH:mm:ss') // 建立日期
    // console.log(createAt)
    const content = `<!-- wp:html -->\n${articleData.content}\n<!-- /wp:html -->`
    const post = await this.models.Post.create({
      post_date: createAt,
      post_date_gmt: createAt,
      post_content: content,
      post_title: articleData.title,
      post_name: articleData.articleId,
      post_modified: createAt,
      post_modified_gmt: createAt,
      guid: `http://localhost:9680/${articleData.articleId}`,
    })
    // console.log('post',post)
    await this.models.TermRelationship.create({
      object_id: post.ID,
      term_taxonomy_id: termId,
      term_order: 0,
    })
    return post
  }
}
module.exports = wordpress;