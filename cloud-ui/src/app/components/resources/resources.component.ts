import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
  status: string;
  health: string;
  environment: string;
  project: string;
  cost?: number;
  tags?: string[];
  metrics?: {
    cpu: number;
    memory: number;
    disk?: number;
  };
  lastSync?: Date;
  createdAt: Date;
}

interface IAMStats {
  aws: { users: number; roles: number; policies: number; };
  azure: { users: number; groups: number; applications: number; };
  gcp: { users: number; serviceAccounts: number; customRoles: number; };
}

interface HealthMetrics {
  cpu: number;
  memory: number;
  disk: number;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  timestamp: Date;
  resourceId?: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  resourceId?: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  resourceId?: string;
}

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {
  // Filter properties
  selectedProvider = '';
  selectedEnvironment = '';
  selectedRegion = '';
  selectedProject = '';
  selectedLogLevel = '';

  // Data properties
  allResources: CloudResource[] = [];
  filteredResources: CloudResource[] = [];
  
  // Stats
  totalResources = 0;
  runningResources = 0;
  stoppedResources = 0;
  totalCost = 0;

  // Panel visibility
  showSecurityPanel = false;
  showMonitoringPanel = false;
  showTimelinePanel = false;
  showLogViewer = false;
  showResourceDetailsModal = false;
  selectedResource: CloudResource | null = null;
  showDiscoveryModal = false;
  
  // Discovery properties
  discoveryProviders: string[] = [];
  discoveryRegions: string[] = [];
  discoveryStatus: 'idle' | 'discovering' | 'completed' | 'error' = 'idle';
  discoveryProgress = 0;
  discoveredResources: CloudResource[] = [];
  discoveryMessage = '';
  
  availableProviders = ['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Linode'];
  availableRegions = [
    'us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1',
    'East US', 'West US 2', 'West Europe',
    'us-central1', 'europe-west1', 'asia-east1',
    'NYC1', 'SFO1', 'AMS3',
    'us-east', 'us-west', 'eu-west'
  ];

  // Security & IAM
  iamStats: IAMStats = {
    aws: { users: 0, roles: 0, policies: 0 },
    azure: { users: 0, groups: 0, applications: 0 },
    gcp: { users: 0, serviceAccounts: 0, customRoles: 0 }
  };

  // Monitoring
  healthMetrics: HealthMetrics = { cpu: 0, memory: 0, disk: 0 };
  activeAlerts: Alert[] = [];

  // Timeline
  timelineEvents: TimelineEvent[] = [];

  // Logs
  allLogs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadResources();
    this.loadSecurityData();
    this.loadMonitoringData();
    this.loadTimelineEvents();
    this.loadLogs();
  }

  loadResources() {
    this.http.get<CloudResource[]>(`${this.apiUrl}/cloud-resources`).subscribe({
      next: (resources) => {
        this.allResources = resources;
        this.applyFilters();
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading resources:', error);
        this.loadMockResources();
      }
    });
  }

  loadMockResources() {
    // Mock data for development
    this.allResources = [
      {
        id: 'i-1234567890abcdef0',
        name: 'Web Server 1',
        type: 'EC2 Instance',
        provider: 'AWS',
        region: 'us-east-1',
        status: 'Running',
        health: 'Healthy',
        environment: 'production',
        project: 'web-app',
        cost: 45.50,
        tags: ['web', 'production', 'frontend'],
        metrics: { cpu: 65, memory: 78 },
        createdAt: new Date('2024-01-15'),
        lastSync: new Date()
      },
      {
        id: 'vm-prod-db-001',
        name: 'Production Database',
        type: 'Virtual Machine',
        provider: 'Azure',
        region: 'East US',
        status: 'Running',
        health: 'Healthy',
        environment: 'production',
        project: 'data-analytics',
        cost: 89.20,
        tags: ['database', 'production', 'mysql'],
        metrics: { cpu: 45, memory: 82 },
        createdAt: new Date('2024-01-10'),
        lastSync: new Date()
      },
      {
        id: 'gcp-vm-analytics',
        name: 'Analytics Server',
        type: 'Compute Engine',
        provider: 'GCP',
        region: 'us-central1',
        status: 'Running',
        health: 'Warning',
        environment: 'staging',
        project: 'ml-pipeline',
        cost: 52.40,
        tags: ['analytics', 'staging', 'python'],
        metrics: { cpu: 85, memory: 92 },
        createdAt: new Date('2024-01-20'),
        lastSync: new Date()
      },
      {
        id: 'do-staging-001',
        name: 'Staging Server',
        type: 'Droplet',
        provider: 'DigitalOcean',
        region: 'NYC1',
        status: 'Stopped',
        health: 'Unknown',
        environment: 'staging',
        project: 'web-app',
        cost: 24.00,
        tags: ['staging', 'web', 'nginx'],
        metrics: { cpu: 0, memory: 0 },
        createdAt: new Date('2024-01-25'),
        lastSync: new Date()
      },
      {
        id: 'linode-dev-001',
        name: 'Development Server',
        type: 'Linode',
        provider: 'Linode',
        region: 'us-east',
        status: 'Running',
        health: 'Healthy',
        environment: 'development',
        project: 'infrastructure',
        cost: 12.00,
        tags: ['development', 'testing', 'docker'],
        metrics: { cpu: 25, memory: 45 },
        createdAt: new Date('2024-01-30'),
        lastSync: new Date()
      }
    ];
    this.applyFilters();
    this.calculateStats();
  }

  loadSecurityData() {
    // Mock IAM stats
    this.iamStats = {
      aws: { users: 15, roles: 8, policies: 25 },
      azure: { users: 12, groups: 6, applications: 18 },
      gcp: { users: 10, serviceAccounts: 5, customRoles: 12 }
    };
  }

  loadMonitoringData() {
    // Mock health metrics
    this.healthMetrics = { cpu: 68, memory: 74, disk: 45 };
    
    // Mock alerts
    this.activeAlerts = [
      {
        id: 'alert-1',
        title: 'High CPU Usage',
        description: 'CPU usage is above 80% on Analytics Server',
        severity: 'high',
        type: 'cpu',
        timestamp: new Date(),
        resourceId: 'gcp-vm-analytics'
      },
      {
        id: 'alert-2',
        title: 'Memory Warning',
        description: 'Memory usage is above 90% on Production Database',
        severity: 'medium',
        type: 'memory',
        timestamp: new Date(Date.now() - 300000),
        resourceId: 'vm-prod-db-001'
      }
    ];
  }

  loadTimelineEvents() {
    // Mock timeline events
    this.timelineEvents = [
      {
        id: 'event-1',
        title: 'Resource Started',
        description: 'Web Server 1 started successfully',
        type: 'success',
        timestamp: new Date(Date.now() - 3600000),
        resourceId: 'i-1234567890abcdef0'
      },
      {
        id: 'event-2',
        title: 'High CPU Alert',
        description: 'CPU usage exceeded 80% threshold',
        type: 'warning',
        timestamp: new Date(Date.now() - 1800000),
        resourceId: 'gcp-vm-analytics'
      },
      {
        id: 'event-3',
        title: 'Resource Stopped',
        description: 'Staging Server stopped for maintenance',
        type: 'info',
        timestamp: new Date(Date.now() - 900000),
        resourceId: 'do-staging-001'
      }
    ];
  }

  loadLogs() {
    // Mock log entries
    this.allLogs = [
      {
        id: 'log-1',
        timestamp: new Date(),
        level: 'info',
        message: 'Resource sync completed successfully',
        resourceId: 'i-1234567890abcdef0'
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 60000),
        level: 'warning',
        message: 'High memory usage detected on Production Database',
        resourceId: 'vm-prod-db-001'
      },
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 120000),
        level: 'error',
        message: 'Failed to connect to Analytics Server',
        resourceId: 'gcp-vm-analytics'
      },
      {
        id: 'log-4',
        timestamp: new Date(Date.now() - 180000),
        level: 'debug',
        message: 'Resource discovery scan started',
        resourceId: 'do-staging-001'
      }
    ];
    this.applyLogFilters();
  }

  applyFilters() {
    this.filteredResources = this.allResources.filter(resource => {
      const providerMatch = !this.selectedProvider || resource.provider === this.selectedProvider;
      const environmentMatch = !this.selectedEnvironment || resource.environment === this.selectedEnvironment;
      const regionMatch = !this.selectedRegion || resource.region === this.selectedRegion;
      const projectMatch = !this.selectedProject || resource.project === this.selectedProject;
      
      return providerMatch && environmentMatch && regionMatch && projectMatch;
    });
  }

  applyLogFilters() {
    this.filteredLogs = this.allLogs.filter(log => {
      return !this.selectedLogLevel || log.level === this.selectedLogLevel;
    });
  }

  calculateStats() {
    this.totalResources = this.allResources.length;
    this.runningResources = this.allResources.filter(r => r.status === 'Running').length;
    this.stoppedResources = this.allResources.filter(r => r.status === 'Stopped').length;
    this.totalCost = this.allResources.reduce((sum, r) => sum + (r.cost || 0), 0);
  }

  getResourceStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  refreshResources() {
    this.loadResources();
  }

  openDiscoveryModal() {
    this.showDiscoveryModal = true;
    this.discoveryProviders = [];
    this.discoveryRegions = [];
    this.discoveryStatus = 'idle';
    this.discoveryProgress = 0;
    this.discoveredResources = [];
    this.discoveryMessage = '';
  }

  closeDiscoveryModal() {
    this.showDiscoveryModal = false;
    this.discoveryStatus = 'idle';
    this.discoveryProgress = 0;
    this.discoveredResources = [];
    this.discoveryMessage = '';
  }

  startDiscovery() {
    if (this.discoveryProviders.length === 0) {
      this.discoveryMessage = 'Please select at least one provider';
      return;
    }

    this.discoveryStatus = 'discovering';
    this.discoveryProgress = 0;
    this.discoveryMessage = 'Starting resource discovery...';
    this.discoveredResources = [];

    // Simulate discovery progress
    const progressInterval = setInterval(() => {
      if (this.discoveryProgress < 90) {
        this.discoveryProgress += 10;
        if (this.discoveryProgress < 30) {
          this.discoveryMessage = 'Connecting to cloud providers...';
        } else if (this.discoveryProgress < 60) {
          this.discoveryMessage = 'Scanning regions for resources...';
        } else if (this.discoveryProgress < 90) {
          this.discoveryMessage = 'Cataloging discovered resources...';
        }
      }
    }, 600);

    // Call API to discover resources
    const discoveryRequest = {
      providers: this.discoveryProviders,
      regions: this.discoveryRegions.length > 0 ? this.discoveryRegions : undefined
    };

    this.http.post<CloudResource[]>(`${this.apiUrl}/cloud-resources/discover`, discoveryRequest).subscribe({
      next: (resources) => {
        clearInterval(progressInterval);
        this.discoveryProgress = 100;
        this.discoveredResources = resources;
        this.discoveryStatus = 'completed';
        this.discoveryMessage = `Discovered ${resources.length} resources`;
        
        // Add discovered resources to the main list
        resources.forEach(resource => {
          if (!this.allResources.find(r => r.id === resource.id)) {
            this.allResources.push(resource);
          }
        });
        this.applyFilters();
        this.calculateStats();
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.discoveryStatus = 'error';
        this.discoveryMessage = error.error?.message || 'Discovery failed. Please try again.';
        console.error('Error discovering resources:', error);
        // Fallback to mock discovery
        this.simulateDiscovery();
      }
    });
  }

  simulateDiscovery() {
    // Mock discovered resources
    const mockDiscovered: CloudResource[] = [];
    this.discoveryProviders.forEach((provider, index) => {
      mockDiscovered.push({
        id: `discovered-${provider.toLowerCase()}-${Date.now()}-${index}`,
        name: `Discovered ${provider} Resource ${index + 1}`,
        type: provider === 'AWS' ? 'EC2 Instance' : provider === 'Azure' ? 'Virtual Machine' : 'Compute Engine',
        provider: provider,
        region: this.discoveryRegions.length > 0 ? this.discoveryRegions[0] : 'us-east-1',
        status: 'Running',
        health: 'Healthy',
        environment: 'production',
        project: 'discovered',
        cost: Math.random() * 100 + 10,
        tags: ['discovered', provider.toLowerCase()],
        metrics: { cpu: Math.floor(Math.random() * 50 + 20), memory: Math.floor(Math.random() * 50 + 30) },
        createdAt: new Date(),
        lastSync: new Date()
      });
    });

    setTimeout(() => {
      this.discoveryProgress = 100;
      this.discoveredResources = mockDiscovered;
      this.discoveryStatus = 'completed';
      this.discoveryMessage = `Discovered ${mockDiscovered.length} resources`;

      // Add to main list
      mockDiscovered.forEach(resource => {
        if (!this.allResources.find(r => r.id === resource.id)) {
          this.allResources.push(resource);
        }
      });
      this.applyFilters();
      this.calculateStats();
    }, 1000);
  }

  toggleProvider(provider: string) {
    const index = this.discoveryProviders.indexOf(provider);
    if (index > -1) {
      this.discoveryProviders.splice(index, 1);
    } else {
      this.discoveryProviders.push(provider);
    }
  }

  toggleRegion(region: string) {
    const index = this.discoveryRegions.indexOf(region);
    if (index > -1) {
      this.discoveryRegions.splice(index, 1);
    } else {
      this.discoveryRegions.push(region);
    }
  }

  isProviderSelected(provider: string): boolean {
    return this.discoveryProviders.includes(provider);
  }

  isRegionSelected(region: string): boolean {
    return this.discoveryRegions.includes(region);
  }

  clearFilters() {
    this.selectedProvider = '';
    this.selectedEnvironment = '';
    this.selectedRegion = '';
    this.selectedProject = '';
    this.applyFilters();
  }

  viewResourceDetails(resource: CloudResource) {
    this.selectedResource = resource;
    this.showResourceDetailsModal = true;
  }

  closeResourceDetailsModal() {
    this.showResourceDetailsModal = false;
    this.selectedResource = null;
  }

  manageResource(resource: CloudResource) {
    console.log('Managing resource:', resource);
  }

  viewLogs(resource: CloudResource) {
    this.showLogViewer = true;
    this.filteredLogs = this.allLogs.filter(log => log.resourceId === resource.id);
  }

  toggleSecurityPanel() {
    this.showSecurityPanel = !this.showSecurityPanel;
  }

  toggleMonitoringPanel() {
    this.showMonitoringPanel = !this.showMonitoringPanel;
  }

  toggleTimelinePanel() {
    this.showTimelinePanel = !this.showTimelinePanel;
  }

  toggleLogViewer() {
    this.showLogViewer = !this.showLogViewer;
  }

  closeLogViewerOnBackdrop() {
    if (this.showLogViewer) {
      this.showLogViewer = false;
    }
  }

  acknowledgeAlert(alert: Alert) {
    this.activeAlerts = this.activeAlerts.filter(a => a.id !== alert.id);
  }

  refreshLogs() {
    this.loadLogs();
  }

  getMetricClass(value: number): string {
    if (value >= 80) return 'metric-high';
    if (value >= 60) return 'metric-medium';
    return 'metric-low';
  }

  getResourceAlerts(resourceId: string): Alert[] {
    return this.activeAlerts.filter(alert => alert.resourceId === resourceId);
  }

  getResourceEvents(resourceId: string): TimelineEvent[] {
    return this.timelineEvents.filter(event => event.resourceId === resourceId);
  }
}
