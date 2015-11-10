// LetterAnswer schema
module.exports = function(sequelize, DataTypes) {
  var Answer = sequelize.define('LetterAnswer', {
    answer: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    associate: function(models) {
      Answer.belongsTo(models.WyrQuestion);
      Answer.belongsTo(models.Letter);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Answer;
};
