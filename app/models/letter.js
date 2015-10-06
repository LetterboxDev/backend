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
    selection0: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    selection1: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    selection2: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    selection3: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    selection4: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    isSent: {
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
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Letter;
};
