// Deal Share schema
module.exports = function(sequelize, DataTypes) {
  var DealShare = sequelize.define('DealShare', {
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
      DealShare.belongsTo(models.Deal, {onDelete: 'CASCADE'});
    },
    timestamps: false, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return DealShare;
};
