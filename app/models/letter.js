// Letter schema
module.exports = function(sequelize, DataTypes) {
  var Letter = sequelize.define('Letter', {
    hash: {
      type: DataTypes.STRING(32),
      allowNull: false,
      primaryKey: true
    },
    recipient: {
      type: DataTypes.STRING(32),
      allowNull: false,
      references: {
        model: 'UserAccounts',
        key: 'hashedId'
      }
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    associate: function(models) {
      Letter.hasMany(models.LetterAnswer);
      Letter.belongsTo(models.UserAccount); // Sender
    },
    classMethods: {
      generateLetterHash: function(sender, recipient) {
        return require('crypto').createHash('md5').update(sender + recipient).digest('hex');
      }
    },
    validate: {
      checkHash: function() {
        var hash = require('crypto').createHash('md5').update(this.UserAccountHashedId + this.recipient).digest('hex');
        if (hash != this.hash) {
          throw new Error('malformed hash');
        }
      }
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Letter;
};
