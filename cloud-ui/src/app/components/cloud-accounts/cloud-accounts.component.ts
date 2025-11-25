import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface CloudAccount {
  id: number;
  accountName: string;
  provider: string;
  accountId: string;
  region: string;
  status: string;
  healthStatus: string;
  description?: string;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
  notificationCount: number;
  lastError?: string;
}

interface InventoryData {
  totalResources: number;
  totalMonthlyCost: number;
  runningResources: number;
  stoppedResources: number;
  terminatedResources: number;
  resourcesByProvider: { [key: string]: number };
  costsByProvider: { [key: string]: number };
  topExpensiveResources: any[];
}

@Component({
  selector: 'app-cloud-accounts',
  templateUrl: './cloud-accounts.component.html',
  styleUrls: ['./cloud-accounts.component.css']
})
export class CloudAccountsComponent implements OnInit {
  cloudAccounts: CloudAccount[] = [];
  inventoryData: InventoryData | null = null;
  showModal = false;
  isEditing = false;
  editingAccount: CloudAccount | null = null;
  accountForm: FormGroup;
  
  // Sync popup properties
  showSyncPopup = false;
  syncingAccount: CloudAccount | null = null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error' = 'idle';
  syncProgress = 0;
  syncMessage = '';
  
  // Stats
  connectedAccounts = 0;
  warningAccounts = 0;
  criticalAccounts = 0;
  totalAccounts = 0;

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.accountForm = this.fb.group({
      accountName: ['', Validators.required],
      provider: ['', Validators.required],
      accountId: ['', Validators.required],
      region: ['', Validators.required],
      description: [''],
      accessKey: [''],
      secretKey: ['']
    });
  }

  ngOnInit() {
    this.loadCloudAccounts();
    this.loadInventoryData();
  }

  loadCloudAccounts() {
    this.http.get<CloudAccount[]>(`${this.apiUrl}/cloud-accounts`).subscribe({
      next: (accounts) => {
        this.cloudAccounts = accounts;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading cloud accounts:', error);
        // Fallback to mock data if API fails
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    // Mock data for development
    this.cloudAccounts = [
      {
        id: 1,
        accountName: 'AWS Account',
        provider: 'AWS',
        accountId: '123456789012',
        region: 'us-west-2',
        status: 'CONNECTED',
        healthStatus: 'HEALTHY',
        description: 'Primary production environment',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        notificationCount: 2,
        lastError: undefined
      },
      {
        id: 2,
        accountName: 'Azure Account',
        provider: 'Azure',
        accountId: 'abc123-def456',
        region: 'West US 2',
        status: 'CONNECTED',
        healthStatus: 'WARNING',
        description: 'Azure production environment',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notificationCount: 5,
        lastError: 'High CPU usage detected'
      },
      {
        id: 3,
        accountName: 'GCP Account',
        provider: 'GCP',
        accountId: 'my-gcp-project',
        region: 'us-central1',
        status: 'PENDING',
        healthStatus: 'UNKNOWN',
        description: 'Google Cloud for analytics',
        lastSync: undefined,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notificationCount: 1,
        lastError: 'Authentication credentials expired'
      }
    ];
    this.calculateStats();
  }

  calculateStats() {
    this.totalAccounts = this.cloudAccounts.length;
    this.connectedAccounts = this.cloudAccounts.filter(acc => acc.status === 'CONNECTED').length;
    this.warningAccounts = this.cloudAccounts.filter(acc => acc.healthStatus === 'WARNING').length;
    this.criticalAccounts = this.cloudAccounts.filter(acc => acc.healthStatus === 'CRITICAL').length;
  }

  getCardClass(account: CloudAccount): string {
    if (account.healthStatus === 'CRITICAL') return 'card-critical';
    if (account.healthStatus === 'WARNING') return 'card-warning';
    if (account.status === 'DISCONNECTED') return 'card-disconnected';
    return 'card-normal';
  }

  formatLastSync(lastSync: string): string {
    const now = new Date();
    const syncTime = new Date(lastSync);
    const diffMs = now.getTime() - syncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  openAddAccountModal() {
    this.isEditing = false;
    this.editingAccount = null;
    this.accountForm.reset();
    this.showModal = true;
  }

  editAccount(account: CloudAccount) {
    this.isEditing = true;
    this.editingAccount = account;
    this.accountForm.patchValue({
      accountName: account.accountName,
      provider: account.provider,
      accountId: account.accountId,
      region: account.region,
      description: account.description || '',
      accessKey: '',
      secretKey: ''
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.editingAccount = null;
    this.accountForm.reset();
  }

  saveAccount() {
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      
      if (this.isEditing && this.editingAccount) {
        // Update existing account
        this.http.put(`${this.apiUrl}/cloud-accounts/${this.editingAccount.id}`, formData).subscribe({
          next: () => {
            this.loadCloudAccounts();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating account:', error);
            alert('Failed to update account. Please try again.');
          }
        });
      } else {
        // Create new account
        this.http.post(`${this.apiUrl}/cloud-accounts`, formData).subscribe({
          next: () => {
            this.loadCloudAccounts();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating account:', error);
            alert('Failed to create account. Please try again.');
          }
        });
      }
    }
  }

  syncAccount(accountId: number) {
    const account = this.cloudAccounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    this.syncingAccount = account;
    this.showSyncPopup = true;
    this.syncStatus = 'syncing';
    this.syncProgress = 0;
    this.syncMessage = 'Initializing sync...';
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (this.syncProgress < 90) {
        this.syncProgress += 10;
        if (this.syncProgress < 30) {
          this.syncMessage = 'Connecting to cloud provider...';
        } else if (this.syncProgress < 60) {
          this.syncMessage = 'Discovering resources...';
        } else if (this.syncProgress < 90) {
          this.syncMessage = 'Syncing resource data...';
        }
      }
    }, 500);
    
    this.http.post(`${this.apiUrl}/cloud-accounts/${accountId}/sync`, {}).subscribe({
      next: () => {
        clearInterval(progressInterval);
        this.syncProgress = 100;
        this.syncStatus = 'success';
        this.syncMessage = 'Sync completed successfully!';
        this.loadCloudAccounts();
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          this.closeSyncPopup();
        }, 2000);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.syncStatus = 'error';
        this.syncMessage = error.error?.message || 'Failed to sync account. Please try again.';
        console.error('Error syncing account:', error);
      }
    });
  }

  closeSyncPopup() {
    this.showSyncPopup = false;
    this.syncingAccount = null;
    this.syncStatus = 'idle';
    this.syncProgress = 0;
    this.syncMessage = '';
  }

  deleteAccount(accountId: number) {
    if (confirm('Are you sure you want to delete this account?')) {
      this.http.delete(`${this.apiUrl}/cloud-accounts/${accountId}`).subscribe({
        next: () => {
          this.loadCloudAccounts();
          alert('Account deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          alert('Failed to delete account. Please try again.');
        }
      });
    }
  }

  refreshAccounts() {
    this.loadCloudAccounts();
  }

  loadInventoryData() {
    this.http.get<InventoryData>(`${this.apiUrl}/cloud-resources/dashboard`).subscribe({
      next: (data) => {
        this.inventoryData = data;
      },
      error: (error) => {
        console.error('Error loading inventory data:', error);
        this.loadMockInventoryData();
      }
    });
  }

  loadMockInventoryData() {
    // Mock inventory data for development
    this.inventoryData = {
      totalResources: 8,
      totalMonthlyCost: 315.4,
      runningResources: 7,
      stoppedResources: 1,
      terminatedResources: 0,
      resourcesByProvider: {
        'AWS': 4,
        'Azure': 2,
        'GCP': 2
      },
      costsByProvider: {
        'AWS': 147.0,
        'Azure': 76.3,
        'GCP': 68.1
      },
      topExpensiveResources: [
        {
          resourceName: 'Production Database',
          resourceType: 'RDS',
          provider: 'AWS',
          region: 'us-east-1',
          status: 'Running',
          monthlyCost: 89.20
        },
        {
          resourceName: 'Development Server',
          resourceType: 'Virtual Machine',
          provider: 'Azure',
          region: 'East US',
          status: 'Running',
          monthlyCost: 67.80
        }
      ]
    };
  }

  getProviderBreakdown() {
    if (!this.inventoryData) return [];
    return Object.entries(this.inventoryData.resourcesByProvider).map(([name, count]) => ({
      name,
      count,
      cost: this.inventoryData?.costsByProvider[name] || 0
    }));
  }

  getProviderPercentage(count: number): number {
    if (!this.inventoryData) return 0;
    const total = this.inventoryData.totalResources;
    return total > 0 ? (count / total) * 100 : 0;
  }

  getSyncStatusIcon(): string {
    switch (this.syncStatus) {
      case 'syncing':
        return 'icon-sync';
      case 'success':
        return 'icon-check';
      case 'error':
        return 'icon-error';
      default:
        return 'icon-sync';
    }
  }

  getDefaultSyncMessage(): string {
    switch (this.syncStatus) {
      case 'syncing':
        return 'Synchronizing account data...';
      case 'success':
        return 'Sync completed successfully!';
      case 'error':
        return 'Sync failed. Please try again.';
      default:
        return 'Preparing to sync...';
    }
  }
}
