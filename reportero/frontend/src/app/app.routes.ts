import { Routes } from '@angular/router';
import { AceptadasComponent } from './features/aceptadas/aceptadas.component';
import { CategoriasComponent } from './features/categorias/categorias.component';
import { ReporterosComponent } from './features/reporteros/reporteros.component';
import { SolicitudesComponent } from './features/solicitudes/solicitudes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'solicitudes', pathMatch: 'full' },
  { path: 'solicitudes', component: SolicitudesComponent },
  { path: 'aceptadas', component: AceptadasComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'reporteros', component: ReporterosComponent },
  { path: '**', redirectTo: 'solicitudes' }
];
