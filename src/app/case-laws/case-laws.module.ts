import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { CaseLawsRoutingModule } from './case-laws-routing.module';
import { CaseListComponent } from './case-list/case-list.component';
import { CaseDetailComponent } from './case-detail/case-detail.component';


@NgModule({
  declarations: [
    CaseListComponent,
    CaseDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    CaseLawsRoutingModule
  ]
})
export class CaseLawsModule { }
 