var express = require('express');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var secrets = require('./secrets');
var app = express();
var last = "";

app.get('/', function (req, res) {
    var url = 'https://www.endomondo.com/challenges/26556403';
    request(url, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            var names = $('td .name').map(function (i, a) {
                return a.children[0].data.replace('You', 'Branden Barber');
            });

            var maxLength = 0;
            for (var i = 0; i < names.length; i++) {
                if (names[i].length > maxLength)
                    maxLength = names[i].length;
            }

            // Pad names so kcals right align
            names = names.map(function (i, a) {
                return a + Array(maxLength - a.length + 1).join(' ');
            });

            var kcals = $('.nose').map(function (i, a) {
                return a.children[0].data.replace('&nbsp;kcal', '');
            });

            var arr = kcals.map(function (i, score) {
                return names[i] + ' - ' + score;
            });

            var list = [];
            for (var i = 0; i < arr.length; i++) {
                list.push(arr[i])
            }

            var body = list.join('\r\n');


            if (last !== body) {
                last = body;

                var params = '?token=' + secrets.slack.token + '&channel=%23' + secrets.slack.channel;
                var options = {
                    url: 'https://dontpaniclabs.slack.com/services/hooks/slackbot' + params,
                    body: "```" + body + "```"
                };

                request.post(options);
            }

            res.send('<pre>' + body + '</pre>');
        }
    })
})

app.listen('3000')
