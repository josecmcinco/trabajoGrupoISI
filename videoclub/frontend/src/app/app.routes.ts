import { Routes } from '@angular/router';
import { AlquileresComponent } from './components/alquileres/alquileres.component';
import { EstadisticasAdminComponent } from './components/estadisticas/estadisticas.component';
import { PeliculasComponent } from './components/peliculas/peliculas.component';
import { SociosComponent } from './components/socios/socios.component';
import { VideoclubsComponent } from './components/videoclubs/videoclubs.component';

export const routes: Routes = [
  { path: 'alquileres', component: AlquileresComponent },
  { path: 'videoclubs', component: VideoclubsComponent },
  { path: 'peliculas', component: PeliculasComponent },
  { path: 'socios', component: SociosComponent },
  { path: 'estadisticas', component: EstadisticasAdminComponent },
  { path: '', pathMatch: 'full', redirectTo: 'alquileres' },
  { path: '**', redirectTo: 'alquileres' }
];
