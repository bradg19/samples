var sql = require('mssql'); 
var io = require('socket.io');
var sockets = io.listen(1337);
 
var config = {
    user: 'xxxx',
    password: 'xxxx',
    server: 'xxxx', // You can use 'localhost\\instance' to connect to named instance 
    database: 'xxxx',
    
    options: {
        //encrypt: true // Use this if you're on Windows Azure 
    }
}


// socket.io
sockets.on('connection', function (socket) {

  socket.on('isComplete', function (data) {

  	console.dir(data);

  	if(data.isCourse == 1) {

	  	sql.connect(config, function(err) {
		    var request = new sql.Request();
		    request.query("SELECT TOP 1 containerid, imis_code, isComplete FROM Product_Containers with(nolock) WHERE containerid = '" + data.containerid + "'", function(err, recordset) { 

		    	//console.dir('Trigger isComplete');
		    	//console.dir('Errors: ' + err);
		        //console.dir('isComplete Status: ' + recordset[0].isSegmentComplete);
		        if(recordset === undefined || recordset[0] === undefined){

		        } else {
			        if(recordset[0].isComplete == 1){
						//var request = new sql.Request();
			    		// request.query("UPDATE Product_Containers SET iscomplete = 1 WHERE containerid = '" + data.containerid + "'", function(err, recordset) { 
			    		// 	console.dir("Course set isComplete: True (Containerid: " + data.containerid + ")");
			      		//  socket.broadcast.emit('isCompleteStatus', { isComplete: true, containerid: data.containerid });
			    		// });
			    		//console.dir("Course set isComplete: True (Containerid: " + data.containerid + ")");
			    		console.dir("Course set isComplete: True (Segmentid: " + data.segmentid + ")");
			        	socket.broadcast.emit('isCourseCompleteStatus', { iscomplete: true, containerid: data.containerid });
			        } else {
						//var request = new sql.Request();
			    		// request.query("UPDATE Product_Containers SET iscomplete = 0 WHERE containerid = '" + data.containerid + "'", function(err, recordset) { 
			    		// 	console.dir("Course set isComplete: False (Containerid: " + data.containerid + ")");
			      		//  socket.broadcast.emit('isCompleteStatus', { isComplete: false, containerid: data.containerid });
			    		// });
		    			//console.dir("Course set isComplete: False (Containerid: " + data.containerid + ")");
			    		console.dir("Course set isComplete: False (Segmentid: " + data.segmentid + ")");
		        		socket.broadcast.emit('isCourseCompleteStatus', { iscomplete: false, containerid: data.containerid });
			        }
			    }
		    });
		});

  	} else {

	  	sql.connect(config, function(err) {
		    var request = new sql.Request();
		    request.query("SELECT TOP 1 Product_Containers.containerid, Product_Containers.imis_code, Product_Course_Segments.isSegmentComplete, Product_Course_Segments.segmentid FROM Product_Containers with(nolock) INNER JOIN Product_Course_Master with(nolock) ON Product_Containers.containerid = Product_Course_Master.containerid INNER JOIN Product_Course_Segments with(nolock) ON Product_Course_Master.courseid = Product_Course_Segments.courseid WHERE Product_Course_Segments.segmentid = '" + data.segmentid + "'", function(err, recordset) { 

		    	//console.dir('Trigger isComplete');
		    	//console.dir('Errors: ' + err);
		        //console.dir('isComplete Status: ' + recordset[0].isSegmentComplete);
		        if(recordset === undefined || recordset[0] === undefined){

		        } else {
			        if(recordset[0].isSegmentComplete == 1){
						//var request = new sql.Request();
			    		// request.query("UPDATE Product_Containers SET iscomplete = 1 WHERE containerid = '" + data.containerid + "'", function(err, recordset) { 
			    		// 	console.dir("Course set isComplete: True (Containerid: " + data.containerid + ")");
			      		//  socket.broadcast.emit('isCompleteStatus', { isComplete: true, containerid: data.containerid });
			    		// });
			    		//console.dir("Course set isComplete: True (Containerid: " + data.containerid + ")");
			    		console.dir("Segment set isComplete: True (Segmentid: " + data.segmentid + ")");
			        	socket.broadcast.emit('isCompleteStatus', { iscomplete: true, containerid: data.containerid, segmentid: data.segmentid });
			        } else {
						//var request = new sql.Request();
			    		// request.query("UPDATE Product_Containers SET iscomplete = 0 WHERE containerid = '" + data.containerid + "'", function(err, recordset) { 
			    		// 	console.dir("Course set isComplete: False (Containerid: " + data.containerid + ")");
			      		//  socket.broadcast.emit('isCompleteStatus', { isComplete: false, containerid: data.containerid });
			    		// });
		    			//console.dir("Course set isComplete: False (Containerid: " + data.containerid + ")");
			    		console.dir("Segment set isComplete: False (Segmentid: " + data.segmentid + ")");
		        		socket.broadcast.emit('isCompleteStatus', { iscomplete: false, containerid: data.containerid, segmentid: data.segmentid });
			        }
		    	}
		    });
		});

  	}

  });

  socket.on('autoSave', function (data) {

  	sql.connect(config, function(err) {

		var request = new sql.Request();

		request.query("SELECT licenseid, segmentid, attributes_scope, bookmarkTimestamp FROM Licenses_Course_Tracking with(nolock) WHERE ctrackingtypeid = 27 AND licenseid = '" + data.licenseid + "' AND segmentid = '" + data.segmentid + "'", function(err, recordset) { 
		    
		    //console.log(recordsets.length); // count of recordsets returned by the procedure 
		    //console.log('licenseid: ' + data.licenseid + ' - segmentid: ' + data.segmentid); // output value 
		    //console.log('playheadtime: ' + parseInt(data.playheadtime));
		    if(recordset === undefined || recordset[0] === undefined){
		    	//console.log("value NULL");
		    	var request = new sql.Request();
	    		request.query("INSERT INTO Licenses_Course_Tracking(licenseid, segmentid, attributes_scope, ctrackingtypeid, ipaddress, bookmarkTimestamp) VALUES ('" + data.licenseid + "', '" + data.segmentid + "', '', 27, '" + data.ipaddress + "', 0)", function(err, recordset) { 
	    			//console.dir("Licenses_Course_Tracking Inserted (licenseid: " + data.licenseid + ")");
		      		socket.emit('setAutoSave', { licenseid: data.licenseid, playheadtime: data.playheadtime });
	    		});
		    }else{
		    	//console.log("bookmark original: " + recordset[0].bookmarkTimestamp);
		    	if(recordset[0].bookmarkTimestamp < data.playheadtime){
					var request = new sql.Request();
		    		request.query("UPDATE Licenses_Course_Tracking SET bookmarkTimestamp = '" + parseInt(data.playheadtime) + "' WHERE ctrackingtypeid = 27 AND licenseid = '" + data.licenseid + "' AND segmentid = '" + data.segmentid + "'", function(err, recordset) { 
		    			//console.dir("Licenses_Course_Tracking Updated (licenseid: " + data.licenseid + ")");
		      		 	socket.emit('setAutoSave', { licenseid: data.licenseid, playheadtime: data.playheadtime });
		    		});       		
        		}
		    }

		});

	});

  });

  socket.on('autoSaveFirm', function (data) {

  	sql.connect(config, function(err) {

		var request = new sql.Request();
		
		request.query("SELECT * FROM OnDemand_Tracking with(nolock) WHERE stateid = 0 AND groupid = '" + data.groupid + "' AND segmentid = '" + data.segmentid + "' AND imisid = '" + data.imisid + "'", function(err, recordset) { 
		    
		    //console.log(recordsets.length); // count of recordsets returned by the procedure 
		    //console.log('licenseid: ' + data.licenseid + ' - segmentid: ' + data.segmentid); // output value 
		    //console.log('playheadtime: ' + parseInt(data.playheadtime));
		    if(recordset === undefined || recordset[0] === undefined){
		    	//console.log("value NULL");
		    	var request = new sql.Request();
	    		request.query("INSERT INTO OnDemand_Tracking(groupid, segmentid, stateid, imisid, bookmarkTimestamp) VALUES ('" + data.groupid + "','" + data.segmentid + "',0,'" + data.imisid + "','" + data.bookmarkTimestamp + "')", function(err, recordset) { 
	    			//console.dir("Licenses_Course_Tracking Inserted (licenseid: " + data.licenseid + ")");
		      		socket.emit('setAutoSaveFirm', { groupid: data.groupid, segmentid: data.segmentid, imisid: data.imisid, playheadtime: data.playheadtime });
	    		});
		    }else{
		    	//console.log("bookmark original: " + recordset[0].bookmarkTimestamp);
		    	if(recordset[0].bookmarkTimestamp < data.playheadtime){
					var request = new sql.Request();
					request.query("UPDATE OnDemand_Tracking SET bookmarkTimestamp = '" + parseInt(data.playheadtime) + "' WHERE stateid = 0 AND groupid = '" + data.groupid + "' AND segmentid = '" + data.segmentid + "' AND imisid = '" + data.imisid + "'", function(err, recordset) { 
		    			//console.dir("Licenses_Course_Tracking Updated (licenseid: " + data.licenseid + ")");
		      		 	socket.emit('setAutoSaveFirm', { groupid: data.groupid, segmentid: data.segmentid, imisid: data.imisid, playheadtime: data.playheadtime });
		    		});       		
        		}
		    }

		});

	});

  });

  socket.on('getSlide', function (data) {

  	sql.connect(config, function(err) {
	    var request = new sql.Request();
	    request.query("SELECT top 1 slide_source FROM Licenses_Course_SlideSync with(nolock) WHERE containerid = '" + data.containerid + "' order by datetime_shown desc", function(err, recordset) { 

	    	//console.dir('Errors: ' + err);
	        //console.dir(recordset[0].slide_source);
	        if (recordset !== undefined && recordset[0] !== undefined) {
	        	if (recordset[0].slide_source !== undefined) {
	        		socket.emit('getSlideChange', { slide_source: recordset[0].slide_source, containerid: data.containerid });
	        	}
	        }
	        
	    });
	});

  });

  socket.on('pushSlide', function (data) {

  	sql.connect(config, function(err) {

	    var request = new sql.Request();
	    request.query("SELECT top 1 slide_source FROM Licenses_Course_SlideSync with(nolock) WHERE containerid = '" + data.containerid + "' order by datetime_shown desc", function(err, recordset) { 

	    	//console.dir('Errors: ' + err);
	        console.dir("Slide Pushed: " + recordset[0].slide_source);
	 		socket.emit('getSlideChange', { slide_source: recordset[0].slide_source, containerid: data.containerid });
	        socket.broadcast.emit('getSlideChange', { slide_source: recordset[0].slide_source, containerid: data.containerid });

	    });
	});

  });

  socket.on('pushErrorSlide', function (data) {

  	sql.connect(config, function(err) {
	    var request = new sql.Request();
	    request.query("SELECT * FROM Licenses_Course_ErrorSlideSync with(nolock) WHERE containerid = '" + data.containerid + "' AND enabled = 1", function(err, recordset) { 

	    	//console.dir('Errors: ' + err);
	        console.dir("Error Slide Pushed: " +recordset[0].url);
	        socket.emit('getErrorSlide', { slide_source: recordset[0].url, containerid: data.containerid });
	        socket.broadcast.emit('getErrorSlide', { slide_source: recordset[0].url, containerid: data.containerid });

	    });
	});

  });

  socket.on('removeErrorSlide', function (data) {

  	socket.emit('endErrorSlide', { containerid: data.containerid });
	socket.broadcast.emit('endErrorSlide', { containerid: data.containerid });

  });


  socket.on('sendQuestion', function (data) {

  	//console.dir('Question Received');

  	sql.connect(config, function(err) {
	    var request = new sql.Request();
	    request.query("SELECT TOP 1 Users_Details.firstname, Users_Details.lastname, Users_Main.email, Product_Course_Segments_Questions.question,  Product_Course_Segments_Questions.date_submitted, Product_Course_Segments_Questions.questionid FROM Product_Course_Master with(nolock) INNER JOIN Product_Containers with(nolock) ON Product_Course_Master.containerid = Product_Containers.containerid INNER JOIN Product_Course_Segments with(nolock) ON Product_Course_Master.courseid = Product_Course_Segments.courseid INNER JOIN Product_Course_Segments_Questions with(nolock) ON Product_Course_Segments.segmentid = Product_Course_Segments_Questions.segmentid INNER JOIN Licenses_Main with(nolock) ON Product_Course_Segments_Questions.licenseid = Licenses_Main.licenseid INNER JOIN Users_Main with(nolock) ON Licenses_Main.userid = Users_Main.userid INNER JOIN Users_Details with(nolock) ON Users_Main.userid = Users_Details.userid WHERE (Product_Containers.containerid = '" + data.containerid + "') AND forFaculty = 1 ORDER BY Product_Course_Segments_Questions.questionid DESC", function(err, recordset) { 

	    	//console.dir('Errors: ' + err);
	        console.dir('Question Asked: ' + recordset[0].question);
	        socket.emit('getQuestion', { firstname: recordset[0].firstname, lastname: recordset[0].lastname, email: recordset[0].email, date_submitted: recordset[0].date_submitted, question: recordset[0].question, containerid: data.containerid });
	        socket.broadcast.emit('getQuestion', { firstname: recordset[0].firstname, lastname: recordset[0].lastname, email: recordset[0].email, date_submitted: recordset[0].date_submitted, question: recordset[0].question, containerid: data.containerid });

	    });
	});

  });


});