// Report schema
module.exports = function(sequelize, DataTypes) {
  var Report = sequelize.define('Report', {
    reportee: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    reporter: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Report;
};
