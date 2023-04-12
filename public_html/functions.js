const { cookie } = require("express/lib/response");

var currUser = '';

function login() {
    setUser();
    let u = document.getElementById("existingUser").value;
    let p = document.getElementById("existingPassword").value;
    let url = '/find/user/'+ u + '/' + p;
    let p1 = fetch(url)
    p1.then((response) => { 
        response.text().then((message) => {
            if (message == "login success") { 
                window.location.href = "main.html"; //reroutes if login is successful
            } else {
                alert('login failed');
            }
        });
    });
    p1.catch(error => {
        alert(error);
    });
    document.getElementById("existingUser").value = '';
    document.getElementById("existingPassword").value = '';
}

function createAccount() { // need to figure out password salting and hashing
    let u = document.getElementById("newUser").value;
    let p = document.getElementById("newPassword").value;
    let g = [];
    let url = '/create/user/';
    let data = { username: u, password: p, games: g};
    let create = fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    });
    create.then((response) => {
        response.text().then((message) => {
            alert(message);
        })
    });
    create.catch((error) => alert(error));
    document.getElementById("newUser").value = ''; //resets textbox
    document.getElementById("newPassword").value = '';
}

function createNewGame() {
    setUser();
    let difficulty = document.getElementById('gameDifficulty').value;
    let url = '/app/create/game/'+currUser+'/'+difficulty;
    // let create = fetch(url);

    // TODO: how to create a new game by fetching from the server side
}

function setUser() {
    currUser = document.cookie.split('%22')[3]; //this separates the username from the cookie and assigns it to currUser
    if (currUser == undefined) { //checks if cookie has expired
        alert('User session expired. Please log back in.')
        window.location.href = 'index.html';
    }
}