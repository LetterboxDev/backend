// Profile Question schema
module.exports = function(sequelize, DataTypes) {
  var Question = sequelize.define('ProfileQuestion', {
    owner: {
      type: DataTypes.STRING(32),
      validate: {
        notNull: true,
        notEmpty: true,
      },
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    question: {
      type: DataTypes.TEXT,
      validate: {
        notNull: true,
        notEmpty: true,
      }
    }
  }, {
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Question;
};
