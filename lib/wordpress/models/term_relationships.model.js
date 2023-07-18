const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class TermRelationship extends Model { }
  TermRelationship.init(
    {
      object_id: { type: DataTypes.BIGINT, primaryKey: true },
      term_taxonomy_id: { type: DataTypes.BIGINT }, //term_id
      term_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'wp_term_relationships',
      modelName: 'TermRelationship',
    }
  );
  return TermRelationship;
};