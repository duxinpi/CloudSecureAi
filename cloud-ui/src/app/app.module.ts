import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { CloudAccountsComponent } from './components/cloud-accounts/cloud-accounts.component';
import { ResourcesComponent } from './components/resources/resources.component';
import { ComplianceComponent } from './components/compliance/compliance.component';
import { VulnerabilitiesComponent } from './components/vulnerabilities/vulnerabilities.component';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DeviceManagementComponent } from './components/device-management/device-management.component';
import { SecurityComponent } from './components/security/security.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    AdminComponent,
    CloudAccountsComponent,
    ResourcesComponent,
    ComplianceComponent,
    VulnerabilitiesComponent,
    AiChatComponent,
    ReportsComponent,
    ProfileComponent,
    DeviceManagementComponent,
    SecurityComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
