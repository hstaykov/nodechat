	 $(document).ready(function() {
	 	$('body').layout({
	 		applyDefaultStyles: false
	 	});

	 	$("#tabs ul").append('<li><a href="#chat">Main Window</a></li>');
	 	$("#tabs").append('<div id="chat" class="chatWindows"></div>');
	 	$("#tabs").tabs();
	 });


	 // $(function() {
	 // 	$("#tabs").tabs();
	 // });


	 var userName;
	 var userColor;
	 var socketio = io.connect("127.0.0.1:3000");
	 var objDiv = $('#chat');

	 function scrollToBottom(elm_id) {
	 	var elm = document.getElementById(elm_id);
	 	try {
	 		elm.scrollTop = elm.scrollHeight;
	 	} catch (e) {
	 		var f = document.createElement("input");
	 		if (f.setAttribute) f.setAttribute("type", "text")
	 		if (elm.appendChild) elm.appendChild(f);
	 		f.style.width = "0px";
	 		f.style.height = "0px";
	 		if (f.focus) f.focus();
	 		if (elm.removeChild) elm.removeChild(f);
	 	}
	 }

	 function get_random_color() {
	 	var letters = '0123456789ABCDEF'.split('');
	 	var color = '#';
	 	for (var i = 0; i < 6; i++) {
	 		color += letters[Math.round(Math.random() * 15)];
	 	}
	 	return color;
	 }

	 function enterChat() {
	 	userName = document.getElementById("name").value;
	 	var userPassword = document.getElementById("passwordField").value;
	 	userColor = get_random_color();


	 	socketio.emit("login_event", {
	 		username: userName,
	 		password: userPassword
	 	});

	 	socketio.on('login_response', function(data) {
	 		if (data.result) {
	 			console.log("message");
	 			$("#userPanelLogin").fadeOut("fast");
	 			$("#userPanel").append("Current user: " + userName).fadeIn("slow");
	 			$("#tabs").fadeIn("slow");
	 			$("#chatControls").slideDown("slow");
	 			$("#regPanelBtn").slideUp("slow");
	 		} else {
	 			$("#wrongPass").slideDown("slow");
	 		}
	 	});
	 }


	 function getEventTarget(e) {
	 	e = e || window.event;
	 	return e.target || e.srcElement;
	 }

	 function sendMessage() {
	 	var msg = $("#message_input").val();
	 	document.getElementById("message_input").value = null;
	 	console.log("Going : " + msg + " from " + userName + " color: " + userColor);
	 	socketio.emit("message_to_server", {
	 		message: msg,
	 		user: userName,
	 		color: userColor
	 	});

	 }



	 socketio.on("message_to_client", function(data) {
	 	scrollToBottom("chat");
	 	console.log("Incoming : " + data.message);
	 	console.log("Color : " + data.color);
	 	console.log(data.usersOnline[0]);
	 	var usrs = "Online users: </br><ul id='usersList'>";
	 	$.each(data.usersOnline, function(key, value) {
	 		usrs += "<li>" + value + "</a></li></br>";
	 	});
	 	usrs += "</ul>";
	 	$("#currentOnlineUsers").html(usrs);
	 	var ul = document.getElementById('usersList');

	 	ul.onclick = function(event) {
	 		var target = getEventTarget(event);
	 		console.log(target);

	 		$("#tabs ul").append("<li><a href='#" + target.innerHTML +"Windows'>" + target.innerHTML + "</a></li>");
	 		$("#tabs").append("<div id='" + target.innerHTML + "Windows' class='chatWindows'></div>");
	 		$("#tabs").tabs();
	 	}

	 	$("#onlineUsrs").html("<div> Online users: " + data.onlineUsers + "</div>" + data.usersOnline);
	 	$('#chat').append("<div style='display: none;background:" + data.color + "'' class='new-link' >" + "<b>" + data.user + " : </b> " + data.message + "</div>")
	 	$('#chat').find(".new-link:last").slideDown("fast");
	 });



	 function register() {
	 	var regUserName = document.getElementById("regNameField").value;
	 	var pass = document.getElementById("regPasswordField").value;
	 	var passConfirm = document.getElementById("regPasswordFieldConfirm").value;
	 	if (pass != passConfirm) {
	 		$("#wrongPassMatch").slideDown("slow");
	 		document.getElementById("regPasswordField").value = null;
	 		document.getElementById("regPasswordFieldConfirm").value = null;
	 	} else {
	 		socketio.emit("register_user", {
	 			username: regUserName,
	 			password: pass
	 		});
	 		document.getElementById("regNameField").value = null;
	 		document.getElementById("regPasswordField").value = null;
	 		document.getElementById("regPasswordFieldConfirm").value = null;
	 		$("#userPanelLogin").slideDown("slow");
	 		$("#userPanelRegister").slideUp("slow");
	 		$("#closeRegBtn").slideUp("slow");
	 	}
	 }

	 function openRegFrom() {
	 	$("#userPanelLogin").slideUp("slow");
	 	$("#userPanelRegister").slideDown("slow");
	 	$("#closeRegBtn").slideDown("slow");
	 	$("#regPanelBtn").slideUp("slow");
	 }

	 function closeRegFrom() {
	 	$("#userPanelLogin").slideDown("slow");
	 	$("#userPanelRegister").slideUp("slow");
	 	$("#closeRegBtn").slideUp("slow");
	 	$("#regPanelBtn").slideDown("slow");
	 }

	 window.onunload = function doUnload(e) {

	 	socketio.emit("message_to_server", {
	 		message: "I want out!!!",
	 		user: userName
	 	});

	 	socketio.emit("disconnect", {
	 		user: userName
	 	});
	 }