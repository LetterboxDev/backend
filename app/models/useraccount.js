// User schema
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('UserAccount', {
    profileId: {
      type: DataTypes.STRING,
      notNull: true,
      notEmpty: true
    },
    hashedId: {
      type: DataTypes.STRING(32),
      notNull: true,
      notEmpty: true,
      primaryKey: true
    },
    gender: {
      type: DataTypes.STRING(6),
      notNull: true,
      notEmpty: true,
      isIn: [['male', 'female']]
    },
    accessToken: {
      type: DataTypes.STRING,
      notNull: true,
      notEmpty: true
    },
    isRegistered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return User;
};
