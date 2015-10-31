// Room schema
module.exports = function(sequelize, DataTypes) {
  var Room = sequelize.define('Room', {
    hash: {
      type: DataTypes.STRING(32),
      allowNull: false,
      primaryKey: true
    },
    user1: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    user2: {
      type: DataTypes.STRING(32),
      allowNull: false,
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
    classMethods: {
      generateRoomHash: function(user1, user2) {
        if (user1 === user2)
          throw new Error('user1 and user2 cannot be the same user');
        var temp = user1;
        if (user1 > user2) {
          user1 = user2;
          user2 = temp;
        }
        var roomHash = require('crypto').createHash('md5').update(user1 + user2).digest('hex');
        return roomHash;
      }
    },
    associate: function(models) {
      Room.hasMany(models.Message);
      Room.belongsTo(models.Letter);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Room;
};
