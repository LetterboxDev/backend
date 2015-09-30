// Room schema
module.exports = function(sequelize, DataTypes) {
  var Room = sequelize.define('Room', {
    user1: {
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
    user2: {
      type: DataTypes.STRING(32),
      validate: {
        notNull: true,
        notEmpty: true
      },
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    }
  }, {
    validate: {
      user1LessThanUser2: function() {
        if (this.user1 >= this.user2) {
          throw new Error('user1 must be less than user2');
        }
      }
    },
    associate: function(models) {
      Room.hasMany(models.BufferedMessage);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Room;
};
