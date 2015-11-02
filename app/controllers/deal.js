/**
 *  Deal controller
 */
var db = require('../../config/sequelize');

exports.getDealCategory = function(req, res, next, dealCat) {
  db.DealCategory.findOne({
    where: {
      title: dealCat
    }
  }).then(function(category) {
    if (category) {
      req.category = category;
      return next();
    } else {
      return res.status(404).send({
        error: 'category ' + dealCat + ' not found'
      });
    }
  });
};

exports.getDealById = function(req, res, next, dealId) {
  db.Deal.findOne({
    where: {
      id: dealId
    }
  }).then(function(deal) {
    if (deal) {
      req.deal = deal;
      return next();
    } else {
      return res.status(404).send({
        error: 'deal of id ' + dealId + ' not found'
      });
    }
  });
};

exports.getCategories = function(req, res) {
  db.DealCategory.findAll({
    order: [['title', 'ASC']]
  }).then(function(categories) {
    res.send(categories);
  });
};

exports.getDeals = function(req, res) {
  var whereClause = {};
  if (category.title !== 'all') {
    whereClause.DealCategoryTitle = category.title;
  }
  if (req.query.removeExpired) {
    whereClause.expiry = {
      $gt: new Date()
    };
  }
  if (req.query.removeLiked) {
    whereClause.$and = [['`id` NOT IN (SELECT `DealId` FROM `DealLike` WHERE `UserAccountHashedId`=?)', req.user.hashedId]];
  }
  db.Deal.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  }).then(function(deals) {
    return res.send(deals);
  });
};

exports.likeDeal = function(req, res) {
  db.DealLike.findOne({
    UserAccountHashedId: req.user.hashedId,
    DealId: req.deal.id
  }).then(function(like) {
    if (like) {
      like.destroy().then(function() {
        return res.send({
          status: 'success',
          isLiked: false
        });
      });
    } else {
      db.DealLike.create({
        UserAccountHashedId: req.user.hashedId,
        DealId: req.deal.id
      }).then(function(like) {
        return res.send({
          status: 'success',
          isLiked: true
        });
      });
    }
  });
};
