const express = require("express");
const Article = require("../Models/article");
const checkauth = require('../../Middlewares/checkAuth');
const user = require("../Models/user");
const schedule = require("node-schedule")
const route = express.Router();


route.post('/save', checkauth, (req, res, next) => {
    const article = new Article({
        auther: req.userData.userId,
        title: req.body.title,
        sections: req.body.arr,
        autherName: req.body.autherName,
        autherIcone: req.body.autherIcone,
        formatDate: req.body.formatDate

    }).save().then(article => {
        res.status(200).send(article)
    }).catch(err => {
        console.log(err)
    })
})


route.post("", checkauth, (req, res) => {

    Article.findById(req.body.id).then(article => {

        res.status(200).send(article)
    }, err => {
        console.log(err)
    })
})

route.get("/trendingTags", checkauth, (req, res) => {
    tags = []
    Article.aggregate([
        { $project: { "tags": 1, "likes_count": { $size: "$likes" } } },
        { $sort: { "likes_count": -1 } },
        { $limit: 4 }
    ]).then(article => {
        article.forEach(val => { tags.push(...val.tags) })
        res.status(200).send(tags)
    }, err => {
        console.log(err)
    })
})


route.get("/articleWantToRead", checkauth, (req, res) => {
    let interests = []
    user.findById(req.userData.userId, { "interest": 1 }).then(resul => {
        resul.interest.forEach(val => interests.push(val.name))
        regex = interests.map(function (k) { return new RegExp(k, "i") })

        if (regex.length > 0) {
            Article.find({ $and: [{ auther: { $not: { $eq: req.userData.userId } } }, { title: { $in: regex } }, { isPublish: true }] }).limit(3).then(reso => {
                if (reso.length) {
                    res.json(reso)
                } else {
                    Article.find({ isPublish: true }).limit(3).then(reso => {

                        res.json(reso)
                    })
                }

            })
        } else {
            Article.find({ isPublish: true }).limit(3).then(reso => {

                res.json(reso)
            })
        }


    }, err => {
        console.log(err)
    })
})

route.post("/update", checkauth, (req, res) => {
    Article.updateOne({ _id: req.body.id }, { $set: { sections: req.body.sections, title: req.body.title } }).then(result => {

        res.status(200).send(result)
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })
})
route.get("/finished", checkauth, (req, res) => {
    Article.find({ $and: [{ auther: req.userData.userId }, { isPublish: true }] }).sort({ date: -1 }).then(posts => {
        res.status(201).json(posts)
    }, err => {
        console.log('something went wrong ' + err)
    })
})
route.get("/workingOn", checkauth, (req, res) => {
    console.log(req.userData.userId)
    Article.find({ $and: [{ auther: req.userData.userId }, { isPublish: false }] }).sort({ date: -1 }).then(posts => {
        res.status(201).json(posts)
    }, err => {
        console.log('something went wrong ' + err)
    })
})


route.get("/collaboration", checkauth, (req, res) => {

    Article.find({ collaborators: { $in: req.userData.userId } }).sort({ date: -1 }).then(posts => {
        res.status(201).json(posts)
    }, err => {
        console.log('something went wrong ' + err)
    })
})

route.get("/collaborationForStats", checkauth, (req, res) => {

    Article.find({ $and: [{ collaborators: { $in: req.userData.userId } }, { isPublish: true }] }).sort({ date: -1 }).then(posts => {
        res.status(201).json(posts)
    }, err => {
        console.log('something went wrong ' + err)
    })
})
route.get("/all", checkauth, (req, res) => {
    Article.find({ $and: [{ auther: { $not: { $eq: req.userData.userId } } }, { isPublish: true }] }).sort({ date: -1 }).limit(+req.query.nbArticle).then(posts => {

        res.status(201).json(posts)
    }, err => {
        console.log('something went wrong ' + err)
    })
})

route.post("/publishArticle", checkauth, (req, res) => {
    Article.updateOne({ _id: req.body.id }, { $set: { isPublish: true, tags: req.body.tags, date: new Date() } }).then(result => {

        res.status(200).send(result)
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })
})
route.post("/searchArticle", checkauth, (req, res) => {

    Article.find({ $and: [{ title: { $regex: req.body.name, $options: "i" } }, { isPublish: true }, { auther: { $not: { $eq: req.userData.userId } } }] }).limit(3).then(result => {
        res.status(200).send(result)
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })
})

