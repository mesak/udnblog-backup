const { DataTypes, Model } = require('sequelize');
module.exports = (sequelize) => {
    class Post extends Model { }
    Post.init(
        {
            ID: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
            post_author: { type: DataTypes.BIGINT, defaultValue: 1, },
            post_date: { type: DataTypes.DATE },
            post_date_gmt: { type: DataTypes.DATE },
            post_content: { type: DataTypes.TEXT },
            post_title: { type: DataTypes.TEXT, defaultValue: '', },
            post_excerpt: { type: DataTypes.TEXT, defaultValue: '' },
            post_name: { type: DataTypes.STRING, defaultValue: '' },
            to_ping: { type: DataTypes.STRING, defaultValue: '' },
            pinged: { type: DataTypes.STRING, defaultValue: '' },
            post_content_filtered: { type: DataTypes.TEXT, defaultValue: '' },
            post_modified: { type: DataTypes.DATE },
            post_modified_gmt: { type: DataTypes.DATE },
            guid: { type: DataTypes.STRING },
        }, {
            sequelize,
            timestamps: false,
            tableName: 'wp_posts',
            modelName: 'Post',
        });
    return Post;
};