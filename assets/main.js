/************** Playlists ************/
// submit playlists
$( ".frmplaylist" ).on( "submit", function( event ) {
  event.preventDefault();

  var obj  = $( this );
  $title = obj.find('#title').val();
  
  if(!$title || $title == undefined){
    $('.alert-danger').html('<strong>ERROR ! </strong> Enter your title').show().delay(3000).fadeOut();
    return false;
  }

  $.post("/create-playlist",
    obj.serialize(),
    function(data, status){
      obj.find("input[type=text]").val("");
      obj.find("textarea").val("");

      $('.alert-success').html('<strong>'+ status +' ! </strong>'  + data).show().delay(3000).fadeOut();

      getPlaylists();

    }).fail(function(error) { 

      $('.alert-danger').html('<strong>'+ error.status +' ! </strong>'  + error.responseText).show().delay(3000).fadeOut();
    });
});

// Get playlists
const playArr = [];

function getPlaylists(){
    var sHtml = '';
   
    $.get("/get-playlist", function(data, status){ 

      $.each( data, function( key, value ) {
        playArr[key] = value;
        var sdata = value["title"];
        sdata += value["description"]? ', '+ value["description"] : '';  

        sHtml += '<li class="list-group-item" id="'+key+'">'+ sdata +' <span class="float-right"><a href="javascript:void(0);" onclick="editItem(this)">edit</a> | <a href="javascript:void(0);" class="delete" onclick="deleteItem(this)">delete</a></span></li> ';
      });      
      $('.list-group').html(sHtml);         
     
    }).fail(function(error) { 

      $('.alert-danger').html('<strong>'+ error.status +' ! </strong>'  + error.responseText).show().delay(3000).fadeOut();
    });
}
// delete playlists
function deleteItem(obj){
  var id = $(obj).parents('.list-group-item').attr('id');

  if(confirm("Are you sure you want to delete this?")){

    $.get("/delete-playlist/"+id , function(data, status){  
      $(obj).parents('.list-group-item').hide();     
      $('.alert-success').html('<strong>'+ status +' ! </strong>'  + data).show().delay(3000).fadeOut();

    }).fail(function(error) { 

      $('.alert-danger').html('<strong>'+ error.status +' ! </strong>'  + error.responseText).show().delay(3000).fadeOut();
    });
  }
  else{
      return false;
  }
}
// edit playlists
function editItem(obj){
  var id = $(obj).parents('.list-group-item').attr('id');

  $(".frmplaylist").each(function(){
    $(this).find(':input').each(function(){
    
        if($(this).attr("id") != undefined){
          if($(this).attr("id") == 'playId'){
            $('#'+ $(this).attr("id")).val(id);
          }else{
            $('#'+ $(this).attr("id")).val(playArr[id][$(this).attr("id")]);
          }
        }
   
     });
  });

}

/******* Login /Signup ********/
$( ".frmuser" ).on( "submit", function( event ) {
  event.preventDefault();

 // console.log( $( this ).serialize() );
  var obj  = $( this );
  $email = obj.find('#email').val();
  $password = obj.find('#password').val();  

  if(!$email || $email == undefined){
    $('.alert-danger').html('<strong>ERROR ! </strong> Enter your email').show().delay(3000).fadeOut();
    return false;
  }

  if(!$password || $password == undefined){
    $('.alert-danger').html('<strong>ERROR ! </strong> Enter your password').show().delay(3000).fadeOut();
    return false;
  }

  $.post("/account",
    obj.serialize(),
    function(data, status){ 
      $('.alert-success').html('<strong>'+ status +' ! </strong>'  + data).show().delay(3000).fadeOut();
      authUser();

  }).fail(function(error) { 
      $('.alert-danger').html('<strong>'+ error.status +' ! </strong>'  + error.responseText).show().delay(3000).fadeOut();
  });

});

function signout(){
  $.get("/logout", function(data, status){  
    
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");

      $('.alert-success').html('<strong>'+ status +' ! </strong>'  + data).show().delay(3000).fadeOut();

      disableAuthElements();

  }).fail(function(error) { 

    $('.alert-danger').html('<strong>'+ error.status +' ! </strong>'  + error.responseText).show().delay(3000).fadeOut();
  });
}

function authUser(){
    $.get("/authUser", function(data, status){  
      if(data){
        // Store
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userId", data.uid);

        $('#logout').find('strong').text(data.email);
        enableAuthElements();

      }
      /*else{
        $('#logout').hide();
        $('#login').show();
      }*/ 
    }).fail(function(error) { 

       disableAuthElements();
    });
}

function enableAuthElements(){
    $('#login').hide();
    $('#logout').show();
    $("#playlist").find('button[type=submit]').attr('disabled', false);
    $('#allLists > li').find('span > a').removeClass('disabled');
}

function disableAuthElements(){
    $('#logout').hide();
    $('#login').show();
    $("#playlist").find('button[type=submit]').attr('disabled', true);
    $('#allLists > li').find('span > a').addClass('disabled');
}


$(function () {
  $('#myTab a:first').tab('show');

  if(localStorage.getItem("userId")){
    enableAuthElements();
  }else{
    disableAuthElements();
  }

  authUser();

  // get playlists
  getPlaylists();
});