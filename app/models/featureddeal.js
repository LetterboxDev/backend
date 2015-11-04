// Featured Deal schema
module.exports = function(sequelize, DataTypes) {
  var FeaturedDeal = sequelize.define('FeaturedDeal', {
  }, {
    associate: function(models) {
      FeaturedDeal.belongsTo(models.Deal, {onDelete: 'CASCADE'});
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return FeaturedDeal;
};
