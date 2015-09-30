// Letter schema
module.exports = function(sequelize, DataTypes) {
  var Letter = sequelize.define('Letter', {
    sender: {
      type: DataTypes.STRING(32),
      validate: {
        notNull: true,
        notEmpty: true
      },
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    recipient: {
      type: DataTypes.STRING(32),
      validate: {
        notNull: true,
        notEmpty: true
      },
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    letter: {
      type: DataTypes.TEXT,
      validate: {
        notNull: true,
        notEmpty: true
      }
    }
  }, {
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Letter;
};
