// Deal Provider schema
module.exports = function(sequelize, DataTypes) {
  var DealProvider = sequelize.define('DealProvider', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  }, {
    associate: function(models) {
      DealProvider.hasMany(models.Deal, {onDelete: 'CASCADE'});
    },
    timestamps: false, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return DealProvider;
};
