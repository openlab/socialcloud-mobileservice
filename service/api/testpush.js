exports.get = function(request, response) {
	
    var msg = request.query.msg || "This is a test alert";    
    sendNotifications(request.service, msg);
    response.send(200, "Hello");
};

function sendNotifications(serv, message) {
    var channelTable = serv.tables.getTable('PushChannel');
    channelTable.read({
        success: function(channels) {
            channels.forEach(function(channel) {
            	if( channel.uri.length === 0 ) {
                	var sql = "Delete from PushChannel where id = " + channel.id;
                                 serv.mssql.query(sql, {
                                    success: function(results) {
                                    }, error: function(err) {
                                        console.log('Error: ', err);
                                    }
                                });
                }
                else{
                    if(channel.Platform === "WP8" ) {
                        sendWP8Toast(serv,channel, message);
                    }
                    else if(channel.Platform === "iOS") {
                    	sendIOSNotification(serv, channel, message);
                    }
                    else if(channel.Platform === "Android"){
                    	sendAndroidMessage(serv,channel,message);
                    }
                }
            });
           
        }
    });
}
function sendIOSNotification(serv, channel, message) {
	if( channel.uri.length === 0 ) {
    	var sql = "Delete from PushChannel where id = " + channel.id;
                     serv.mssql.query(sql, {
                        success: function(results) {
                        }, error: function(err) {
                            console.log('Error: ', err);
                        }
                    });
        return;
    }
	try {
	serv.push.apns.send(channel.uri.replace('<','').replace('>', ''), {
            alert: "Toast: " + message,
            payload: {
                inAppMessage: "Hey, a new item arrived: '" + message + "'"
            }
        },
        {
    error : function(err) {
        // handle the error here.
        console.log('ios push returned an error', err);
    }
});
    } catch( ex ) {
        console.log('Error sending ios push', ex);
    }
}

function sendWP8Toast(serv, channel, message ) {
	serv.push.mpns.sendToast(channel.uri, {
        text1: message
    }, {
        success: function(pushResponse) {
            console.log("WP8 push:", pushResponse);
        }
     , error: function(error) {
                if( error.shouldDeleteChannel ) {
                    var sql = "Delete from PushChannel where id = " + channel.id;
                     serv.mssql.query(sql, {
                        success: function(results) {
                        }, error: function(err) {
                            console.log('Error: ', err);
                        }
                    });
                }
                else {
                    console.log("captured error:", error);
                }
            }
    });
}

function sendAndroidMessage(serv, channel, message){
	console.log("sending android alert: " + channel.uri);
	serv.push.gcm.send(channel.uri, {text1: message}, {
                success: function(response) {
                    console.log("ADR push: ", response);
                }, error: function(error) {
                    console.log("Error sending android push: ", error);
                }
            });

}
