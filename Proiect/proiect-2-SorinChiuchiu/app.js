'use strinct'

var requestIp = require('request-ip');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
var popup = require('alert');

var ip = require("ip");

const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser')
var db;
const app = express();

const port = 6789;

// 'use strict';
var blockedip = {};
var blockedUser = {};

var listaIntrebari = [];
var fs = require('fs');
const { resolveSoa } = require('dns');
const req = require('express/lib/request');
fs.readFile('intrebari.json', (err, data) => {
	if (err) throw err;
	listaIntrebari = JSON.parse(data);
	// console.log(listaIntrebari);
});

var listaUtilizatori = [];
fs = require('fs');
fs.readFile('utilizatori.json', (err, data) => {
	if (err) throw err;
	listaUtilizatori = JSON.parse(data);
	// console.log(listaUtilizatori);
});
var produse = [];

function isBlocked(req) {
	var ip_adress = ip.address();

	if (ip_adress in blockedip || req.session.user in blockedUser) {
		//console.log("fdsssssssssssssssssss")
		if (blockedip[ip_adress] > new Date() || blockedUser[req.session.user] > new Date())
			return true;
		else
			return false;
	}
	else {
		console.log("not blocked")
		return false;
	}
}

var blockedip_login = {};

function isBlockedLogin() {
	var ip_adress = ip.address();
	// console.log(ip_adress)
	if (ip_adress in blockedip_login) {
		//console.log("fdsssssssssssssssssss")
		if (blockedip_login[ip_adress] > new Date())
			return true;
		else
			return false;
	}
	else {
		console.log("not blockedfdsadfsfsdf");
		return false;
	}
}

//let jsonData = require('intrebari.json');
//console.log(jsonData);

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
app.use('/public', express.static('public'));
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}))
// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
	if (!(isBlocked(req))) {
		// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
		res.render('chestionar', { intrebari: listaIntrebari.intrebari, msg: req.session.user });
	}
	else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

