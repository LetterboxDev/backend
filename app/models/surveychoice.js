// Survey Choice schema
module.exports = function(sequelize, DataTypes) {
  var Choice = sequelize.define('SurveyChoice', {
    choice: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    associate: function(models) {
      Choice.belongsTo(models.SurveyQuestion);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Choice;
};
