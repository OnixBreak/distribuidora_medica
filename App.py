import subprocess
import socket
import time
import os
import psutil
import requests

CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe"
NODE_COMMAND = ["node", "app.js"]
URL = "http://localhost:3000"

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def check_localhost_alive():
    try:
        res = requests.get(URL, timeout=1)
        return res.status_code == 200
    except:
        return False

def run_node_server():
    print("Ejecutando servidor Node.js...")
    return subprocess.Popen(NODE_COMMAND)

def open_chrome_app():
    user_data_dir = os.path.abspath("chrome_profile_3000")

    time.sleep(2)
    print("Abriendo Chrome en modo app...")
    return subprocess.Popen([
        CHROME_PATH,
        f'--app={URL}',
        f'--user-data-dir={user_data_dir}'
    ])


def main():
    node_proc = None

    # Ejecutar servidor inicialmente
    if not is_port_in_use(3000):
        node_proc = run_node_server()
    else:
        print("Ya hay algo en el puerto 3000, no se lanza Node.")

    time.sleep(2)  # Dar tiempo a que arranque
    chrome_proc = open_chrome_app()

    try:
        while True:
            time.sleep(2)

            # Verificar si Chrome se cerró
            if chrome_proc.poll() is not None:
                print(f"Chrome cerrado. Código de salida: {chrome_proc.returncode}")
                print("Chrome cerrado. Cerrando Node.js...")
                if node_proc and node_proc.poll() is None:
                    node_proc.terminate()
                break

            # Verificar si el servidor dejó de estar accesible
            if not check_localhost_alive():
                print("Servidor Node.js no responde.")
                if node_proc and node_proc.poll() is None:
                    node_proc.terminate()
                    print("Node.js cerrado.")
                print("Reiniciando servidor Node.js...")
                node_proc = run_node_server()

    except KeyboardInterrupt:
        print("Interrupción manual. Cerrando todo...")
        if chrome_proc.poll() is None:
            chrome_proc.terminate()
        if node_proc and node_proc.poll() is None:
            node_proc.terminate()

if __name__ == "__main__":
    main()
