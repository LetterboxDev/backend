// User WYR Question schema
module.exports = function(sequelize, DataTypes) {
  var UserQuestion = sequelize.define('UserWyrQuestion', {
    answer: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    associate: function(models) {
      UserQuestion.belongsTo(models.WyrQuestion);
      UserQuestion.belongsTo(models.UserAccount);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return UserQuestion;
};
