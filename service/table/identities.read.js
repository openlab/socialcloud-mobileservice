function read(query, user, request) {
    var identities = user.getIdentities()
   
    var url;
    var token;
    if (identities.google) {
        var googleAccessToken = identities.google.accessToken;
        token = googleAccessToken;
        url = 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + googleAccessToken;
    } else if (identities.facebook) {
        var fbAccessToken = identities.facebook.accessToken;
        token = fbAccessToken;
        url = 'https://graph.facebook.com/me?access_token=' + fbAccessToken;
    }  else if (identities.microsoft) {
        var liveAccessToken = identities.microsoft.accessToken;
        token = liveAccessToken;
        url = 'https://apis.live.net/v5.0/me/?method=GET&access_token=' + liveAccessToken;
    }
 
    if (url) {
        var requestCallback = function (err, resp, body) {
            if (err || resp.statusCode !== 200) {
                console.error('Error sending data to the provider: ', err);
                request.respond(statusCodes.INTERNAL_SERVER_ERROR, body);
            } else {
                try {
                    var userData = JSON.parse(body);
//                    userData.accessToken = token;
                    return request.respond(200, [userData]);
                } catch (ex) {
                    console.error('Error parsing response from the provider API: ', ex);
                    request.respond(statusCodes.INTERNAL_SERVER_ERROR, ex);
                }
            }
        }
        var req = require('request');
        var reqOptions = {
            uri: url,
            headers: { Accept: "application/json" }
        };
        req(reqOptions, requestCallback);
    } else {
        // Insert with default user name
        request.execute();
    }
}