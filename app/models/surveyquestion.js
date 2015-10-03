// Survey Question schema
module.exports = function(sequelize, DataTypes) {
  var Question = sequelize.define('SurveyQuestion', {
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    minAnswers: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    maxAnswers: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    validate: {
      minLessThanMax: function() {
        if (this.minAnswers > this.maxAnswers) {
          throw new Error('minAnswers must be less than or equal to maxAnswers');
        }
      }
    },
    associate: function(models) {
      Question.hasMany(models.SurveyChoice);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Question;
};
