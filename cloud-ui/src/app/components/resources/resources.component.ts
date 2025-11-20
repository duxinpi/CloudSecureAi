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
  showDiscoveryModal = false;
  
  // Discovery properties
  discoveryProviders: string[] = [];
  discoveryRegions: string[] = [];
  discoveryResourceTypes: string[] = [];
  discoveryInProgress = false;
  discoveryProgress = 0;
  discoveryStatus = '';
  discoveredResources: CloudResource[] = [];
  
  availableProviders = ['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Linode'];
  availableRegions = [
    'us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1',
    'East US', 'West US', 'West Europe', 'Southeast Asia',
    'us-central1', 'europe-west1', 'asia-east1',
    'NYC1', 'SFO1', 'AMS3', 'SGP1',
    'us-east', 'us-west', 'eu-west', 'ap-south'
  ];
  availableResourceTypes = [
    'EC2 Instance', 'Virtual Machine', 'Compute Engine', 'Droplet', 'Linode',
    'RDS', 'Database', 'Cloud SQL',
    'S3 Bucket', 'Blob Storage', 'Cloud Storage',
    'Load Balancer', 'Application Gateway',
    'Lambda', 'Function', 'Cloud Function'
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
    this.discoveryInProgress = false;
    this.discoveryProgress = 0;
    this.discoveryStatus = '';
    this.discoveredResources = [];
    // Reset selections
    this.discoveryProviders = [];
    this.discoveryRegions = [];
    this.discoveryResourceTypes = [];
  }

  closeDiscoveryModal() {
    this.showDiscoveryModal = false;
    if (this.discoveryInProgress) {
      // Stop discovery if in progress
      this.discoveryInProgress = false;
    }
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

  toggleResourceType(type: string) {
    const index = this.discoveryResourceTypes.indexOf(type);
    if (index > -1) {
      this.discoveryResourceTypes.splice(index, 1);
    } else {
      this.discoveryResourceTypes.push(type);
    }
  }

  selectAllProviders() {
    this.discoveryProviders = [...this.availableProviders];
  }

  clearAllProviders() {
    this.discoveryProviders = [];
  }

  selectAllRegions() {
    this.discoveryRegions = [...this.availableRegions];
  }

  clearAllRegions() {
    this.discoveryRegions = [];
  }

  selectAllResourceTypes() {
    this.discoveryResourceTypes = [...this.availableResourceTypes];
  }

  clearAllResourceTypes() {
    this.discoveryResourceTypes = [];
  }

  startDiscovery() {
    if (this.discoveryProviders.length === 0) {
      alert('Please select at least one cloud provider to discover resources from.');
      return;
    }

    this.discoveryInProgress = true;
    this.discoveryProgress = 0;
    this.discoveryStatus = 'Initializing discovery...';
    this.discoveredResources = [];

    // Simulate discovery process
    this.simulateDiscovery();
  }

  simulateDiscovery() {
    const steps = [
      { progress: 10, status: 'Connecting to cloud providers...' },
      { progress: 25, status: 'Scanning AWS resources...' },
      { progress: 40, status: 'Scanning Azure resources...' },
      { progress: 55, status: 'Scanning GCP resources...' },
      { progress: 70, status: 'Analyzing discovered resources...' },
      { progress: 85, status: 'Collecting resource metadata...' },
      { progress: 95, status: 'Finalizing discovery...' },
      { progress: 100, status: 'Discovery completed!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        this.discoveryProgress = step.progress;
        this.discoveryStatus = step.status;
        currentStep++;
      } else {
        clearInterval(interval);
        this.completeDiscovery();
      }
    }, 1000);
  }

  completeDiscovery() {
    this.discoveryInProgress = false;
    this.discoveryStatus = 'Discovery completed successfully!';
    
    // Generate mock discovered resources based on selections
    this.discoveredResources = this.generateDiscoveredResources();
    
    // Add discovered resources to the main resources list
    this.allResources = [...this.allResources, ...this.discoveredResources];
    this.applyFilters();
    this.calculateStats();
  }

  generateDiscoveredResources(): CloudResource[] {
    const resources: CloudResource[] = [];
    const environments = ['production', 'staging', 'development', 'testing'];
    const projects = ['web-app', 'data-analytics', 'ml-pipeline', 'infrastructure'];
    const statuses = ['Running', 'Stopped', 'Running', 'Running'];
    const healthStatuses = ['Healthy', 'Warning', 'Healthy', 'Healthy'];

    // Generate resources based on selected providers
    this.discoveryProviders.forEach((provider, providerIndex) => {
      const resourceCount = Math.floor(Math.random() * 3) + 2; // 2-4 resources per provider
      
      for (let i = 0; i < resourceCount; i++) {
        const resourceId = `${provider.toLowerCase()}-discovered-${Date.now()}-${i}`;
        const resourceType = this.discoveryResourceTypes.length > 0 
          ? this.discoveryResourceTypes[Math.floor(Math.random() * this.discoveryResourceTypes.length)]
          : this.getDefaultResourceType(provider);
        
        const region = this.discoveryRegions.length > 0
          ? this.discoveryRegions[Math.floor(Math.random() * this.discoveryRegions.length)]
          : this.getDefaultRegion(provider);

        resources.push({
          id: resourceId,
          name: `${provider} ${resourceType} ${i + 1}`,
          type: resourceType,
          provider: provider,
          region: region,
          status: statuses[i % statuses.length],
          health: healthStatuses[i % healthStatuses.length],
          environment: environments[Math.floor(Math.random() * environments.length)],
          project: projects[Math.floor(Math.random() * projects.length)],
          cost: Math.random() * 100 + 10,
          tags: ['discovered', 'auto-sync'],
          metrics: {
            cpu: Math.floor(Math.random() * 80) + 10,
            memory: Math.floor(Math.random() * 80) + 10
          },
          createdAt: new Date(),
          lastSync: new Date()
        });
      }
    });

    return resources;
  }

  getDefaultResourceType(provider: string): string {
    const defaults: { [key: string]: string } = {
      'AWS': 'EC2 Instance',
      'Azure': 'Virtual Machine',
      'GCP': 'Compute Engine',
      'DigitalOcean': 'Droplet',
      'Linode': 'Linode'
    };
    return defaults[provider] || 'Compute Instance';
  }

  getDefaultRegion(provider: string): string {
    const defaults: { [key: string]: string } = {
      'AWS': 'us-east-1',
      'Azure': 'East US',
      'GCP': 'us-central1',
      'DigitalOcean': 'NYC1',
      'Linode': 'us-east'
    };
    return defaults[provider] || 'us-east-1';
  }

  addDiscoveredResources() {
    // Resources are already added in completeDiscovery()
    this.closeDiscoveryModal();
  }

  cancelDiscovery() {
    if (confirm('Are you sure you want to cancel the discovery process?')) {
      this.discoveryInProgress = false;
      this.discoveryProgress = 0;
      this.discoveryStatus = 'Discovery cancelled.';
    }
  }

  clearFilters() {
    this.selectedProvider = '';
    this.selectedEnvironment = '';
    this.selectedRegion = '';
    this.selectedProject = '';
    this.applyFilters();
  }

  viewResourceDetails(resource: CloudResource) {
    console.log('Viewing resource details:', resource);
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
}