app.post('/rezultat-chestionar', (req, res) => {
	if (!(isBlocked(req))) {
		console.log(listaIntrebari);
		// res.send("formular: " + JSON.stringify(req.body));
		punctaj = 0;
		console.log(listaIntrebari.intrebari.length);
		for (i in req.body) {
			var index = parseInt(i.replace('q', ''));
			console.log(req.body[i]);
			if (req.body[i] == listaIntrebari.intrebari[index].corect)
				punctaj++;
		}
		res.render('rezultat-chestionar', { p: punctaj, cnt: listaIntrebari.intrebari.length, msg: req.session.user });
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

app.get('/', (req, res) => {
	if (req.session.user == null) {
		res.render('index', { msg: "", produse });
	}
	else
		res.render('index', { msg: req.session.user, produse });
});

app.get('/autentificare', (req, res) => {
	if (!(isBlocked(req)) && !(isBlockedLogin())) {
		if (req.session.err != null) {
			aux = req.session.err;
			req.session.err = null;
			res.render('autentificare', { msg: aux });
		}
		else
			res.render('autentificare', { msg: "" });
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		console.log(blockedip)

		res.redirect('/');
	}
});

app.get('/admin', (req, res) => {
	if (!(isBlocked(req))) {
		res.render('admin', { msg: req.session.user });
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		console.log(blockedip)
		res.redirect('/');
	}
});

app.get('/creare-bd', (req, res) => {
	if (!(isBlocked(req))) {
		console.log("here");
		db = new sqlite3.Database('./cumparaturi.db', sqlite3.OPEN_READWRITE, (err) => {
			if (err && err.code == "SQLITE_CANTOPEN") {
				console.log("create database");
				createDatabase();
				res.redirect('/');
				return;
			} else if (err) {
				console.log("Getting error " + err);
				exit(1);
			}
			console.log("exista");
			res.redirect('/');
		});
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

function createDatabase() {
	var newdb = new sqlite3.Database('cumparaturi.db', (err) => {
		if (err) {
			console.log("Getting error " + err);
			exit(1);
		}
		console.log("create table now");
		createTable(newdb);
	});
}

function createTable(newdb) {
	console.log("i arrived");
	newdb.exec(`
	create table produse (
		id integer primary key not null,
		nume text not null,
		gramaj text not null,
		pret real not null
	);`, (err) => { console.log(err); });
}
app.get('/inserare-bd', (req, res) => {
	if (!(isBlocked(req))) {
		db = new sqlite3.Database("cumparaturi.db", (err) => {
			if (err) {
				console.log("Baza de date nu a fost creata!");
			}
			else {
				console.log("Conectat la baza de date");
				db.exec(`insert into produse (id, nume, gramaj, pret) 
			values (1, "Cafea", "275ml", 15),
			(2, "ceai", "250ml", 12),
			(3, "latte", "150ml", 18),
			(4, "red tea", "250ml", 15);`, (err) => { console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa " + err); });
				db.all(`select * from produse;`, (err, result) => {
					if (err) {
						console.log(err);
						//res.render('index', { u: req.cookies.utilizator });
					}
					else {
						console.log(result);
						produse = result;
						console.log(produse)
					}
				});
				res.redirect('/');
			}
		})
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

var cos = []
var counts = {};
var total = 0;
app.get('/vizualizare-cos', async (req, res) => {
	if (!(isBlocked(req))) {
		if (req.session.order != null) {
			cos = [];
			total = 0;
			counts = {};

			for (const num of req.session.order) {
				//console.log
				counts[num] = counts[num] ? counts[num] + 1 : 1;

			}
			console.log(counts[1], counts[2], counts[3], counts[4]);
			// console.log("aaaaaaaaaaaaaaaaaaaaaaaa")
			for (i in produse) {
				// console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
				if (counts[produse[i].id] != null) {
					console.log("hereeeee " + counts[produse[i].id])
					let prod = await new Promise((resolve, reject) => {
						// console.log("cccccccccccccccccccc")
						console.log("aaaaaaaaaaaaaaaa   " + produse[i].id)
						db.all(`select * from produse where id=` + produse[i].id + `;`, (err, rows) => {
							if (err) console.log("aaaaaaaaaaaaa" + err)
							resolve(rows);
						});
					});
					// console.log(prod);
					var a = counts[produse[i].id] + "x " + prod[0].nume + ", " + prod[0].gramaj + ", " + prod[0].pret + "ron";
					total += counts[produse[i].id] * prod[0].pret;
					cos.push(a);
					console.log(cos);
					console.log(total);
					for (aux in cos) {
						console.log(aux)
					}
				}
			}
			res.render('vizualizare-cos', { cos: cos, pret: total, msg: req.session.user });
			// res.redirect('/');
		}
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

app.post('/adaugare-cos', (req, res) => {
	if (!(isBlocked(req))) {
		console.log(req.body.id)
		req.session.order.push(req.body.id)
		console.log(req.session.order)
		res.redirect('/')
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

function checkInsertion(nume, cantitate, pret) {
	if (!(/^[a-zA-Z ]+$/.test(nume)))
		return false
	else if (!(/^[0-9]+ml$/.test(cantitate)))
		return false
	else if (!(/^[0-9]+.?[0-9]?$/.test(pret)))
		return false;
	else
		return true;
}


app.post('/add_product', (req, res) => {
	if (!(isBlocked(req))) {
		console.log(req.body.product_name)
		if (checkInsertion(req.body.product_name, req.body.product_quantity, req.body.product_price)) {


			var aux_id = produse.length + 1;
			console.log(aux_id)
			db = new sqlite3.Database("cumparaturi.db", (err) => {
				if (err) {
					console.log("Baza de date nu a fost creata!");
				}
				else {
					console.log("Conectat la baza de date");
					db.run(`insert into produse (id, nume, gramaj, pret) 
			values (?, ?, ?, ?)`, parseInt(aux_id), req.body.product_name, req.body.product_quantity, parseFloat(req.body.product_price));
					db.all(`select * from produse;`, (err, result) => {
						if (err) {
							console.log(err);
							//res.render('index', { u: req.cookies.utilizator });
						}
						else {
							console.log(result);
							produse = result;
							console.log(produse)
						}
					});
					res.redirect('/');
				}
			})
		}
		else {
			popup("Date invalide!");
			res.redirect('admin');
		}
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

function readDB() {
	db = new sqlite3.Database("cumparaturi.db", (err) => {
		if (err) {
			console.log("Baza de date nu a fost creata!");
		}
		else {
			db.all(`select * from produse;`, (err, result) => {
				if (err) {
					console.log(err);
					//res.render('index', { u: req.cookies.utilizator });
				}
				else {
					console.log(result);
					produse = result;
					console.log(produse)
				}
			});
		}
	})
};

// var last_login_dif = 9999;
var incercari_acces_logare = {};
app.post('/verificare-autentificare', (req, res) => {
	if (!(isBlocked(req))) {
		console.log(req.body);
		// res.send("formular: " + JSON.stringify(req.body));
		// res.clearCookie('utilizator');
		var check = false;
		listaUtilizatori.utilizatori.forEach(element => {
			if (element.nume == req.body['username'] && element.parola == req.body['parola']) {
				// res.cookie('utilizator', req.body['username']);
				req.session.user = req.body['username'];
				req.session.order = [];
				check = true;
				incercari_acces_logare = {};
				if (req.body['username'] != "admin") {
					res.redirect('/');
					return;
				}
				else {
					readDB();
					res.redirect('admin');
					return;
				}
			}

		});
		if (!check) {
			var ip_adress = ip.address();
			if (ip_adress in incercari_acces_logare) {
				incercari_acces_logare[ip_adress] += 1
			}
			else {
				incercari_acces_logare[ip_adress] = 1;
			}
			if (incercari_acces_logare[ip_adress] >= 3) {

				var last_login_dif = Math.abs(new Date() - blockedip_login[ip_adress]) / 1000;
				console.log(last_login_dif)
				var blockedTill = new Date(new Date().getTime() + 7 * 1000);
				if (last_login_dif < 10) {
					console.log("dsafssddsdsdd")
					blockedip[ip_adress] = blockedTill;
					blockedip_login[ip_adress] = blockedTill
					if (req.body['username'] != null) {
						blockedUser[req.body['username']] = blockedTill
					}
				}
				else {
					console.log("hereeeeeee")

					blockedip_login[ip_adress] = blockedTill;
				}
				console.log(blockedip_login)
				incercari_acces_logare[ip_adress] = incercari_acces_logare[ip_adress] - 2;
				popup("Adresa: " + ip_adress + " a fost blocata temporar!");
				check = true;
				res.redirect('/');

			} else {
				req.session.err = "Nume sau parola invalide!";
				res.redirect('autentificare');
			}
		}
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

app.post('/logout', (req, res) => {
	if (!(isBlocked(req))) {
		req.session.destroy();
		res.redirect('/');
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

app.post('/resetBlocked', (req, res) => {
	blockedip = {}
});

app.post('/clear_basket', (req, res) => {
	if (!(isBlocked(req))) {
		req.session.order = [];
		res.redirect('/')
	} else {
		popup("UTLIZATOR BLOCAT TEMPORAR");
		res.redirect('/');
	}
});

var ip_neregulamentar = [];
var incercari_acces = {};
app.use(function (err, req, res, next) {
	if (res.status(404)) {
		var ip_adress = ip.address();

		if (ip_neregulamentar.includes(ip_adress)) {
			incercari_acces[ip_adress] += 1
		}
		else {
			ip_neregulamentar.push(ip_adress);
			incercari_acces[ip_adress] = 1;
		}
		console.log(ip_neregulamentar)
		console.log(incercari_acces)


		console.log(incercari_acces[ip_adress])
		var seconds = 10;
		// while (waitTill > new Date()) { }
		popup("RESURSA INTERZISA!!");

		if (incercari_acces[ip_adress] >= 3) {
			var blockedTill = new Date(new Date().getTime() + seconds * 1000);
			blockedip[ip_adress] = blockedTill;
			if (req.session.user != null) {
				blockedUser[req.session.user] = blockedTill
			}
			popup("Adresa: " + ip_adress + " a fost blocata temporar!");
		}
		res.redirect('/');
	}
})




app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:${port}`));