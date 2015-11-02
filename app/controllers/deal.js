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

exports.getOtherUserById = function(req, res, next, otherUserId) {
  if (otherUserId === 'self') {
    req.otherUser = 'self';
    return next();
  }
  db.UserAccount.findOne({
    where: {
      hashedId: otherUserId
    }
  }).then(function(user) {
    if (user) {
      req.otherUser = user;
    }
    return next();
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

exports.getLikedDeals = function(req, res) {
  if (req.otherUser) {
    if (req.otherUser === 'self') {
      req.otherUser = req.user;
    }
    db.DealLike.findAll({
      where: {
        UserAccountHashedId: req.otherUser.hashedId
      },
      include: [{
        model: db.Deal
      }],
      order: [['createdAt', 'DESC']]
    }).then(function(likes) {
      var result = [];
      for (var i = 0; i < likes.length; i++) {
        var deal = likes[i].get({plain: true}).Deal;
        result.push(deal);
      }
      return res.send(result);
    })
  } else {
    return res.status(404).send({
      error: 'user not found'
    });
  }
};

exports.getMutualLikedDeals = function(req, res) {
  if (req.otherUser) {
    if (req.otherUser === 'self' || req.otherUser.hashedId === req.user.hashedId) {
      return res.status(400).send({
        error: 'cannot get mutal likes with self'
      });
    }
    db.Deal.findAll({
      where: {
        $and: [
          ['`id` IN (SELECT `DealId` FROM DealLike WHERE `UserAccountHashedId`=?)', req.user.hashedId],
          ['`id` IN (SELECT `DealId` FROM DealLike WHERE `UserAccountHashedId`=?)', req.otherUser.hashedId]
        ]
      },
      order: [['createdAt', 'DESC']]
    }).then(function(deals) {
      return res.send(deals);
    });
  } else {
    return res.status(404).send({
      error: 'user not found'
    });
  }
};
