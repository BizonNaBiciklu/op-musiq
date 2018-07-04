import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DomovComponent } from './content/domov/domov.component';

const routes: Routes = [
  {
    path: 'domov',
    component: DomovComponent
  },
  {
    path: '',
    redirectTo: 'domov',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
