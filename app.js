const express = require('express')
const fs = require('fs')
const path = require('path')
var firebase = require("firebase");
var bodyParser = require('body-parser')

const app = express()

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
const config = {
	apiKey: "AIzaSyAhiIsXpi-1aHyN0uV9VBvXSmXgTp0Zh3g",
	authDomain: "playlists-web.firebaseapp.com",
	databaseURL: "https://playlists-web.firebaseio.com",
	projectId: "playlists-web",
	storageBucket: "playlists-web.appspot.com",
	messagingSenderId: "63537889736"
};
firebase.initializeApp(config);

 // Get a reference to the database service
const database = firebase.database();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
// use the following code to serve images, CSS files, and JavaScript files in a assets:
app.use(express.static(path.join(__dirname, 'assets')))

// Set views path, template engine and default layout
app.set('views', __dirname); //path.join(__dirname, 'views')

// set .html as the default extension
app.set('view engine', 'html');

// assign the template engine to .html files
app.engine('html', function (path, options, cb) {
    fs.readFile(path, 'utf-8', cb);
});

/*************** API ***************/
app.post('/create-playlist', function(req, res) {
    var pid = req.body.id? req.body.id: 0,
    params = {title : req.body.title, 
    		  description: req.body.description? req.body.description: ''};

    if(pid){
    	// update playlists
    	var playRef = database.ref('playlist/'+pid);
		playRef.update(params).then(function() {
		    res.status(200).send('You are updated successfully');
		  })
		  .catch(function(error) {
		    res.status(500).send(error.message);
		  });

    }else{
    	// add playlist
    	if(params){    		
			database.ref('playlist').push().set(params).then(function() {
			    res.status(200).send('You are added successfully');
			  })
			  .catch(function(error) {
			    res.status(500).send(error.message);
			  });
    	}
    }    
    
});

app.get('/get-playlist', function(req, res) {

   	database.ref('playlist').limitToLast(5).once('value').then(function(snapshot) {
	   var arr_snap = snapshot.val();	

	   res.status(200).send(arr_snap); 
	}).catch(function(error) {
	  	
	    // Handle Errors here.
	    res.status(500).send(error.message);	
	});
});

app.get('/delete-playlist/:id', function(req, res) {
	var playKey = req.params.id;

	var plyRef = database.ref('playlist/'+playKey);

	plyRef.remove()
	  	.then(function() {
	    	res.status(200).send('You are deleted successfully')
	  	})
	  	.catch(function(error) {
	    	res.status(500).send(error.message);
	  	});
});

app.post('/account', function(req, res) {   
	var email = req.body.email,  
		password = req.body.password,
		acc_type = req.body.atype;

	switch(acc_type){
		case 'login':
			firebase.auth().signInWithEmailAndPassword(email, password).then(function() {

				res.status(200).send('You are loggedin successfully');
			  }).catch(function(error) {

			    // Handle Errors here.
			    res.status(500).send(error.message);	
			});
		break;
		case 'register':
			firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {

				res.status(200).send('You are registered successfully');
			  }).catch(function(error) {

			    // Handle Errors here.
			    res.status(500).send(error.message);	
			});
		break;
	}

});	
app.get('/authUser', function(req, res) { 

	firebase.auth().onAuthStateChanged(function(userInfo) {

	  var user = firebase.auth().currentUser;
	  if (user != null) {
	    // User is signed in.	
	    res.status(200).send({email: user.email, uid: user.uid});
	    // ...
	  } else {
	  	//console.log('no user');
	    // No user is signed in.
	    res.status(500).send(' No user is signed in');
	  }
	});
});

app.get('/logout', function(req, res) { 

	firebase.auth().signOut().then(function() {
	  // Sign-out successful.
	  res.status(200).send('You are logout successfully');
	}).catch(function(error) {
	  // An error happened.
	  res.status(500).send(error.message);	
	});
});
/*************** END API ***************/
//app.get('/', (req, res) => res.send('Hello World!'))

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(5000, () => console.log('Example app listening on port 5000!'))