route.post("/like", checkauth, (req, res) => {
    if (!req.body.isLikedByUser) {

        Article.updateOne({ _id: req.body.id }, { $push: { likes: req.userData.userId } }).then(result => {

            console.log('added')
            user.updateMany({ $or:[{_id: req.body.auther} , {_id : {$in : req.body.collabs}}] }, { $inc: { totalPoints: 5 } }).then(upd => {
                console.log('piont view added')
                res.status(200).send(upd)
            })

        })
            .catch(err => {
                console.log('ici c l erreure' + err)
            })
    } else {
        Article.updateOne({ _id: req.body.id }, { $pull: { likes: req.userData.userId } }).then(result => {
            console.log('removed')
            user.updateMany({ $or:[{_id: req.body.auther} , {_id : {$in : req.body.collabs}}] }, { $inc: { totalPoints: -5 } }).then(upd => {
                console.log('piont view added')
                res.status(200).send(upd)
            })

        })
            .catch(err => {
                console.log('ici c l erreure' + err)
            })
    }

})
route.post("/ratingArticle", checkauth, (req, res) => {
    Article.findOne({ _id: req.body.id, "rating.id": req.userData.userId }).then(resu => {
        if (resu == null) {
            Article.updateOne({ _id: req.body.id }, { $push: { rating: { id: req.userData.userId, stars: req.body.nbStars } } }, { $addFields: { averageRating: { $avg: "$rating.stars" } } }).then(result => {
                console.log('added')

            })

        } else {


            Article.findOneAndUpdate({ _id: req.body.id, "rating.id": req.userData.userId },
                { $set: { 'rating.$.stars': req.body.nbStars, averageRating: { $avg: "$rating.stars" } } }).then(art => {
                    console.log('set')
                })

        }
    })

})

route.post("/otherFinished", checkauth, (req, res) => {
    Article.find({ $or: [{ attachedUsers: { $in: req.body.id } }, { $and: [{ auther: req.body.id }, { isPublish: true }] }, { $and: [{ collaborators: { $in: req.body.id } }, { isPublish: true }] }] }).sort({ date: -1 }).then(posts => {
        res.status(201).json(posts)
    }, err => {
        console.log('something went wrong ' + err)
    })
})

route.post("/searchInOtherProfile", checkauth, (req, res) => {
    Article.find({ auther: req.body.id, title: { $regex: req.body.itemToSearch, $options: "i" } }).sort({ date: -1 }).limit(5).then(posts => {
        res.status(201).json(posts)

    }, err => {
        console.log('something went wrong ' + err)
    })
})

route.post("/searchByTagInOtherProfile", checkauth, (req, res) => {


    var optRegexp = [];
    req.body.itemToSearch.forEach(function (opt) {
        optRegexp.push(new RegExp(opt, "i"));
    });
    if (req.body.id) {
        Article.find({ auther: req.body.id, "tags.name": { $in: optRegexp }, isPublish: true }).sort({ date: -1 }).then(posts => {
            res.status(201).json(posts)

        }, err => {
            console.log('something went wrong ' + err)
        })
    } else {
        Article.find({ auther: { $not: { $eq: req.userData.userId } }, "tags.name": { $in: optRegexp }, isPublish: true }).sort({ date: -1 }).then(posts => {
            res.status(201).json(posts)

        }, err => {
            console.log('something went wrong ' + err)
        })
    }

})

route.post("/addCollaborator", checkauth, (req, res) => {
    Article.updateOne({ _id: req.body.id }, { $push: { collaborators: req.userData.userId } }).then(result => {

        res.status(200).send(result)
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })
})
route.post("/getCollaborators", checkauth, (req, res) => {
    user.find({ $and: [{ _id: { $in: req.body.collaborators } }, { _id: { $not: { $eq: req.userData.userId } } }] }).then(result => {

        res.status(200).send(result)
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })
})
route.post("/readLater", checkauth, (req, res) => {
    if (!req.body.allRadyExist) {
        user.updateOne({ _id: req.userData.userId }, { $push: { readLater: req.body.id } }).then(result => {

            res.status(200).send(result)
        })
            .catch(err => {
                console.log('ici c l erreure' + err)
            })
    } else {
        user.updateOne({ _id: req.userData.userId }, { $pull: { readLater: req.body.id } }).then(result => {

            res.status(200).send(result)
        })
            .catch(err => {
                console.log('ici c l erreure' + err)
            })
    }

})

route.post("/setReadtime", checkauth, (req, res) => {

    Article.updateOne({ _id: req.body.id }, { $inc: { readTime: req.body.readTime } }).then(result => {
        res.status(200).send(result)
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })


})
route.post("/setArticleViews", checkauth, (req, res) => {
    if (!req.body.allRadyExist) {
        console.log(req.body.allRadyExist)
        Article.updateOne({ _id: req.body.id }, { $push: { views: req.userData.userId } }).then(result => {
            console.log('view added')
            user.updateMany({ $or:[{_id: req.body.auther} , {_id : {$in : req.body.collabs}}] }, { $inc: { totalPoints: 1 } }).then(upd => {
                console.log('piont view added')
                res.status(200).send(upd)
            })

        })
            .catch(err => {
                console.log('ici c l erreure' + err)
            })
    } else {
        console.log('existe')
        console.log(req.body.allRadyExist)
    }
})

