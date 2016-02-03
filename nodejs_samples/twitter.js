var sql = require('mssql'); 
var Twitter = require('twitter-js-client').Twitter;
var dateFormat = require('dateformat');
 
var config = {
    user: 'xxxx',
    password: 'xxxx',
    server: 'xxxx', // You can use 'localhost\\instance' to connect to named instance 
    database: 'xxxx',
    
    options: {
        //encrypt: true // Use this if you're on Windows Azure 
    }
}

//Callback functions
var error = function (err, response, body) {
    console.log('ERROR [%s]', err);
};
var success = function (data) {
    //console.log('Data [%s]', data);
    var jsonData = JSON.parse(data);
    var idArray = new Array();
    var textArray = new Array();
    var created_atArray = new Array();
    var sourceArray = new Array();
    var truncatedArray = new Array();
    var truncatedtweet = 0;
    var myTimer;
    var startCount = 0;

    for(x=0; x<jsonData.length; x++){

    	if ( jsonData[x]['truncated'] == "NO" ) {
			truncatedtweet = 0;
		} else {
			truncatedtweet = 1;
		}

    	idArray[idArray.length] = jsonData[x]['id'];
    	textArray[textArray.length] = jsonData[x]['text']=jsonData[x]['text'].replace(/(<\?[a-z]*(\s[^>]*)?\?(>|$)|<!\[[a-z]*\[|\]\]>|<!DOCTYPE[^>]*?(>|$)|<!--[\s\S]*?(-->|$)|<[a-z?!\/]([a-z0-9_:.])*(\s[^>]*)?(>|$))/gi, '');
    	created_atArray[created_atArray.length] = dateFormat(jsonData[x]['created_at'], "yyyy-mm-dd HH:mm:ss");
    	sourceArray[sourceArray.length] = jsonData[x]['source'];
    	truncatedArray[truncatedArray.length] = truncatedtweet;

    }


    myTimer = setInterval(function(){ 
    	sqlResult(startCount, idArray, textArray, created_atArray, sourceArray, truncatedArray); 
    	startCount++;
    	if(startCount >= 4){
    		startCount = 0;
    		console.log('Restart Twitter Scan');
    	}
    }, 3600000);


};


var sqlResult = function (startCount, idArray, textArray, created_atArray, sourceArray, truncatedArray) {	

	sql.connect(config, function(err) {

		var request = new sql.Request();
    	request.query("SELECT status_id FROM Twitter_Main_New_Test with(nolock) WHERE status_id = " + idArray[startCount], function(err, recordset) { 

		    if(recordset === undefined || recordset[0] === undefined || recordset[0].status_id === undefined){

            	var request = new sql.Request();
    			request.query("INSERT INTO Twitter_Main_New_Test(created_at,status_id,source,text,truncated) VALUES ('" + created_atArray[startCount] + "', " + idArray[startCount] + ", '" + sourceArray[startCount] + "', '" + textArray[startCount] + "', " + truncatedArray[startCount] + ")", function(err, recordset) { 

					console.log("Inserted into DB - " + idArray[startCount]);

				});		    		

			} else {

				console.log("Record Already Exists - " + recordset[0].status_id);

			}

		});

	});

};

//var Twitter = require('twitter-js-client').Twitter;

//Get this data from your twitter apps dashboard
var configT = {
    "consumerKey": "xxxx",
    "consumerSecret": "xxxx",
    "accessToken": "xxxx",
    "accessTokenSecret": "xxxx",
    "callBackUrl": ""
}

var twitter = new Twitter(configT);


//Timeline call

twitter.getUserTimeline({ screen_name: 'ALI_CLE', count: '5'}, error, success);