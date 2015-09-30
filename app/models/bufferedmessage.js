// Message Buffer schema
module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('BufferedMessage', {
    from: {
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
    to: {
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
    message: {
      type: DataTypes.TEXT,
      validate: {
        notNull: true,
        notEmpty: true,
      }
    },
    sentTime: {
      type: DataTypes.INTEGER,
      validate: {
        notNull: true
      }
    }
  }, {
    associate: function(models) {
      Message.belongsTo(models.Room);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Message;
};
