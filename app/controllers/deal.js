/**
 *  Deal controller
 */
var db = require('../../config/sequelize');

function formatDeal(plainDeal, hashedId) {
  plainDeal.likeCount = plainDeal.DealLikes.length;
  for (var j = 0; j < plainDeal.likeCount; j++) {
    if (plainDeal.DealLikes[j].UserAccountHashedId === hashedId) {
      plainDeal.isLiked = true;
      break;
    }
  }
  plainDeal.images = [];
  for (var i = 0; i < plainDeal.DealImages.length; i++) {
    plainDeal.images.push(plainDeal.DealImages[i].url);
  }
  if (plainDeal.images.length) {
    var imgurImageSize = "b";
    var imageUrl = plainDeal.images[0];
    var dotIndex = imageUrl.lastIndexOf('.');
    plainDeal.thumbnail = imageUrl.substr(0, dotIndex) +
                          imgurImageSize +
                          imageUrl.substr(dotIndex);
  }
  if (!plainDeal.isLiked) plainDeal.isLiked = false;
  delete plainDeal.DealLikes;
  delete plainDeal.DealImages;
  return plainDeal;
}

exports.formatDeal = formatDeal;

exports.getFeaturedDeals = function(req, res) {
  db.FeaturedDeal.findAll({
    include: [{
      model: db.Deal,
      include: [db.DealImage, db.DealLike]
    }]
  }).then(function(features) {
    var deals = [];
    for (var i = 0; i < features.length; i++) {
      deals.push(formatDeal(features[i].get({plain: true}).Deal , req.user.hashedId));
    }
    return res.send(deals);
  });
};

exports.getDealCategory = function(req, res, next, dealCat) {
  if (dealCat === 'all') {
    req.category = 'all';
    return next();
  } else {
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
  }
};

exports.getDealById = function(req, res, next, dealId) {
  db.Deal.findOne({
    where: {
      id: dealId
    },
    include: [db.DealLike, db.DealImage]
  }).then(function(deal) {
    if (deal) {
      var plainDeal = deal.get({plain: true});
      req.plainDeal = formatDeal(plainDeal, req.user.hashedId);      
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
  if (req.category !== 'all') {
    whereClause.DealCategoryTitle = req.category.title;
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
    order: [['createdAt', 'DESC']],
    include: [db.DealLike, db.DealImage]
  }).then(function(deals) {
    var result = [];
    for (var i = 0; i < deals.length; i++) {
      var deal = formatDeal(deals[i].get({plain: true}), req.user.hashedId);
      result.push(deal);
    }
    return res.send(result);
  });
};

exports.getDeal = function(req, res) {
  return res.send(req.plainDeal);
};

exports.likeDeal = function(req, res) {
  db.DealLike.findOne({
    where: {
      UserAccountHashedId: req.user.hashedId,
      DealId: req.deal.id
    }
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
        model: db.Deal,
        include: [db.DealLike, db.DealImage]
      }],
      order: [['createdAt', 'DESC']]
    }).then(function(likes) {
      var result = [];
      for (var i = 0; i < likes.length; i++) {
        var deal = formatDeal(likes[i].get({plain: true}).Deal, req.user.hashedId);
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
          ['Deal.id IN (SELECT `DealId` FROM `DealLikes` WHERE `UserAccountHashedId`=?)', req.user.hashedId],
          ['Deal.id IN (SELECT `DealId` FROM `DealLikes` WHERE `UserAccountHashedId`=?)', req.otherUser.hashedId]
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [db.DealLike, db.DealImage]
    }).then(function(deals) {
      var result = [];
      for (var i = 0; i < deals.length; i++) {
        var deal = formatDeal(deals[i].get({plain: true}), req.user.hashedId);
        result.push(deal);
      }
      return res.send(result);
    });
  } else {
    return res.status(404).send({
      error: 'user not found'
    });
  }
};
