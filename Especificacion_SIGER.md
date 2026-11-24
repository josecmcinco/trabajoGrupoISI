

**Fecha y hora:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_


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
