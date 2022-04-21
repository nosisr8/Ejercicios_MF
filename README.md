# Ejercicios_MF
Ejercicios técnicos

## Modelado (Backend)

Necesitamos representar el funcionamiento de una Caja de ahorro que deberá ir aumentando su funcionalidad en iteraciones incrementales.

1. **Depositar y extraer dinero en la cuenta.**
2. T**ransferir dinero a otra cuenta.**
3. **Listar los movimientos con monto, fecha, hora y tipo (transferencia entre cuentas, depósito o extracción).**

## Diseño de componentes (Frontend)

Necesitamos diseñar el siguiente componente

1. **Reposo, solamente nos indica que podemos escribir en él.**
2. **Desplegado, al hacer click nos despliega la lista con las categorías de gastos disponibles.**
    1. Este estado nos habilita a escribir en el input que contiene el selector y a medida que escribimos los resultados tienen que irse filtrando para contener parte del texto escrito. Es decir, si escribimos "ci", el listado de categorías puede mostrar "Estación de servicio", y "Farmacia".
3. **Escrito, este estado nos muestra la opción seleccionada o bien el texto escrito.**
    1. Al ingresar un texto que no coincide con ninguna de las categorías mostradas y presionar "Enter", el texto ingresado aparecerá como una nueva categoría disponible (en este paso deberás simular una request al backend para agregar esta nueva categoría).
    2. Al ingresar un texto que coincide con una de las categorías mostradas no se agrega ninguna categoría nueva.