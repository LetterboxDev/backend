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
    genderPreference: {
      type: DataTypes.STRING(6),
      allowNull: false,
      isIn: [['male', 'female']]
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 1.3 // Defaults to Singapore latitude
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 103.8 // Defaults to Singapore longitude
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pictureThumb: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    pictureMed: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isRegistered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    pushToken: {
      type: DataTypes.STRING,
      allowNull: true
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
