// Message schema
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
    type: {
      type: DataTypes.STRING,
      isIn: [['message', 'share']],
      allowNull: false,
      defaultValue: 'message'
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
    associate: function(models) {
      Message.belongsTo(models.Deal);
    },
    timestamps: false, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Message;
};
