var myWorker = new Worker('\\..\\..\\js\\worker.js');


var id_db = 0;

var product = {
    id: 0,
    nume: "",
    cantitate: ""
}

class Produs {
    constructor(n, c, id) {
        this.id = id;
        this.nume = n;
        this.cantitate = c;
    }
    save() { }
}

class Produs_db extends Produs {
    constructor(n, c, id) {
        super(n, c, id);
    }
    save() {
        console.log(this.id + " " + this.cantitate + " " + this.nume)
        //deschid o baza de date
        var OpenRequest = window.indexedDB.open("database12", 1);

        //error handlers
        OpenRequest.onerror = event => {
            console.error("Database error: " + event.target.errorCode);
        }
        OpenRequest.onupgradeneeded = function (event) {
            console.log("upgrade")
            let db = event.target.result;

            //objectStore holds information about my products
            if (!db.objectStoreNames.contains('produse')) {
                var objectStore = db.createObjectStore("produse", { keyPath: "id" });
            }
            objectStore.createIndex('id', 'id', { unique: true })
            objectStore.createIndex('nume', 'nume', { unique: false })
            objectStore.createIndex('cantitate', 'cantitate', { unique: false })

        }
        OpenRequest.onsuccess = function (event) {
            console.log("succes")
            let db = OpenRequest.result;

            console.log("open")
            let transaction = db.transaction("produse", "readwrite")
            let produse = transaction.objectStore("produse")


            let request = produse.add(product)

            request.onsuccess = function () {
                console.log("product added to db");
                getDBList();
                var table = "";

                table += "<tr><td>";
                table += product.id;
                table += "</td><td>";
                table += product.nume;
                table += "</td><td>";
                table += product.cantitate;
                table += "</td></tr>";
                document.getElementById("lista_cumparaturi").innerHTML += table;

            }
            request.onerror = function () {
                console.log("Nu s a putut adauga produsul")

            }

        }
        return null
    }

}

function getDBList_click() {
    table = "<tr><th>Id</th><th>Nume</th><th>Cantitate</th></tr>"
    document.getElementById("lista_cumparaturi").innerHTML = table;
    for (let k = 1; k < id_db + 1; k++) {
        getDBList(k);
    }
}

function getDBList(k) {
    var OpenRequest = window.indexedDB.open("database12", 1);
    var table = ""
    OpenRequest.onsuccess = function (event) {
        let db = OpenRequest.result;
        let request = db.transaction(['produse']).objectStore('produse').get(k);
        request.onerror = event => {
            console.log(request.result);
        };
        request.onsuccess = event => {
            console.log(request.result);
            // Do something with the request.result!
            console.log("show db");
            console.log(request.result.id);
            table += "<tr><td>";
            table += request.result.id;
            table += "</td><td>";
            table += request.result.nume;
            table += "</td><td>";
            table += request.result.cantitate;
            table += "</td></tr>";
            document.getElementById("lista_cumparaturi").innerHTML += table;
        };

    };

}
class Produs_ls extends Produs {
    constructor(n, c, id) {
        super(n, c, id);
    }
    save() {
        adauga_clicked("save");
    }
}


function form_db() {
    var num = document.getElementById("name").value;
    var can = document.getElementById("cantitate").value;
    id_db = id_db + 1;
    var DB = new Produs_db(id_db, num, can);

    product.id = id_db;
    product.cantitate = can;
    product.nume = num;

    DB.save();
}

// Produs.prototype.toJson = function(){
//     return JSON.stringify({nume: this.nume, cantitate: this.cantitate});
// };

// Produs.fromJson = function(json){
//     var data = JSON.parse(json);
//     return new Produs(data.nume, data.cantitate);
// }

function clear_list() {
    var type = document.getElementById("type_select").value;
    if (type == "web-api") {
        localStorage.clear();
        console.log("storage cleared!")
        console.log(localStorage.length)
        document.getElementById("lista_cumparaturi").innerHTML = "<tr><th>Id</th><th>Nume</th><th>Cantitate</th></tr>";
    }
    else {
        var OpenRequest = window.indexedDB.open("database12", 1);
        OpenRequest.onsuccess = (e) => {
            let db = OpenRequest.result;
            let request = db.transaction('produse', 'readwrite').objectStore('produse').clear();
            request.onsuccess = () => {
                document.getElementById("lista_cumparaturi").innerHTML = "<tr><th>Id</th><th>Nume</th><th>Cantitate</th></tr>";
                console.log("db cleared");
            }
            request.onerror = (err) => {
                console.log("db clear error");
            }
        };
    }
}

function load_from_storage() {
    console.log("loading in progress");
    table = "<tr><th>Id</th><th>Nume</th><th>Cantitate</th></tr>"
    for (let aux = 1; aux < localStorage.length + 1; aux++) {
        nm = JSON.parse(localStorage.getItem(aux)).nume;
        cn = JSON.parse(localStorage.getItem(aux)).cantitate;
        id = JSON.parse(localStorage.getItem(aux)).id;
        table += "<tr><td>";
        table += id;
        table += "</td><td>";
        table += nm;
        table += "</td><td>";
        table += cn;
        table += "</td></tr>";
    }

    document.getElementById("lista_cumparaturi").innerHTML = table;

    var OpenRequest = window.indexedDB.open("database12");
    OpenRequest.onsuccess = function (event) {
        let db = OpenRequest.result;
        let transaction = db.transaction("produse", "readwrite");
        let produse = transaction.objectStore("produse");
        var countRequest = produse.count();
        countRequest.onsuccess = function () {
            id_db = countRequest.result;
            console.log(countRequest.result);
        };

        console.log("loading finished");
    };
}

function show() {
    var type = document.getElementById("type_select").value;
    if (type == "web-api") {
        load_from_storage()
    }
    else {
        getDBList_click();
    }
}


function adauga_clicked(msg = "") {
    var type = document.getElementById("type_select").value;
    if (type == "web-api" || msg == "save") {
        var num = document.getElementById("name").value;
        var can = document.getElementById("cantitate").value;

        let i = localStorage.length + 1;
        let prod = new Produs_ls(num, can, i);
        console.log(prod);

        console.log(i);
        localStorage.setItem(i, JSON.stringify(prod));
        console.log(localStorage.getItem(i));
        console.log(JSON.parse(localStorage.getItem(i)));

        myWorker.postMessage([JSON.parse(localStorage.getItem(i)), i]);
        console.log('Message posted to worker');
    }
    else {
        form_db();
    }
}

myWorker.onmessage = function (e) {
    console.log(e.data[0]);
    console.log('Message received from worker');
    table = "";
    table += "<tr><td>";
    table += e.data[0];
    table += "</td><td>";
    table += e.data[1];
    table += "</td><td>";
    table += e.data[2];
    table += "</td></tr>";

    document.getElementById("lista_cumparaturi").innerHTML += table;
}



