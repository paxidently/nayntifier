var FeedParser = require('feedparser')
  , request    = require('request')
  , fs         = require('fs')
  , moment     = require('moment');

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

var notify = function (data) {
    //
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
        var include = false, exclude = false;
        filter.include.forEach(function (i) {
            include = name.toLowerCase().indexOf(i) > -1;
        });
        filter.exclude.forEach(function (i) {
            exclude = name.toLowerCase().indexOf(i) > -1;
        });

        if (include && !exclude) {

            // Уведомить во вконтактик
            // Добавить торрент и время в лог

            log[link] = datetime;

            console.log(format(config.templateNew, {
                title: filter.title,
                name: name,
                category: category,
                link: link,
                hotlink: hotlink,
                datetime: datetime
            }));
        }
    });
    // Проверить, нет ли торрента в логе,
    // если есть, то отправлять только в том случае, если пользователь подписан на обновления
    // и использовать при этом шаблон для обновлений.

    // Занести торрент в лог.
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var config = json('nyantifier.json');

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
};

setInterval(function () {
    console.log(log);
    main();
}, 10000);

























