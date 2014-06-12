var FeedParser = require('feedparser')
  , request    = require('request')
  , fs         = require('fs')
  , moment     = require('moment')
  , url        = require('url');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var file = function (x) {
    try {
        return fs.readFileSync(x).toString();
    } catch (e) { }
};

var json = function (x) {
    try {
        return JSON.parse(file(x));
    } catch (e) { }
};

var format = function (template, data) {
    return template.replace(/\{(\w+)\}/g, function (a, b) {
        return data[b] || a;
    });
};

var send = function (options) {
    var call = {
        protocol: 'https',
        hostname: 'api.vk.com',
        pathname: 'method/messages.send',
        query: {
            user_id:      options.user_id,
            chat_id:      options.chat_id,
            message:      options.message,
            attachment:   options.banner,
            access_token: token
        }
    };

    // console.log(url.format(call));

    request(url.format(call), function(e, res) {
        if (e) throw e;

        console.log(res.body);
    });
};

var notify = function (data) {
    log[link] = data.datetime;
    var message = format(data.update ? config.templateUpdate : config.templateNew, data);

    if (data.users) data.users.forEach(function (user) {
        send({
            message: message,
            banner:  data.banner,
            user_id: user
        });
    });

    if (data.chats) data.chats.forEach(function (chat) {
        send({
            message: message,
            banner:  data.banner,
            chat_id: chat
        });
    });

    console.log(message + '\n');
};

var filter = function (item) {
    name     = item.title;
    link     = item.guid;
    hotlink  = item.link;
    datetime = moment(item.date).zone('+04:00').lang('ru').format('D MMMM YYYY, HH:mm:ss');
    category = item.categories.map(function (x) {
        return categories[x] || x;
    }).join(', ');
    config.filters.forEach(function (filter) {
        var include = false, exclude = false, data;
        filter.include.forEach(function (i) {
            include = name.toLowerCase().indexOf(i) > -1;
        });
        filter.exclude.forEach(function (i) {
            exclude = name.toLowerCase().indexOf(i) > -1;
        });

        if (include && !exclude) {
            data = {
                title: filter.title,
                name: name,
                category: category,
                link: link,
                hotlink: hotlink,
                datetime: datetime,
                users: filter.users,
                chats: filter.chats,
                banner: filter.banner
            };

            if (log[link]) {
                if ((log[link] != datetime) && filter.updates) {
                    data.update = true;
                    notify(data);
                }
            } else {
                notify(data);
            }
        }
    });
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO: Отслеживать изменения конфига и перезагружать

var config = json('nyatifier.json');

var token = file('access_token');

var log = {};

var categories = {
    'English-translated Anime':           'ансаб (аниме)',
    'Raw Anime':                          'равки (аниме)',
    'Non-English-translated Anime':       'другие переводы (аниме)',
    'Anime Music Video':                  'АМВ',

    'English-translated Live Action':     'ансаб (лайв экшн)',
    'Raw Live Action':                    'равки (лайв экшн)',
    'Non-English-translated Live Action': 'другие переводы (лайв экшн)',
    'Live Action Promotional Video':      'ролики (лайв экшн)',

    'Lossless Audio':                     'высококачественное аудио',
    'Lossy Audio':                        'обычное аудио',

    'Applications':                       'программульки',
    'Games':                              'игрульки',

    'English-translated Literature':      'анлейт (манга и книги)',
    'Raw Literature':                     'равки (манга и книги)',
    'Non-English-translated Literature':  'другие переводы (манга и книги)',

    'Photos':                             'фоточки',
    'Graphics':                           'арты'
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////















var main = function () {
    var req = request('http://www.nyaa.se/?page=rss')
      , rss = new FeedParser();

    req.on('response', function (res) {
        this.pipe(rss);
    });

    rss.on('readable', function() {
        var item
          , name
          , datetime
          , link
          , hotlink
          , category;

        while (item = this.read()) filter(item);
    });

    rss.on('end', function () {
        setTimeout(main, 3000);
    });
};

main();

























