import { Routes } from '@angular/router';
import { AceptadasComponent } from './features/aceptadas/aceptadas.component';
import { AlbaranesComponent } from './features/albaranes/albaranes.component';
import { CategoriasComponent } from './features/categorias/categorias.component';
import { EditorialesComponent } from './features/editoriales/editoriales.component';
import { ReportajesComponent } from './features/reportajes/reportajes.component';
import { ReporterosComponent } from './features/reporteros/reporteros.component';
import { SolicitudesComponent } from './features/solicitudes/solicitudes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'solicitudes', pathMatch: 'full' },
  { path: 'solicitudes', component: SolicitudesComponent },
  { path: 'aceptadas', component: AceptadasComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'reporteros', component: ReporterosComponent },
  { path: 'reportajes', component: ReportajesComponent },
  { path: 'editoriales', component: EditorialesComponent },
  { path: 'albaranes', component: AlbaranesComponent },
  { path: '**', redirectTo: 'solicitudes' }
];
