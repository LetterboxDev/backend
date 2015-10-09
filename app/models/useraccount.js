// User schema
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('UserAccount', {
    profileId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hashedId: {
      type: DataTypes.STRING(32),
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING(6),
      allowNull: false,
      isIn: [['male', 'female']]
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isRegistered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    associate: function(models) {
      User.hasMany(models.UserWyrQuestion);
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return User;
};
