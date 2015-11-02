// Deal Like schema
module.exports = function(sequelize, DataTypes) {
  var DealLike = sequelize.define('DealLike', {
  }, {
    associate: function(models) {
      DealLike.belongsTo(models.Deal, {onDelete: 'CASCADE'});
      DealLike.belongsTo(models.UserAccount, {onDelete: 'CASCADE'});
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return DealLike;
};
