const TermTaxonomy = require('./term_taxonomy.model');
const TermRelationship = require('./term_relationships.model');
const Term = require('./terms.model');
const Post = require('./posts.model');
const models = [TermTaxonomy, TermRelationship, Term, Post];
module.exports = (sequelize) => {
  return models.reduce((models, modelFn) => {
    const model = modelFn(sequelize)
    return { ...models, [model.name]: modelFn(sequelize) };
  }, {});
}

