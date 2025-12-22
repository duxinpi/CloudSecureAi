import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface VulnerabilityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  provider: string;
  resourceType: string;
  region: string;
  status: 'Open' | 'Fixed' | 'In Progress';
  remediationSteps: RemediationStep[];
  cveId?: string;
  discoveredAt: string;
}

interface RemediationStep {
  title: string;
  description: string;
  commands?: string;
}

@Component({
  selector: 'app-vulnerabilities',
  templateUrl: './vulnerabilities.component.html',
  styleUrls: ['./vulnerabilities.component.css']
})
export class VulnerabilitiesComponent implements OnInit {
  // Security Dashboard Data
  securityScore = 78;
  passedChecks = 45;
  warningIssues = 8;
  criticalIssues = 3;
  
  // Scan Controls
  isScanning = false;
  scanProgress = 0;
  scannedResources = 0;
  lastScanTime: string | null = null;
  nextScanTime: string | null = null;
  
  // Refresh Controls
  isRefreshing = false;
  
  // Findings Data
  findings: VulnerabilityFinding[] = [];
  filteredFindings: VulnerabilityFinding[] = [];
  
  // Filters
  selectedSeverity = '';
  selectedProvider = '';
  searchTerm = '';
  
  // Modals
  showScheduleModal = false;
  showRemediationModal = false;
  selectedFinding: VulnerabilityFinding | null = null;
  
