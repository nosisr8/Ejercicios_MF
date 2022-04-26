## Instalar dependencias NodeJS
npm install

## MongoDB
config mongodb://127.0.0.1:27017/mf_test

## Inicializar Api Rest
npm start

## Importar la collection a Postman
Path: Ejercicios_MF/Postman/LocalHost.postman_environment.json

## Environment Postman
* url_base: http://localhost:3000
* Token: Puedes consultar o generar un nuevo toquen con el metodo de "users/login"

# Metodos 
## Usuarios
* Agregar Usuario: {{url_base}}/users -> POST
* Listar Usuarios: {{url_base}}/users -> GET
* Mis datos: {{url_base}}/users/me -> GET
* Modificar Usuario: {{url_base}}/users/:userID -> PUT
* Eliminar Usuario: {{url_base}}/users/::userID -> DELETE
* Login: {{url_base}}/users/login -> POST

## Cuentas
* Listar cuentas: {{url_base}}/cuentas -> GET
* Generar token transferencia: {{url_base}}/cuentas/generarToken -> POST

## Movimientos
* Listar movimientos: {{url_base}}/movimientos -> GET
* Depositar: {{url_base}}/movimientos/depositar -> POST
* Extraccion: {{url_base}}/movimientos/extraccion -> POST
* Transferancia: {{url_base}}/movimientos/transferencia -> POST
