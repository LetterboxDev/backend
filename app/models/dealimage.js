// Deal Image schema
module.exports = function(sequelize, DataTypes) {
  var DealImage = sequelize.define('DealImage', {
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    }
  }, {
    associate: function(models) {
      DealImage.belongsTo(models.Deal, {onDelete: 'CASCADE'});
    },
    timestamps: false, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return DealImage;
};
