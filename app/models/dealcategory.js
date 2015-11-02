// Deal Category schema
module.exports = function(sequelize, DataTypes) {
  var DealCategory = sequelize.define('DealCategory', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    }
  }, {
    associate: function(models) {
      DealCategory.hasMany(models.Deal, {onDelete: 'CASCADE'});
    },
    timestamps: false, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return DealCategory;
};
