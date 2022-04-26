function get_date_time(nume = "date_time") {

    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    let e = document.getElementById(nume);
    e.innerHTML = dateTime
}

function get_location() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        document.getElementById("location").innerHTML =
            "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    let e = document.getElementById("location")

    e.innerHTML = "Latitude: " + position.coords.latitude + "<br>" +
        "Longitude: " + position.coords.longitude;
}

function get_browser_version() {
    let versiune = document.getElementById("versiune");
    versiune.innerHTML = navigator.userAgent;
    console.log("sdasfdasdsasadss");
}

function get_platform_version() {
    let versiune = document.getElementById("platform");
    versiune.innerHTML = navigator.platform;
    console.log("platform version");
}

var x = null;
var y = null;
var x2 = null;
var y2 = null;
function draw(event) {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {

        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (x == null) {
            x = event.offsetX;
            y = event.offsetY;
        }
        else {
            x2 = event.offsetX;
            y2 = event.offsetY;
        }
        deb = document.getElementById("debug2");
        deb.innerHTML = "y: " + y +
            "<br>x: " + x;
        ctx.fillStyle = document.getElementById('boder_col').value;
        ctx.strokeStyle = document.getElementById('fill_col').value;
        ctx.fillRect(x, y, Math.abs(x - x2), Math.abs(y - y2));
        ctx.strokeRect(x, y, Math.abs(x - x2), Math.abs(y - y2));
    }
}
var mouse = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
};
var element = 0;
function initDraw(event) {


    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');


    if (element !== 0) {
        element = 0;
        canvas.style.cursor = "default";
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;
        ctx.fillStyle = document.getElementById('fill_col').value;
        ctx.strokeStyle = document.getElementById('boder_col').value;
        ctx.fillRect(mouse.startX, mouse.startY, Math.abs(mouse.startX - mouse.x), Math.abs(mouse.startY - mouse.y));
        ctx.strokeRect(mouse.startX, mouse.startY, Math.abs(mouse.startX - mouse.x), Math.abs(mouse.startY - mouse.y));
        console.log("finsihed.");
    } else {
        console.log("begun.");
        canvas.style.cursor = "crosshair";
        element = 1;
        mouse.startX = event.offsetX;
        mouse.startY = event.offsetY;
    }

}


function main() {
    setInterval(get_date_time, 1000);
    //get_location();
    get_browser_version();
    //get_platform_version();

    //initDraw(document.getElementById('canvas'));

}


function rowInsertion() {
    var line = document.getElementById('line').value;
    var table = document.getElementById('myTable').insertRow(line);
    var size = document.getElementById('myTable').rows[0].cells.length;
    for (var i = 0; i < size; i++) {
        var y = table.insertCell(i);
        y.innerHTML = "";
    }

}

function columnInsertion() {
    var row = document.getElementById("myTable");
    var column = document.getElementById("column").value;
    for (var i = 0; i < row.rows.length; i++) {
        row.rows[i].insertCell(column);
    }

}

function schimbaContinut(resursa, jsFisier, jsFunctie) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("continut").innerHTML = this.responseText;
            if (jsFisier) {
                var elementScript = document.createElement('script');
                elementScript.onload = function () {
                    console.log("hello");
                    if (jsFunctie) {
                        window[jsFunctie]();
                    }
                };
                elementScript.src = jsFisier;
                document.head.appendChild(elementScript);
            } else {
                if (jsFunctie) {
                    window[jsFunctie]();
                }
            }
        }
    };
    if (!resursa.includes(".xml")) {
        xhttp.open("GET", resursa, true);
    }
    else {
        xhttp.open("GET", "\\..\\resurse\\biciclete.xml", true);
    }
    xhttp.send();
}

function sendData(n, p, r) {
    fetch("\\..\\..\\resurse\\utilizatori.json")
    .then(res => res.json())
    .then(data => {
        var flag = false;
        var xml = new XMLHttpRequest();
        var name = document.getElementById(n);
        var pass = document.getElementById(p);
        if (name.value != "" && pass.value != "") {
            for (content of data) {
                // console.log(JSON.parse(data));
                console.log(content.utilizator)
                console.log(name)

                if (content.utilizator == name.value ) {
                    flag = true;
                    break;
                }
            }
            if (flag == true) {
                // document.getElementById(r).innerHTML = "Exista deja un cont cu acest nume!";
                alert("Exista deja un cont cu acest nume!");
            }
            else {
                // document.getElementById(r).innerHTML = "Cont inregistarat cu succes!";
                let data = "";
                data += "name=" + name.value + "&password=" + pass.value;
                xml.open('POST', '/api/utilizatori', true);
                xml.setRequestHeader('Content-Type', 'application/json');
                xml.send(data);         
                alert("Cont inregistarat cu succes!");
            }
        }
        else{
            alert("Nume sau parola invalide!");
        }
    });
}

function check(n, p, r="") {
    var flag = false;
    fetch("\\..\\..\\resurse\\utilizatori.json")
        .then(res => res.json())
        .then(data => {
            
            if (document.getElementById(n).value != "" && document.getElementById(p).value != "") {
                for (content of data) {
                    // console.log(JSON.parse(data));
                    if (content.utilizator == document.getElementById(n).value && content.parola == document.getElementById(p).value) {
                        flag = true;
                        break;
                    }
                }
            }
            if (flag == true && r != "") {
                // document.getElementById(r).innerHTML = "Logare cu succes!";
                alert("Logare cu succes!");
            }
            else if(r!="") {
                // document.getElementById(r).innerHTML = "Utilizator sau parolă greșite!";
                alert("Utilizator sau parolă greșite!");
            }
        }
        );
}

function validate(){
    var checker = document.getElementById('agreement');
    var sendbtn = document.getElementById('inregistrare');
    if(checker.checked){
        sendbtn.disabled = false;
    } else {
        sendbtn.disabled = true;
}
}