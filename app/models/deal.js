// Deal schema
module.exports = function(sequelize, DataTypes) {
  var Deal = sequelize.define('Deal', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    associate: function(models) {
      Deal.belongsTo(models.DealCategory, {onDelete: 'CASCADE'});
      Deal.belongsTo(models.DealProvider, {onDelete: 'CASCADE'});
      Deal.hasMany(models.DealLike, {onDelete: 'CASCADE'});
      Deal.hasMany(models.DealShare, {onDelete: 'CASCADE'});
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Deal;
};
