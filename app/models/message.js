// Message Buffer schema
module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
    from: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    to: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sentTime: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Message;
};