  // Schedule Settings
  scanFrequency = 'weekly';
  scanTime = '02:00';
  availableResources = ['EC2 Instances', 'S3 Buckets', 'RDS Databases', 'Lambda Functions', 'VPCs'];
  selectedResources: string[] = [];
  pauseScans = false;
  
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadVulnerabilityData();
    this.loadMockData();
  }

  loadVulnerabilityData() {
    this.http.get<any>(`${this.apiUrl}/vulnerabilities`).subscribe({
      next: (data) => {
        this.findings = data.findings || [];
        this.filteredFindings = [...this.findings];
        this.updateSecurityMetrics();
        this.lastScanTime = new Date().toISOString();
      },
      error: (error) => {
        console.error('Error loading vulnerability data:', error);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    // Mock vulnerability findings
    this.findings = [
      {
        id: 'vuln-001',
        title: 'Unencrypted S3 Bucket',
        description: 'S3 bucket "my-data-bucket" is publicly accessible and not encrypted',
        severity: 'Critical',
        provider: 'AWS',
        resourceType: 'S3 Bucket',
        region: 'us-east-1',
        status: 'Open',
        discoveredAt: '2024-01-15T10:30:00Z',
        remediationSteps: [
          {
            title: 'Enable S3 Bucket Encryption',
            description: 'Configure server-side encryption for the S3 bucket',
            commands: 'aws s3api put-bucket-encryption --bucket my-data-bucket --server-side-encryption-configuration \'{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}\''
          },
          {
            title: 'Restrict Public Access',
            description: 'Update bucket policy to restrict public access',
            commands: 'aws s3api put-public-access-block --bucket my-data-bucket --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"'
          }
        ]
      },
      {
        id: 'vuln-002',
        title: 'Weak Password Policy',
        description: 'IAM password policy allows weak passwords',
        severity: 'High',
        provider: 'AWS',
        resourceType: 'IAM Policy',
        region: 'us-east-1',
        status: 'Open',
        discoveredAt: '2024-01-14T15:20:00Z',
        remediationSteps: [
          {
            title: 'Update Password Policy',
            description: 'Configure stronger password requirements',
            commands: 'aws iam update-account-password-policy --minimum-password-length 12 --require-uppercase-characters --require-lowercase-characters --require-numbers --require-symbols'
          }
        ]
      },
      {
        id: 'vuln-003',
        title: 'Open Security Group',
        description: 'Security group allows unrestricted SSH access',
        severity: 'Medium',
        provider: 'AWS',
        resourceType: 'Security Group',
        region: 'us-west-2',
        status: 'Open',
        discoveredAt: '2024-01-13T09:15:00Z',
        remediationSteps: [
          {
            title: 'Restrict SSH Access',
            description: 'Update security group to allow SSH only from specific IPs',
            commands: 'aws ec2 authorize-security-group-ingress --group-id sg-12345678 --protocol tcp --port 22 --cidr 192.168.1.0/24'
          }
        ]
      },
      {
        id: 'vuln-004',
        title: 'Missing CloudTrail Logging',
        description: 'CloudTrail is not enabled for API monitoring',
        severity: 'Medium',
        provider: 'AWS',
        resourceType: 'CloudTrail',
        region: 'us-east-1',
        status: 'Open',
        discoveredAt: '2024-01-12T14:45:00Z',
        remediationSteps: [
          {
            title: 'Enable CloudTrail',
            description: 'Create a new CloudTrail for API monitoring',
            commands: 'aws cloudtrail create-trail --name my-trail --s3-bucket-name my-cloudtrail-bucket'
          }
        ]
      },
      {
        id: 'vuln-005',
        title: 'Outdated SSL Certificate',
        description: 'SSL certificate expires in 30 days',
        severity: 'Low',
        provider: 'AWS',
        resourceType: 'Certificate Manager',
        region: 'us-east-1',
        status: 'Open',
        discoveredAt: '2024-01-11T11:30:00Z',
        remediationSteps: [
          {
            title: 'Renew SSL Certificate',
            description: 'Request a new SSL certificate or enable auto-renewal',
            commands: 'aws acm request-certificate --domain-name example.com --validation-method DNS'
          }
        ]
      }
    ];
    
    this.filteredFindings = [...this.findings];
    this.updateSecurityMetrics();
    this.lastScanTime = '2024-01-15T10:30:00Z';
    this.nextScanTime = '2024-01-22T02:00:00Z';
  }

  updateSecurityMetrics() {
    this.criticalIssues = this.findings.filter(f => f.severity === 'Critical').length;
    this.warningIssues = this.findings.filter(f => f.severity === 'High').length;
    this.passedChecks = 45; // Mock passed checks
    
    // Calculate security score based on findings
    const totalIssues = this.criticalIssues + this.warningIssues + 
                       this.findings.filter(f => f.severity === 'Medium').length + 
                       this.findings.filter(f => f.severity === 'Low').length;
    
    if (totalIssues === 0) {
      this.securityScore = 100;
    } else {
      this.securityScore = Math.max(0, 100 - (this.criticalIssues * 20) - (this.warningIssues * 10) - 
                                   (this.findings.filter(f => f.severity === 'Medium').length * 5) - 
                                   (this.findings.filter(f => f.severity === 'Low').length * 2));
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'risk';
  }

  getScoreIcon(score: number): string {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  }

  getScoreStatus(score: number): string {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Warning';
    return 'Risk';
  }

  getSeverityIcon(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  runScanNow() {
    this.isScanning = true;
    this.scanProgress = 0;
    this.scannedResources = 0;
    
    // Simulate scan progress
    const interval = setInterval(() => {
      this.scanProgress += Math.random() * 10;
      this.scannedResources += Math.floor(Math.random() * 3) + 1;
      
      if (this.scanProgress >= 100) {
        this.scanProgress = 100;
        this.isScanning = false;
        this.lastScanTime = new Date().toISOString();
        clearInterval(interval);
        this.loadVulnerabilityData(); // Refresh data after scan
      }
    }, 500);
  }

  openScheduleModal() {
    this.showScheduleModal = true;
  }

  closeScheduleModal() {
    this.showScheduleModal = false;
  }

  saveSchedule() {
    // Save schedule settings
    console.log('Saving schedule:', {
      frequency: this.scanFrequency,
      time: this.scanTime,
      resources: this.selectedResources,
      pauseScans: this.pauseScans
    });
    
    this.closeScheduleModal();
    // Show success message
  }

  filterFindings() {
    this.filteredFindings = this.findings.filter(finding => {
      const matchesSeverity = !this.selectedSeverity || finding.severity.toLowerCase() === this.selectedSeverity;
      const matchesProvider = !this.selectedProvider || finding.provider === this.selectedProvider;
      const matchesSearch = !this.searchTerm || 
        finding.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        finding.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSeverity && matchesProvider && matchesSearch;
    });
  }

  fixNow(finding: VulnerabilityFinding) {
    console.log('Fixing vulnerability:', finding.id);
    // Implement fix logic
    finding.status = 'In Progress';
    // Show success message
  }

  viewRemediation(finding: VulnerabilityFinding) {
    this.selectedFinding = finding;
    this.showRemediationModal = true;
  }

  closeRemediationModal() {
    this.showRemediationModal = false;
    this.selectedFinding = null;
  }

  markAsFixed(finding: VulnerabilityFinding | null) {
    if (finding) {
      finding.status = 'Fixed';
      this.closeRemediationModal();
      this.updateSecurityMetrics();
      // Show success message
    }
  }

  refreshVulnerabilities() {
    console.log('Refresh button clicked');
    
    if (this.isRefreshing) {
      console.log('Already refreshing, skipping...');
      return; // Prevent multiple simultaneous refreshes
    }
    
    this.isRefreshing = true;
    console.log('Starting refresh...');
    
    const startTime = Date.now();
    const minDisplayTime = 500; // Minimum 500ms to show refreshing state
    
    // Update timestamp immediately for user feedback
    this.lastScanTime = new Date().toISOString();
    
    // Try to reload data from API first (with shorter timeout)
    const timeoutId = setTimeout(() => {
      if (this.isRefreshing) {
        console.warn('API request timeout - using mock data');
        this.loadMockData();
        this.filterFindings();
        
        // Ensure minimum display time
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        setTimeout(() => {
          this.isRefreshing = false;
        }, remaining);
      }
    }, 3000); // 3 second timeout
    
    this.http.get<any>(`${this.apiUrl}/vulnerabilities`).subscribe({
      next: (data) => {
        clearTimeout(timeoutId);
        console.log('API response received:', data);
        if (data && data.findings && Array.isArray(data.findings) && data.findings.length > 0) {
          this.findings = data.findings;
        } else {
          // If API returns empty or invalid data, reload mock data
          console.log('API returned empty data, reloading mock data...');
          this.loadMockData();
        }
        this.filteredFindings = [...this.findings];
        this.updateSecurityMetrics();
        
        // Reapply filters after refresh
        this.filterFindings();
        
        // Ensure minimum display time
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        setTimeout(() => {
          this.isRefreshing = false;
          console.log('Vulnerability data refreshed successfully');
        }, remaining);
      },
      error: (error) => {
        clearTimeout(timeoutId);
        console.error('Error refreshing vulnerability data:', error);
        // Fallback to mock data if API fails
        console.log('Falling back to mock data...');
        this.loadMockData();
        // Reapply filters after loading mock data
        this.filterFindings();
        
        // Ensure minimum display time
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        setTimeout(() => {
          this.isRefreshing = false;
        }, remaining);
      }
    });
  }
}