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
    location: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'deal'
    }
  }, {
    associate: function(models) {
      Deal.belongsTo(models.DealCategory, {onDelete: 'CASCADE'});
      Deal.belongsTo(models.DealProvider, {onDelete: 'CASCADE'});
      Deal.hasMany(models.DealLike, {onDelete: 'CASCADE'});
      Deal.hasMany(models.DealImage, {onDelete: 'CASCADE'});
    },
    charset: 'utf8',
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Deal;
};
