// Survey User Answer schema
module.exports = function(sequelize, DataTypes) {
  var Answer = sequelize.define('SurveyUserAnswer', {
    user: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    }
  }, {
    associate: function(models) {
      Answer.belongsTo(models.SurveyQuestion);
      Answer.belongsTo(models.SurveyChoice);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Answer;
};
