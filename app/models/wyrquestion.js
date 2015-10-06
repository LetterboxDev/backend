// WYR Question schema
module.exports = function(sequelize, DataTypes) {
  var Question = sequelize.define('WyrQuestion', {
    option0: {
      type: DataTypes.STRING,
      allowNull: false
    },
    option1: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    associate: function(models) {
      Question.hasMany(models.UserWyrQuestion);
    },
    timestamps: false, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Question;
};
