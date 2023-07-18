const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
    class TermTaxonomy extends Model { }
    TermTaxonomy.init(
        {
            term_taxonomy_id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            term_id: { type: DataTypes.BIGINT },
            taxonomy: { type: DataTypes.STRING },
            description: { type: DataTypes.TEXT, defaultValue: '', },
            parent: { type: DataTypes.BIGINT, defaultValue: 0, },
            count: { type: DataTypes.BIGINT, defaultValue: 0, },
        }, {
        sequelize,
        timestamps: false,
        tableName: 'wp_term_taxonomy',
        modelName: 'TermTaxonomy',
    });
    return TermTaxonomy;
};;