route.post("/getReadLaterArticles", checkauth, (req, res) => {
    Article.find({ _id: { $in: req.body.readLater } }).then(reso => {
        res.json(reso)
    }).catch(err => {
        console.log(err)
    })

})
route.post("/delete", checkauth, (req, res) => {
    Article.deleteOne({ _id: req.body.id }).then(reso => {
        res.json(reso)
    }).catch(err => {
        console.log(err)
    })

})

route.post("/switchCommentStat", checkauth, (req, res) => {
    if (req.body.disabled) {
        console.log('rrr' + req.body.disabled)
        Article.updateOne({ _id: req.body.id }, { $set: { commentDisabled: false } }).then(reso => {
            res.json(reso)
        }).catch(err => {
            console.log(err)
        })
    } else {
        console.log('lllr' + req.body.disabled)
        Article.updateOne({ _id: req.body.id }, { $set: { commentDisabled: true } }).then(reso => {
            res.json(reso)
        }).catch(err => {
            console.log(err)
        })
    }


})

route.post("/attachUser", checkauth, (req, res) => {
    if (req.body.exist) {
        Article.updateOne({ _id: req.body.id }, { $pull: { attachedUsers: req.userData.userId } }).then(reso => {
            res.json(reso)
        }).catch(err => {
            console.log(err)
        })

    } else {
        Article.updateOne({ _id: req.body.id }, { $push: { attachedUsers: req.userData.userId } }).then(reso => {
            res.json(reso)
        }).catch(err => {
            console.log(err)
        })

    }

})
route.post("/schedule", checkauth, (req, res) => {

    Article.updateOne({ _id: req.body.id }, { $set: { scheduleDate: req.body.scheduleDate } }).then(result => {
        const job = schedule.scheduleJob(req.body.id, `${req.body.minute} ${req.body.hour} ${req.body.day} ${req.body.month} *`, () => {
            const year = new Date().getFullYear().toString()
            console.log(year)
            if (req.body.year === year) {
                Article.updateOne({ _id: req.body.id }, { $set: { isPublish: true, tags: req.body.tags, date: new Date() } }).then(result => {
                    schedule.cancelJob(req.body.id)

                })
                    .catch(err => {
                        console.log('ici c l erreure' + err)
                    })


            } else {
                console.log('mazel')
            }
        })
        res.status(200).send(result)
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })

})


route.post("/reschedule", checkauth, (req, res) => {

    Article.updateOne({ _id: req.body.id }, { $set: { scheduleDate: req.body.scheduleDate } }).then(result => {
        schedule.cancelJob(req.body.id)
        const job = schedule.scheduleJob(req.body.id, `${req.body.minute} ${req.body.hour} ${req.body.day} ${req.body.month} *`, () => {
            const year = new Date().getFullYear().toString()
            console.log(year)
            if (req.body.year === year) {

                Article.updateOne({ _id: req.body.id }, { $set: { isPublish: true, tags: req.body.tags, date: new Date() } }).then(result => {

                    schedule.cancelJob(req.body.id)

                })
                    .catch(err => {
                        console.log('ici c l erreure' + err)
                    })


            } else {
                console.log('mazel')
            }
        })
        console.log('rescheduled');
        res.status(200).send(result)
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })

})

route.post("/cancelSchedule", checkauth, (req, res) => {

    Article.updateOne({ _id: req.body.id }, { $set: { scheduleDate: null } }).then(result => {
        schedule.cancelJob(req.body.id)
        console.log('canceld');
        res.send({ obj: 'canceled' })
    })
        .catch(err => {
            console.log('ici c l erreure' + err)
        })

})

route.get("/rankingpoints", checkauth, (req, res) => {

    Article.aggregate([
        { $match: { $and: [{ $or: [{ auther: req.userData.userId }, { collaborators: { $in: [req.userData.userId] } }] }, { isPublish: true }] } },
        {

            $project: {
                numberOfLikes: { $cond: { if: { $isArray: "$likes" }, then: { $size: "$likes" }, else: 0 } },
                numberOfshares: { $cond: { if: { $isArray: "$shares" }, then: { $size: "$shares" }, else: 0 } },
                numberOfviews: { $cond: { if: { $isArray: "$views" }, then: { $size: "$views" }, else: 0 } }

            }
        }
    ]).then(posts => {
        console.log(posts);
        let likes = 0
        let shares = 0
        let views = 0
        posts.map((val) => {
            likes += val.numberOfLikes
            shares += val.numberOfshares
            views += val.numberOfviews
        })
        res.status(200).send({ likes: (likes*5), shares: (shares*10), views: views, tot: (likes * 5 + views + shares * 10) })
    })

})
module.exports = route;