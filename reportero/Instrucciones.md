# Especificación de Requisitos del Caso de Estudio 2

## Sistema de Gestión de Solicitudes para una Empresa de Reporteros

**Nombres:** \[Nombre manuscrito parcialmente ilegible\] / Andrés Silva

**Instrucciones:** El caso de estudio consta de 3 ejercicios que se van
desarrollando de forma incremental. No debes pasar al ejercicio 2 hasta
que no te asegures que el ejercicio 1 funciona perfectamente, ni pasar
al 3 hasta que el 2 no funcione perfectamente. **Lo importante del
ejercicio no es que lo acabes todo, sino que lo que hagas, lo hagas
bien.**

## Ejercicio 1

El futuro sistema se llamará SIGER (Sistema de GEstión de Reporteros), y
pretende automatizar el proceso de presentación de solicitudes de
reporteros a la empresa Journ SL, que actualmente se realiza a mano.
Esta empresa se dedica a la gestión de artículos para su distribución a
editoriales de prensa.

La empresa Journ SL opera con reporteros que trabajan para ella como
profesionales libres. Para poder trabajar en la empresa, los reporteros
deben presentar una solicitud que es evaluada por el responsable de la
empresa, quien decide si el reportero pasa a formar parte de la bolsa de
reporteros de la empresa o no. Los reporteros que están en la bolsa
están clasificados en cuatro categorías de calidad, en base a los cuales
cobran un precio por página escrita. Los reporteros pueden promocionar
de categoría.

La funcionalidad del sistema se puede resumir en estos tres puntos:

-   Dar de alta una nueva solicitud.
-   Aprobar solicitudes.
-   Gestionar categorías.
-   Promocionar reportero.

### 1.1 Dar de alta una nueva solicitud

Esta funcionalidad pretende mantener un histórico de las solicitudes que
se van presentando, ya que un reportero puede presentar más de una
solicitud (en caso de que haya sido rechazado en anteriores ocasiones).
Cada solicitud tendrá un Identificador, una fecha, una descripción del
equipo fotográfico (si es que tiene) y un resumen del CV del reportero.

Además, la solicitud que se presente si es la primera para un reportero,
éste debe proporcionar sus datos personales: DNI, nombre, apellidos,
dirección, ciudad, código postal, teléfono. Es posible que la solicitud
sea rechazada, por lo tanto, un mismo reportero puede presentar varias
solicitudes a lo largo de su vida. Entre varias solicitudes, los datos
personales de los reporteros no varían. Lo único que varía es su equipo
fotográfico y su CV. Existe una restricción a la hora de presentar la
solicitud, y es que un reportero no puede presentar más de una solicitud
por mes, ya que se considera que en menos de un mes no habrá modificado
sustancialmente ni su equipo ni su CV. El sistema debe mantener todo el
histórico de solicitudes que ha presentado un reportero. Las solicitudes
las introduce el secretario en el sistema, y debe poder listar todo el
conjunto de solicitudes existentes.

### 1.2 Aprobar solicitudes

Una vez al mes se reúne la dirección de la empresa y dice qué
solicitudes de reportero van a ser aprobadas. Una vez se ha hecho una
lista de reporteros aceptados, esta lista se pasa al secretario, que se
encarga de actualizar la información en el sistema. Por cada reportero
aprobado se debe especificar la categoría en el cual entra. El
secretario debe poder listar el conjunto de solicitudes aceptadas.

### 1.3 Gestionar categorías

Los reporteros están asociados a una categoría que los clasifica entre
cuatro niveles. Para cada categoría hay un precio fijo que los
reporteros de ese nivel cobran por hoja escrita. Este precio puede
variar, y lo actualiza el secretario en base a las órdenes de dirección.
Para ello, introduce por cada categoría el nuevo precio por hoja
escrita. El conjunto de categorías se debe poder listar.

### 1.4 Promocionar reportero

Los reporteros pueden aumentar de categoría cuando mejoran la calidad de
sus escritos. El secretario es el encargado de almacenar la promoción en
el sistema. Por cada reportero, el secretario puede modificar la
categoría, pero solo se puede ascender a categorías superiores, nunca se
puede bajar la categoría de los reporteros.