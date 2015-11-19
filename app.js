var express = require('express'),
    cookieParser = require('cookie-parser'),
    app = express(),
    path = require('path'),
    google = require('googleapis'),
    OAuth2 = google.auth.OAuth2;

var PORT = 8778,
    CLIENT_ID = "575288234383-9qmm074c77ij7kl81afd0h3sh7755i7q.apps.googleusercontent.com",
    CLIENT_SECRET = "b7nT6EghBcg2sJoTVFVHx84x",
    REDIRECT_URL = "http://localhost:" + PORT + "/googleoauthcb";

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
google.options({ auth: oauth2Client }); // set auth as a global default

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public_html')));
app.get('/', function(req, res){


    console.log("cookies: ", req.cookies);
    res.send('hello world');
});

app.get("/googleoauth", function (req, res) {
    var scopes = [
        'https://www.googleapis.com/auth/plus.me'
    ];

    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
        scope: scopes // If you only need one scope you can pass it as string
        });
    res.redirect(301,url);
});

app.get("/googleoauthcb", function (req, res) {
    var code = req.query.code;
    console.log(req.query);
    res.cookie(
        'token',
        req.query.code
        );
    if (code) {
        console.log(code);
        oauth2Client.getToken(code, function(err, tokens) {
            // Now tokens contains an access_token and an optional refresh_token. Save them.
            if(!err) {
                oauth2Client.setCredentials(tokens);
                console.log(oauth2Client);
            }

        });
        res.sendStatus(200);
    } else {
        res.send(
            500,
            {
                error: 'Please authorize with one Google ' +
                    'account.'
            }
        );

    }
});

app.listen(PORT);