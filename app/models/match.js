// Match schema
module.exports = function(sequelize, DataTypes) {
  var Match = sequelize.define('Match', {}, {
    associate: function(models) {
      Match.belongsTo(models.UserAccount, {as: 'matcher', onDelete: 'CASCADE'});
      Match.belongsTo(models.UserAccount, {as: 'matchee', onDelete: 'CASCADE'});
    },
    timestamps: true, // sets createdAt and updatedAt
    paranoid: false, // disables soft deletion
  });

  return Match;
};
