var x,xmlhttp,xmlDoc

function displayBike(i) {
  document.getElementById("showBike").innerHTML =
  "Firma: " +
  x[i].getElementsByTagName("firma")[0].childNodes[0].nodeValue +
  "<br>Nume: " +
  x[i].getElementsByTagName("nume")[0].childNodes[0].nodeValue +
  "<br>Pret: " + 
  x[i].getElementsByTagName("pret")[0].childNodes[0].nodeValue;

  if(x[i].getElementsByTagName("nota").length != 0){
    document.getElementById("showBike").innerHTML += "<br>Nota: " +
    x[i].getElementsByTagName("nota")[0].childNodes[0].nodeValue;
  }
  if(x[i].getElementsByTagName("an_fabricatie").length != 0){
    document.getElementById("showBike").innerHTML += "<br>An fabricatie: " +
    x[i].getElementsByTagName("an_fabricatie")[0].childNodes[0].nodeValue;
  }
  if(x[i].getElementsByTagName("stoc").length != 0){
    document.getElementById("showBike").innerHTML += "<br>Stoc: " +
    x[i].getElementsByTagName("stoc")[0].childNodes[0].nodeValue;
  }
  document.getElementById("showBike").innerHTML += "<br>Componenete: <ul>" +
  "<li>Cadru: " + x[i].getElementsByTagName("cadru")[0].childNodes[0].nodeValue +
  "</li><li>Furca: " + x[i].getElementsByTagName("furca")[0].childNodes[0].nodeValue +
  "</li><li>Schimbator: " + x[i].getElementsByTagName("schimator")[0].childNodes[0].nodeValue +
  "</li><li>Frane: " + x[i].getElementsByTagName("frane")[0].childNodes[0].nodeValue +
  "</li><li>Roti: " + x[i].getElementsByTagName("roti")[0].childNodes[0].nodeValue +
  "</li></ul>";
  
}


function incarcaBiciclete() {
  
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", "\\resurse\\biciclete.xml", false);
  xmlhttp.send();
  xmlDoc = xmlhttp.responseXML; 
  x = xmlDoc.getElementsByTagName("produs");
  table="<tr><th>Firma</th><th>Nume</th></tr>";
  for (i = 0; i <x.length; i++) { 
    table += "<tr onclick='displayBike(" + i + ")'><td>";
    table += x[i].getElementsByTagName("firma")[0].childNodes[0].nodeValue;
    table += "</td><td>";
    table +=  x[i].getElementsByTagName("nume")[0].childNodes[0].nodeValue;
    table += "</td></tr>";
  }
  document.getElementById("demo").innerHTML = table;
  document.getElementById("loadBike").innerHTML = "Incarcat!";
}