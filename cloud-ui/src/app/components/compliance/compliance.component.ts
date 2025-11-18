import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ComplianceCheck {
  id: string;
  title: string;
  framework: string;
  provider: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'PENDING';
  lastScan: Date;
  nextScan: Date;
  resourceCount: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: ComplianceCheckDetails;
}

interface ComplianceCheckDetails {
  requirement: string;
  controlId: string;
  resources: CheckResource[];
  findings: Finding[];
  remediation: RemediationStep[];
  evidence: Evidence[];
  complianceScore: number;
  lastUpdated: Date;
}

interface CheckResource {
  id: string;
  name: string;
  type: string;
  status: string;
  region: string;
}

interface Finding {
  id: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  resourceId: string;
}

interface RemediationStep {
  step: number;
  description: string;
  action: string;
  estimatedTime: string;
}

interface Evidence {
  type: string;
  description: string;
  timestamp: Date;
}

interface FrameworkScore {
  name: string;
  score: number;
  trend: number;
}

interface RiskCategory {
  name: string;
  score: number;
  items: RiskItem[];
}

interface RiskItem {
  title: string;
  description: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ComplianceTrend {
  framework: string;
  currentScore: number;
  previousScore: number;
  change: number;
}

interface AIRecommendation {
  id: string;
  title: string;
  framework: string;
  severity: string;
  description: string;
  action: string;
}

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.css']
})
export class ComplianceComponent implements OnInit {
  // Data properties
  overallScore = 78;
  frameworkScores: FrameworkScore[] = [];
  riskCategories: RiskCategory[] = [];
  complianceChecks: ComplianceCheck[] = [];
  filteredChecks: ComplianceCheck[] = [];
  complianceTrends: ComplianceTrend[] = [];
  aiRecommendations: AIRecommendation[] = [];

  // Filter properties
  selectedFramework = '';
  selectedProvider = '';

  // Modal properties
  showScheduleModal = false;
  showAIGuidance = false;
  showDetailsModal = false;
  selectedCheck: ComplianceCheck | null = null;
  scanFrequency = 'weekly';
  scanTime = '02:00';
  availableFrameworks = ['GDPR', 'SOC 2', 'ISO 27001', 'HIPAA', 'CIS Benchmarks'];
  selectedFrameworks: string[] = [];

