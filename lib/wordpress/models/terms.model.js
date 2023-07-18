const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
    class Term extends Model { }
    Term.init(
        {
            term_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            slug: { type: DataTypes.STRING, allowNull: false },
            term_group: { type: DataTypes.INTEGER, defaultValue: 0, },
        }, {
        sequelize,
        timestamps: false,
        tableName: 'wp_terms',
        modelName: 'Term',
    });
    return Term;
};