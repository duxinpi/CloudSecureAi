import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'cloud-accounts', component: CloudAccountsComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'compliance', component: ComplianceComponent },
  { path: 'vulnerabilities', component: VulnerabilitiesComponent },
  { path: 'ai-chat', component: AiChatComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'device-management', component: DeviceManagementComponent },
  { path: 'settings', component: AdminComponent },
  { path: 'profile', component: ProfileComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
