// Profile Question schema
module.exports = function(sequelize, DataTypes) {
  var Question = sequelize.define('ProfileQuestion', {
    owner: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    associate: function(models) {
      Question.hasMany(models.Letter);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Question;
};