  // Math object for template access
  Math = Math;

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadComplianceData();
    this.loadFrameworkScores();
    this.loadRiskCategories();
    this.loadComplianceChecks();
    this.loadComplianceTrends();
    this.loadAIRecommendations();
  }

  loadComplianceData() {
    this.http.get<any>(`${this.apiUrl}/compliance/overview`).subscribe({
      next: (data) => {
        this.overallScore = data.overallScore;
      },
      error: (error) => {
        console.error('Error loading compliance data:', error);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    // Mock overall score
    this.overallScore = 78;
  }

  loadFrameworkScores() {
    this.frameworkScores = [
      { name: 'GDPR', score: 85, trend: 5 },
      { name: 'SOC 2', score: 92, trend: 2 },
      { name: 'ISO 27001', score: 78, trend: -3 },
      { name: 'HIPAA', score: 65, trend: 8 },
      { name: 'CIS Benchmarks', score: 88, trend: 1 }
    ];
  }

  loadRiskCategories() {
    this.riskCategories = [
      {
        name: 'Access Control',
        score: 85,
        items: [
          {
            title: 'Multi-Factor Authentication',
            description: 'MFA enabled for all users',
            status: 'COMPLIANT',
            severity: 'HIGH'
          },
          {
            title: 'Privileged Access Management',
            description: 'PAM controls in place',
            status: 'WARNING',
            severity: 'MEDIUM'
          },
          {
            title: 'Access Reviews',
            description: 'Regular access reviews conducted',
            status: 'NON_COMPLIANT',
            severity: 'HIGH'
          }
        ]
      },
      {
        name: 'Data Protection',
        score: 72,
        items: [
          {
            title: 'Data Encryption at Rest',
            description: 'All data encrypted at rest',
            status: 'COMPLIANT',
            severity: 'CRITICAL'
          },
          {
            title: 'Data Encryption in Transit',
            description: 'TLS 1.2+ for all communications',
            status: 'COMPLIANT',
            severity: 'CRITICAL'
          },
          {
            title: 'Data Classification',
            description: 'Data classification policy implemented',
            status: 'WARNING',
            severity: 'MEDIUM'
          }
        ]
      },
      {
        name: 'Network Security',
        score: 90,
        items: [
          {
            title: 'Firewall Rules',
            description: 'Proper firewall configuration',
            status: 'COMPLIANT',
            severity: 'HIGH'
          },
          {
            title: 'Network Segmentation',
            description: 'Network properly segmented',
            status: 'COMPLIANT',
            severity: 'HIGH'
          },
          {
            title: 'VPN Configuration',
            description: 'Secure VPN setup',
            status: 'COMPLIANT',
            severity: 'MEDIUM'
          }
        ]
      },
      {
        name: 'Monitoring & Logging',
        score: 68,
        items: [
          {
            title: 'Security Monitoring',
            description: 'SIEM system in place',
            status: 'WARNING',
            severity: 'HIGH'
          },
          {
            title: 'Log Retention',
            description: 'Logs retained for required period',
            status: 'NON_COMPLIANT',
            severity: 'MEDIUM'
          },
          {
            title: 'Incident Response',
            description: 'Incident response plan documented',
            status: 'COMPLIANT',
            severity: 'HIGH'
          }
        ]
      }
    ];
  }

  loadComplianceChecks() {
    this.complianceChecks = [
      {
        id: 'gdpr-001',
        title: 'Data Subject Rights Implementation',
        framework: 'GDPR',
        provider: 'AWS',
        description: 'Verify that data subject rights (access, rectification, erasure) are properly implemented',
        status: 'PASS',
        lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000),
        nextScan: new Date(Date.now() + 22 * 60 * 60 * 1000),
        resourceCount: 15,
        severity: 'HIGH'
      },
      {
        id: 'soc2-001',
        title: 'Access Control Monitoring',
        framework: 'SOC 2',
        provider: 'Azure',
        description: 'Monitor and log all access to customer data and systems',
        status: 'PASS',
        lastScan: new Date(Date.now() - 1 * 60 * 60 * 1000),
        nextScan: new Date(Date.now() + 23 * 60 * 60 * 1000),
        resourceCount: 8,
        severity: 'CRITICAL'
      },
      {
        id: 'iso-001',
        title: 'Information Security Management',
        framework: 'ISO 27001',
        provider: 'GCP',
        description: 'Verify implementation of information security management system',
        status: 'WARNING',
        lastScan: new Date(Date.now() - 4 * 60 * 60 * 1000),
        nextScan: new Date(Date.now() + 20 * 60 * 60 * 1000),
        resourceCount: 12,
        severity: 'HIGH'
      },
      {
        id: 'hipaa-001',
        title: 'Administrative Safeguards',
        framework: 'HIPAA',
        provider: 'AWS',
        description: 'Ensure administrative safeguards are in place for PHI protection',
        status: 'FAIL',
        lastScan: new Date(Date.now() - 6 * 60 * 60 * 1000),
        nextScan: new Date(Date.now() + 18 * 60 * 60 * 1000),
        resourceCount: 5,
        severity: 'CRITICAL'
      },
      {
        id: 'cis-001',
        title: 'CIS Control 3.2.1',
        framework: 'CIS',
        provider: 'Azure',
        description: 'Ensure S3 buckets have encryption enabled',
        status: 'PASS',
        lastScan: new Date(Date.now() - 1 * 60 * 60 * 1000),
        nextScan: new Date(Date.now() + 23 * 60 * 60 * 1000),
        resourceCount: 20,
        severity: 'MEDIUM'
      },
      {
        id: 'cis-002',
        title: 'CIS Control 4.1.1',
        framework: 'CIS',
        provider: 'GCP',
        description: 'Verify that CloudTrail is enabled and configured properly',
        status: 'PENDING',
        lastScan: new Date(Date.now() - 8 * 60 * 60 * 1000),
        nextScan: new Date(Date.now() + 16 * 60 * 60 * 1000),
        resourceCount: 3,
        severity: 'HIGH'
      }
    ];
    this.filteredChecks = this.complianceChecks;
  }

  loadComplianceTrends() {
    this.complianceTrends = [
      { framework: 'GDPR', currentScore: 85, previousScore: 80, change: 5 },
      { framework: 'SOC 2', currentScore: 92, previousScore: 90, change: 2 },
      { framework: 'ISO 27001', currentScore: 78, previousScore: 81, change: -3 },
      { framework: 'HIPAA', currentScore: 65, previousScore: 57, change: 8 },
      { framework: 'CIS Benchmarks', currentScore: 88, previousScore: 87, change: 1 }
    ];
  }

  loadAIRecommendations() {
    this.aiRecommendations = [
      {
        id: 'ai-001',
        title: 'Enable S3 Bucket Encryption',
        framework: 'CIS-3.2.1',
        severity: 'HIGH',
        description: 'Enable server-side encryption for your S3 buckets to meet CIS benchmark requirements. This will protect your data at rest and improve your compliance posture.',
        action: 'Enable S3 bucket encryption with AES-256'
      },
      {
        id: 'ai-002',
        title: 'Implement Multi-Factor Authentication',
        framework: 'SOC 2-CC6.1',
        severity: 'CRITICAL',
        description: 'Enable MFA for all administrative accounts to strengthen access controls and meet SOC 2 requirements for logical access security.',
        action: 'Enable MFA for all IAM users with administrative privileges'
      },
      {
        id: 'ai-003',
        title: 'Configure CloudTrail Logging',
        framework: 'CIS-4.1.1',
        severity: 'MEDIUM',
        description: 'Enable CloudTrail logging to monitor API calls and maintain an audit trail for compliance and security purposes.',
        action: 'Enable CloudTrail with log file validation'
      }
    ];
  }

  // Filter methods
  filterByFramework() {
    this.applyFilters();
  }

  filterByProvider() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredChecks = this.complianceChecks.filter(check => {
      const frameworkMatch = !this.selectedFramework || check.framework === this.selectedFramework;
      const providerMatch = !this.selectedProvider || check.provider === this.selectedProvider;
      return frameworkMatch && providerMatch;
    });
  }

  // Status and class methods
  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'warning';
    return 'critical';
  }

  getComplianceStatus(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Needs Attention';
    return 'Critical';
  }

  getRiskLevel(score: number): string {
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    return 'High';
  }

  getRiskLevelClass(score: number): string {
    if (score >= 80) return 'low-risk';
    if (score >= 60) return 'medium-risk';
    return 'high-risk';
  }

  getCheckStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getCheckIcon(status: string): string {
    switch (status) {
      case 'PASS': return 'icon-check';
      case 'FAIL': return 'icon-error';
      case 'WARNING': return 'icon-warning';
      case 'PENDING': return 'icon-clock';
      default: return 'icon-question';
    }
  }

  getRiskItemClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

  getRiskIcon(status: string): string {
    switch (status) {
      case 'COMPLIANT': return 'icon-check';
      case 'NON_COMPLIANT': return 'icon-error';
      case 'WARNING': return 'icon-warning';
      default: return 'icon-question';
    }
  }

  // Action methods
  runComplianceScan() {
    console.log('Running full compliance scan...');
    // TODO: Implement full compliance scan
  }

  scheduleScan() {
    this.showScheduleModal = true;
  }

  closeScheduleModal() {
    this.showScheduleModal = false;
  }

  saveSchedule() {
    console.log('Saving scan schedule:', {
      frequency: this.scanFrequency,
      time: this.scanTime,
      frameworks: this.selectedFrameworks
    });
    this.closeScheduleModal();
  }

  viewCheckDetails(check: ComplianceCheck) {
    // Load detailed information for the check
    if (!check.details) {
      check.details = this.loadCheckDetails(check);
    }
    this.selectedCheck = check;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedCheck = null;
  }

  loadCheckDetails(check: ComplianceCheck): ComplianceCheckDetails {
    // Mock detailed data - in production, this would come from the backend
    const mockDetails: { [key: string]: ComplianceCheckDetails } = {
      'gdpr-001': {
        requirement: 'Data Subject Rights (Article 15-22)',
        controlId: 'GDPR-ART-15-22',
        resources: [
          { id: 'res-1', name: 'User Data API', type: 'API Gateway', status: 'COMPLIANT', region: 'us-east-1' },
          { id: 'res-2', name: 'Customer Database', type: 'RDS', status: 'COMPLIANT', region: 'us-east-1' },
          { id: 'res-3', name: 'Data Export Service', type: 'Lambda', status: 'WARNING', region: 'us-west-2' }
        ],
        findings: [
          {
            id: 'find-1',
            description: 'Data export functionality implemented correctly',
            severity: 'LOW',
            status: 'RESOLVED',
            resourceId: 'res-1'
          },
          {
            id: 'find-2',
            description: 'Data deletion process needs optimization',
            severity: 'MEDIUM',
            status: 'OPEN',
            resourceId: 'res-3'
          }
        ],
        remediation: [
          {
            step: 1,
            description: 'Review data deletion workflow',
            action: 'Optimize Lambda function for bulk deletion',
            estimatedTime: '2 hours'
          },
          {
            step: 2,
            description: 'Add automated testing',
            action: 'Create unit tests for data subject rights endpoints',
            estimatedTime: '4 hours'
          }
        ],
        evidence: [
          {
            type: 'Configuration',
            description: 'API endpoints configured for data subject access requests',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            type: 'Log',
            description: 'Data export logs show successful processing',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
          }
        ],
        complianceScore: 92,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      'soc2-001': {
        requirement: 'Access Control Monitoring (CC6.1)',
        controlId: 'SOC2-CC6.1',
        resources: [
          { id: 'res-4', name: 'IAM Service', type: 'IAM', status: 'COMPLIANT', region: 'global' },
          { id: 'res-5', name: 'CloudTrail Logs', type: 'CloudTrail', status: 'COMPLIANT', region: 'us-east-1' },
          { id: 'res-6', name: 'Access Review Dashboard', type: 'CloudWatch', status: 'COMPLIANT', region: 'us-east-1' }
        ],
        findings: [
          {
            id: 'find-3',
            description: 'All access attempts are logged and monitored',
            severity: 'LOW',
            status: 'RESOLVED',
            resourceId: 'res-5'
          }
        ],
        remediation: [],
        evidence: [
          {
            type: 'Log',
            description: 'CloudTrail logs show comprehensive access monitoring',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
          }
        ],
        complianceScore: 98,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      'iso-001': {
        requirement: 'Information Security Management System (A.5)',
        controlId: 'ISO27001-A.5',
        resources: [
          { id: 'res-7', name: 'Security Policy DB', type: 'DynamoDB', status: 'WARNING', region: 'us-east-1' },
          { id: 'res-8', name: 'Documentation Service', type: 'S3', status: 'COMPLIANT', region: 'us-west-2' }
        ],
        findings: [
          {
            id: 'find-4',
            description: 'Security policy documentation needs update',
            severity: 'MEDIUM',
            status: 'OPEN',
            resourceId: 'res-7'
          }
        ],
        remediation: [
          {
            step: 1,
            description: 'Update security policy documents',
            action: 'Review and update ISMS documentation',
            estimatedTime: '8 hours'
          }
        ],
        evidence: [
          {
            type: 'Document',
            description: 'ISMS documentation available in S3',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }
        ],
        complianceScore: 75,
        lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      'hipaa-001': {
        requirement: 'Administrative Safeguards (164.308)',
        controlId: 'HIPAA-164.308',
        resources: [
          { id: 'res-9', name: 'PHI Database', type: 'RDS', status: 'FAIL', region: 'us-east-1' },
          { id: 'res-10', name: 'Access Control System', type: 'IAM', status: 'WARNING', region: 'global' }
        ],
        findings: [
          {
            id: 'find-5',
            description: 'Missing encryption at rest for PHI database',
            severity: 'CRITICAL',
            status: 'OPEN',
            resourceId: 'res-9'
          },
          {
            id: 'find-6',
            description: 'Access reviews not conducted quarterly',
            severity: 'HIGH',
            status: 'OPEN',
            resourceId: 'res-10'
          }
        ],
        remediation: [
          {
            step: 1,
            description: 'Enable encryption for PHI database',
            action: 'Enable RDS encryption with KMS key',
            estimatedTime: '1 hour'
          },
          {
            step: 2,
            description: 'Schedule quarterly access reviews',
            action: 'Configure automated access review workflow',
            estimatedTime: '4 hours'
          }
        ],
        evidence: [],
        complianceScore: 45,
        lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      'cis-001': {
        requirement: 'CIS Control 3.2.1 - S3 Bucket Encryption',
        controlId: 'CIS-3.2.1',
        resources: [
          { id: 'res-11', name: 's3-bucket-1', type: 'S3', status: 'COMPLIANT', region: 'us-east-1' },
          { id: 'res-12', name: 's3-bucket-2', type: 'S3', status: 'COMPLIANT', region: 'us-west-2' },
          { id: 'res-13', name: 's3-bucket-3', type: 'S3', status: 'COMPLIANT', region: 'eu-west-1' }
        ],
        findings: [],
        remediation: [],
        evidence: [
          {
            type: 'Configuration',
            description: 'All S3 buckets have server-side encryption enabled',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
          }
        ],
        complianceScore: 100,
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      'cis-002': {
        requirement: 'CIS Control 4.1.1 - CloudTrail Configuration',
        controlId: 'CIS-4.1.1',
        resources: [
          { id: 'res-14', name: 'CloudTrail-Logs', type: 'CloudTrail', status: 'PENDING', region: 'us-east-1' }
        ],
        findings: [
          {
            id: 'find-7',
            description: 'CloudTrail configuration in progress',
            severity: 'MEDIUM',
            status: 'IN_PROGRESS',
            resourceId: 'res-14'
          }
        ],
        remediation: [
          {
            step: 1,
            description: 'Complete CloudTrail setup',
            action: 'Enable CloudTrail with log file validation',
            estimatedTime: '30 minutes'
          }
        ],
        evidence: [],
        complianceScore: 0,
        lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000)
      }
    };

    return mockDetails[check.id] || {
      requirement: check.title,
      controlId: check.id,
      resources: [],
      findings: [],
      remediation: [],
      evidence: [],
      complianceScore: check.status === 'PASS' ? 100 : check.status === 'FAIL' ? 0 : 50,
      lastUpdated: check.lastScan
    };
  }

  runSingleCheck(check: ComplianceCheck) {
    console.log('Running single check:', check);
  }

  getAIRecommendation(check: ComplianceCheck) {
    this.showAIGuidance = true;
    console.log('Getting AI recommendation for:', check);
  }

  toggleAIGuidance() {
    this.showAIGuidance = !this.showAIGuidance;
  }

  implementRecommendation(recommendation: AIRecommendation) {
    console.log('Implementing recommendation:', recommendation);
  }

  learnMore(recommendation: AIRecommendation) {
    console.log('Learning more about:', recommendation);
  }
}
