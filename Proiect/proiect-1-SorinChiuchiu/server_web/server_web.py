import gzip
import json
import socket
import os
import threading
import time  # pentru dimensiunea fisierului

# creeaza un server socket
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# specifica ca serverul va rula pe portul 5678, accesibil de pe orice ip al serverului
serversocket.bind(('', 5678))
# serverul poate accepta conexiuni; specifica cati clienti pot astepta la coada
serversocket.listen(5)

def ConnectionManager(client_connection):
    print('S-a conectat un client.')
    # se proceseaza cererea si se citeste prima linie de text
    cerere = ''
    linieDeStart = ''
    while True:
        buf = client_connection.recv(1024)
        if len(buf) < 1:
            break
        cerere = cerere + buf.decode()
        print('S-a citit mesajul: \n---------------------------\n' +
              cerere + '\n---------------------------')
        pozitie = cerere.find('\r\n')
        if (pozitie > -1 and linieDeStart == ''):
            linieDeStart = cerere[0:pozitie]
            print('S-a citit linia de start din cerere: ##### ' +
                  linieDeStart + ' #####')
            break
    print('S-a terminat cititrea.')
    if linieDeStart == '':
        client_connection.close()
        print('S-a terminat comunicarea cu clientul - nu s-a primit niciun mesaj.')
        # continue
    # interpretarea sirului de caractere `linieDeStart`
    elementeLineDeStart = linieDeStart.split()
    # TODO securizare
    numeResursaCeruta = elementeLineDeStart[1]
    if numeResursaCeruta == '/':
        numeResursaCeruta = '/index.html'
    numeResursaCeruta = numeResursaCeruta.replace('/', '\\')
    # calea este relativa la directorul de unde a fost executat scriptul
    numeFisier = os.path.abspath(
        __file__) + '\\..\\..\\continut' + numeResursaCeruta
    if "GET" in linieDeStart:
        print("#############============"+numeFisier)
        fisier = None
        try:
            # deschide fisierul pentru citire in mod binar
            fisier = open(numeFisier, 'rb')

            # tip media
            numeExtensie = numeFisier[numeFisier.rfind('.')+1:]
            tipuriMedia = {
                'html': 'text/html; charset=utf-8',
                'css': 'text/css; charset=utf-',
                'js': 'text/javascript; charset=utf-8',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'ico': 'image/x-icon',
                'xml': 'application/xml; charset=utf-8',
                'json': 'application/json; charset=utf-8'
            }
            tipMedia = tipuriMedia.get(numeExtensie, 'text/plain; charset=utf-8')

            
            
            
            # citeste din fisier si trimite la server
            buf = fisier.read(1024)
            all_buf = buf
            while (buf):
                # client_connection.send(buf)
                buf = fisier.read(1024)
                all_buf += buf
                
            # se trimite raspunsul
            gzip_compresed_buf = gzip.compress(all_buf)

            client_connection.sendall('HTTP/1.1 200 OK\r\n'.encode('utf-8'))
            client_connection.sendall(('Content-Length: ' +
                                str(len(gzip_compresed_buf)) + '\r\n').encode('utf-8'))
            client_connection.sendall(
                ('Content-Type: ' + tipMedia + '\r\n').encode('utf-8'))
            client_connection.sendall(('Content-Encoding: gzip' + '\r\n').encode("utf-8"))
            client_connection.sendall('Server: My PW Server\r\n'.encode('utf-8'))
            client_connection.sendall('\r\n'.encode('utf-8'))

            client_connection.send(gzip_compresed_buf)

        except IOError:
            # daca fisierul nu exista trebuie trimis un mesaj de 404 Not Found
            msg = 'Eroare! Resursa ceruta ' + numeResursaCeruta + ' nu a putut fi gasita!'
            print(msg)
            client_connection.sendall('HTTP/1.1 404 Not Found\r\n'.encode('utf-8'))
            client_connection.sendall(('Content-Length: ' +
                                str(len(msg.encode('utf-8'))) + '\r\n').encode('utf-8'))
            client_connection.sendall(
                'Content-Type: text/plain; charset=utf-8\r\n'.encode('utf-8'))
            client_connection.sendall('Server: My PW Server\r\n'.encode('utf-8'))
            client_connection.sendall('\r\n'.encode('utf-8'))
            client_connection.sendall(msg.encode('utf-8'))

        finally:
            if fisier is not None:
                fisier.close()
        client_connection.close()
        print('S-a terminat comunicarea cu clientul.')
    elif "POST" in linieDeStart:
        print('Cererea este: ' + cerere)
        lines = cerere.split('\n')
        line = lines[len(lines)-1]
        info = line.split('&')
        print(info)
        name_vector = info[0].split('=')
        name = name_vector[1]
        pass_vector = info[1].split('=')
        password = pass_vector[1]
        print('Name = ' + name)
        print('Password = ' + password)
        user = {'utilizator': name, 'parola': password}
        listObj = []
        fileName = os.path.abspath(__file__) + '\\..\\..\\continut\\resurse\\utilizatori.json'
        with open(fileName) as fp:
            listObj = json.load(fp)
        print(listObj)
        listObj.append(user)
        print(listObj)
        with open(fileName, 'w') as json_file:
            json.dump(listObj, json_file, indent=4, separators=(',', ':'))


while True:
    print('#########################################################################')
    print('Serverul asculta potentiali clienti.')
    # asteapta conectarea unui client la server
    # metoda `accept` este blocanta => clientsocket, care reprezinta socket-ul corespunzator clientului conectat
    (clientsocket, address) = serversocket.accept()
    threading.Thread(target=ConnectionManager, args=(clientsocket,)).start()
    # time.sleep(1)
    