// Message Buffer schema
module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timeSent: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: false, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Message;
};
