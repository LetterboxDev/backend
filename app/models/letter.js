// Letter schema
module.exports = function(sequelize, DataTypes) {
  var Letter = sequelize.define('Letter', {
    sender: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    recipient: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    letter: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    associate: function(models) {
      Letter.belongsTo(models.ProfileQuestion);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Letter;
};
