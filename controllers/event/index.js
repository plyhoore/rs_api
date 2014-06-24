'use strict';

var model = require('../../lib/service/models'),
    Q = require('q'),
    util = require('util'),
    event = require('../../lib/controller/event');

function NotFound(message) {
    this.code = 404;
    this.message = message;

    Error.call(this);
}

util.inherits(NotFound, Error);

module.exports = function (router) {

    router.post('/', function (req, res) {
        var data = req.body;
        var value = data.value || 1;

        var User;

        if (!data.user_id || !data.currency_id) {
            return res.send(400, 'Required parameter missing');
        }

        model.find.immediate.one(req, 'user', data.user_id).then(function (user) {console.log(10);
            return user;
        }).fail(function (err) {console.log(11);
            if (err.literalCode === 'NOT_FOUND') {
                // user reg
                return model.immediate(req.models.user, 'create', {id: data.user_id, credits: 0});
            }
            throw err;
        }).then(function(user) {
            console.log(1);
            User = user;
            return model.find.immediate.one(req, 'currency', data.currency_id)
                .fail(function (err) {
                    throw new NotFound('Not found currency');
                });
        }).then(function (Currency) {console.log(2);
            if (!Currency) {
                throw new NotFound('Not found currency o');
            }

            return event.addCurrency(User, Currency, value)
                .then(event.addBadges(req));
        }).then(function (result) {console.log(3);
            return res.send({ earned: result.length, rules: result });
        },function (err) {console.log(4);
            var message = err.toString(),
                code = 500;
            if (err.literalCode && err.literalCode === 'NOT_FOUND') {
                code = 404;
            } else if (err instanceof NotFound) {
                code = err.code;
                message = err.message;
            }
            // console.error('err', err);
            return res.send(code, message);
        })
        .done();
    });

};