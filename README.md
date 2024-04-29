# Notas para ayudante corrector
La tarea cumple con todo lo solicitado

Supuestos y notas: 
1. Dado que la estacion actual depende de 'Arrival', esta solo se actualiza al llegar por primera vez. Se muestra 'loading' por defecto.
2. Los pasageros iniciales son 0 y el calculo de cuantos hay se hace desde ahi, por ende pueden haber pasajeros negativos.
3. Los trenes van dejando un camino con una linea negra y al llegar a su destino final esta se borra junto con su icono. (la de la linea azul cuesta verla pero si esta)
4. Los colores que reflejan los 'status' de los trenes son: blanco para 'unknown' (que aun no llega un status del socket) y 'traveling', amarillo para 'arrived', verde para 'departing' y rojo para 'stopped'.

Pendiente:
Arreglar CHAT que tienen malo lo que hay que mandar
Ver si estacion actual en tabla esta bien cuando arreglen lo que manda Arrival
Ver si arreglaron lo de que la diferencia entre stopped y departing es 0.00001 segundos