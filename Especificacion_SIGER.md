

**Fecha y hora:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Ejercicio 2

Los reporteros hacen reportajes de fotos. Un reportaje es un compendio
de fotos sobre un tema en concreto, por ejemplo, la boda de algún
famoso. Estos reportajes se almacenan en el sistema y aquellas
editoriales que deseen los reportajes, deben pagar a la agencia para
conseguir las fotos. Con el dinero recogido, se paga a los reporteros
que hicieron el reportaje y el resto de ingresos se los queda la agencia
fotográfica. La funcionalidad que hay que soportar es la siguiente:

-   Dar de alta un reportaje nuevo.
-   Gestionar datos de las editoriales.
-   Adquirir un reportaje.

### 2.1 Dar de alta un reportaje nuevo

Esta funcionalidad almacena en el sistema un nuevo reportaje de fotos.
Para cada reportaje, el secretario indica: el reportero que tomó las
fotos, el número de fotos que incluye en reportaje, y una breve
descripción del contenido del reportaje. El reportaje queda así expuesto
a las editoriales que quieran adquirirlo. El secretario debe poder
listar el conjunto de reportajes existentes.

### 2.2 Gestionar datos de las editoriales

La agencia de reporteros trabaja con un grupo de editoriales, las cuales
deben estar almacenadas en el sistema. El secretario de la empresa es el
que se encarga de crear nuevas editoriales, modificar sus datos, y
borrarlas. Por cada editorial nos interesa conocer: nombre, CIF,
dirección. El secretario debe poder listar el conjunto de editoriales.

### 2.3 Adquirir un reportaje

Cuando una editorial desea adquirir un reportaje, el secretario crea un
albarán de compra. En el albarán se especifica: el reportaje a adquirir,
la editorial que lo adquiere, la cantidad de dinero que va a pagar la
editorial por ese reportaje, la cantidad de dinero que va a percibir el
reportero que hizo el reportaje, y la fecha de creación del albarán. El
precio a pagar al reportero se debe calcular automáticamente como el
producto del precio a pagar por foto dependiendo del nivel del
reportero, por el total de fotos que contiene el reportaje. Existe una
restricción, el precio a cobrar a la editorial nunca debe ser menor que
el precio a pagar al reportero. Los reportajes vendidos no pasan a ser
exclusivos para la editorial, es decir, la agencia fotográfica puede
vender un mismo reportaje tantas veces como quiera. Cada una de estas
ventas da lugar a un albarán distinto. El secretario debe poder listar
todos los albaranes existentes.

**Fecha y hora:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Ejercicio 3

Además de los reportajes fotográficos que se hacen por iniciativa de los
reporteros, las editoriales pueden proponer fotos sobre un tema en
concreto. Es lo que se conoce con el nombre de exclusivas. Una vez
creada una exclusiva, se oferta a la agencia de reporteros por si hay
algún reportero interesado en el trabajo. La funcionalidad que hay que
soportar es la siguiente:

-   Dar de alta una exclusiva nueva.
-   Asignar exclusiva a reportero.
-   Finalizar la exclusiva.

### 3.1 Dar de alta una exclusiva nueva

Las editoriales se presentan en la agencia e indican la temática sobre
la que desean una exclusiva. El secretario de la agencia debe introducir
en el sistema qué editorial hace la petición de la exclusiva, una breve
descripción de la temática, el precio a pagar al reportero que desee
hacer la exclusiva, la fecha de creación de la exclusiva. El secretario
debe poder listar todas las exclusivas existentes.

### 3.2 Asignar exclusiva a reportero

Los reporteros pueden ver el listado de exclusivas ofertadas por las
editoriales. Si alguna de las exclusivas ofertadas está sin asignar,
entonces habla con el secretario y éste se la asigna, indicando la fecha
en la cual se hizo la asignación. Una vez la exclusiva esté asignada a
un reportero, ningún otro reportero puede tomarla. La fecha de
asignación no puede ser inferior a la fecha de creación de la exclusiva.
El secretario debe poder listar las exclusivas que están asignadas.

### 3.3 Finalizar la exclusiva

Una vez el reportero ha finalizado la exclusiva, vuelve a la agencia a
depositar todas las fotos. En este momento, el secretario de la agencia
desasigna el reportero a esa exclusiva e introduce la fecha de
finalización de la exclusiva. La fecha de finalización debe ser siempre
superior o igual a la fecha de asignación de la exclusiva. Las
exclusivas finalizadas tampoco se pueden asignar ya a ningún reportero.
El secretario debe poder listar las exclusivas finalizadas.

**Fecha y hora:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
