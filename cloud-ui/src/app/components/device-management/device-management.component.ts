import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Device {
  id: number;
  deviceName: string;
  deviceId: string;
  deviceType: string; // e.g., Smartphone, Tablet, Laptop, Desktop, IoT
  platform: string; // e.g., iOS, Android, Windows, macOS, Linux
  operatingSystem: string;
  osVersion: string;
  ownerName: string;
  department: string;
  enrollmentStatus: 'Enrolled' | 'Pending' | 'Failed' | 'Unenrolled';
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'At-Risk' | 'Unknown';
  encryptionEnabled: boolean;
  screenLockEnabled: boolean;
  isJailbroken: boolean;
  appStoreEnabled: boolean;
  remoteWipeEnabled: boolean;
  lastSeen: string;
  securityAlerts: number;
  recentAlerts: Alert[];
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Alert {
  id: number;
  message: string;
  severity: string;
  timestamp: string;
  deviceId: string;
}

@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.css']
})
export class DeviceManagementComponent implements OnInit {
  devices: Device[] = [];
  filteredDevices: Device[] = [];
  selectedDevice: Device | null = null;
  showDeviceModal = false;
  showDetailsModal = false;
  isEditingDevice = false;
  editingDevice: Device | null = null;
  deviceForm: FormGroup;
  
  // Statistics
  enrolledDevices = 0;
  compliantDevices = 0;
  nonCompliantDevices = 0;
  totalDevices = 0;
  
  // Filters
  complianceFilter = '';
  typeFilter = '';
  platformFilter = '';
  searchTerm = '';

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.deviceForm = this.fb.group({
      deviceName: ['', Validators.required],
      deviceType: ['', Validators.required],
      platform: ['', Validators.required],
      operatingSystem: [''],
      osVersion: [''],
      ownerName: ['', Validators.required],
      department: ['', Validators.required],
      tags: [''],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
    this.http.get<Device[]>(`${this.apiUrl}/devices`).subscribe({
      next: (devices) => {
        this.devices = devices;
        this.applyFilters();
        this.calculateStatistics();
      },
      error: (error) => {
        console.error('Error loading devices:', error);
        this.loadMockData(); // Fallback to mock data if API fails
      }
    });
  }

  loadMockData() {
    // Mock MDM device data for development
    this.devices = [
      {
        id: 1,
        deviceName: 'John Smith iPhone',
        deviceId: 'iphone-js-001',
        deviceType: 'Smartphone',
        platform: 'iOS',
        operatingSystem: 'iOS',
        osVersion: '17.1',
        ownerName: 'John Smith',
        department: 'Sales',
        enrollmentStatus: 'Enrolled',
        complianceStatus: 'Compliant',
        encryptionEnabled: true,
        screenLockEnabled: true,
        isJailbroken: false,
        appStoreEnabled: true,
        remoteWipeEnabled: true,
        lastSeen: new Date().toISOString(),
        securityAlerts: 0,
        tags: ['sales', 'mobile', 'critical'],
        recentAlerts: [],
        description: 'Company iPhone for sales team',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        deviceName: 'Sarah Johnson iPad',
        deviceId: 'ipad-sj-002',
        deviceType: 'Tablet',
        platform: 'iOS',
        operatingSystem: 'iPadOS',
        osVersion: '17.1',
        ownerName: 'Sarah Johnson',
        department: 'Marketing',
        enrollmentStatus: 'Enrolled',
        complianceStatus: 'Non-Compliant',
        encryptionEnabled: false,
        screenLockEnabled: false,
        isJailbroken: false,
        appStoreEnabled: true,
        remoteWipeEnabled: true,
        lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        securityAlerts: 2,
        tags: ['marketing', 'tablet'],
        recentAlerts: [
          {
            id: 1,
            message: 'Encryption not enabled',
            severity: 'critical',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            deviceId: 'ipad-sj-002'
          },
          {
            id: 2,
            message: 'Screen lock not configured',
            severity: 'warning',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            deviceId: 'ipad-sj-002'
          }
        ],
        description: 'Marketing team iPad for presentations',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        deviceName: 'Mike Chen Android',
        deviceId: 'android-mc-003',
        deviceType: 'Smartphone',
        platform: 'Android',
        operatingSystem: 'Android',
        osVersion: '14',
        ownerName: 'Mike Chen',
        department: 'Engineering',
        enrollmentStatus: 'Pending',
        complianceStatus: 'Unknown',
        encryptionEnabled: true,
        screenLockEnabled: true,
        isJailbroken: true,
        appStoreEnabled: false,
        remoteWipeEnabled: true,
        lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        securityAlerts: 1,
        tags: ['engineering', 'mobile', 'jailbroken'],
        recentAlerts: [
          {
            id: 1,
            message: 'Jailbreak detected - security risk',
            severity: 'critical',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            deviceId: 'android-mc-003'
          }
        ],
        description: 'Engineering team Android device',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        deviceName: 'IoT Sensor Hub',
        deviceId: 'IOT-004',
        deviceType: 'iot',
        operatingSystem: 'Raspberry Pi OS',
        status: 'online',
        healthStatus: 'healthy',
        location: 'Warehouse',
        cloudProvider: 'GCP',
        lastSeen: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        cpuUsage: 12,
        memoryUsage: 34,
        storageUsage: 8,
        alertCount: 0,
        tags: ['iot', 'sensor', 'monitoring'],
        recentAlerts: [],
        description: 'Environmental monitoring sensor hub',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 5,
        deviceName: 'Network Switch',
        deviceId: 'NET-005',
        deviceType: 'network',
        operatingSystem: 'Cisco IOS',
        status: 'online',
        healthStatus: 'healthy',
        location: 'Data Center A',
        cloudProvider: 'On-Premise',
        lastSeen: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
        cpuUsage: 5,
        memoryUsage: 15,
        storageUsage: 12,
        alertCount: 0,
        tags: ['network', 'infrastructure', 'switch'],
        recentAlerts: [],
        description: 'Core network switch',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    this.applyFilters();
    this.calculateStatistics();
  }

  calculateStatistics() {
    this.totalDevices = this.devices.length;
    this.enrolledDevices = this.devices.filter(d => d.enrollmentStatus === 'Enrolled').length;
    this.compliantDevices = this.devices.filter(d => d.complianceStatus === 'Compliant').length;
    this.nonCompliantDevices = this.devices.filter(d => d.complianceStatus === 'Non-Compliant').length;
  }

  applyFilters() {
    this.filteredDevices = this.devices.filter(device => {
      const matchesCompliance = !this.complianceFilter || device.complianceStatus.toLowerCase() === this.complianceFilter;
      const matchesType = !this.typeFilter || device.deviceType.toLowerCase() === this.typeFilter;
      const matchesPlatform = !this.platformFilter || device.platform.toLowerCase() === this.platformFilter;
      const matchesSearch = !this.searchTerm || 
        device.deviceName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        device.deviceId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        device.ownerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        device.department.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (device.description && device.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesCompliance && matchesType && matchesPlatform && matchesSearch;
    });
  }

  getDeviceCardClass(device: Device): string {
    const baseClass = 'device-card';
    const enrollmentClass = `enrollment-${device.enrollmentStatus.toLowerCase()}`;
    const complianceClass = `compliance-${device.complianceStatus.toLowerCase().replace('-', '')}`;
    return `${baseClass} ${enrollmentClass} ${complianceClass}`;
  }

  formatLastSeen(lastSeen: string): string {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  formatAlertTime(timestamp: string): string {
    return this.formatLastSeen(timestamp);
  }

  openEnrollmentModal() {
    this.isEditingDevice = false;
    this.editingDevice = null;
    this.deviceForm.reset();
    this.showDeviceModal = true;
  }

  editDevice(device: Device) {
    this.isEditingDevice = true;
    this.editingDevice = device;
    this.deviceForm.patchValue({
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      platform: device.platform,
      operatingSystem: device.operatingSystem,
      osVersion: device.osVersion,
      ownerName: device.ownerName,
      department: device.department,
      tags: device.tags.join(', '),
      description: device.description
    });
    this.showDeviceModal = true;
  }

  editSelectedDevice() {
    if (this.selectedDevice) {
      this.closeDetailsModal();
      this.editDevice(this.selectedDevice);
    }
  }

  enforcePolicy(device: Device) {
    console.log('Enforcing policy for device:', device.deviceName);
    // TODO: Implement policy enforcement
    alert(`Enforcing security policies for ${device.deviceName}`);
  }

  remoteWipe(device: Device) {
    if (confirm(`Are you sure you want to remotely wipe ${device.deviceName}? This action cannot be undone.`)) {
      console.log('Initiating remote wipe for device:', device.deviceName);
      // TODO: Implement remote wipe
      alert(`Remote wipe initiated for ${device.deviceName}`);
    }
  }

  unenrollDevice(deviceId: number) {
    if (confirm('Are you sure you want to unenroll this device? This will remove all management policies.')) {
      console.log('Unenrolling device:', deviceId);
      // TODO: Implement device unenrollment
      this.devices = this.devices.filter(d => d.id !== deviceId);
      this.applyFilters();
      this.calculateStatistics();
    }
  }

  runComplianceScan() {
    console.log('Running compliance scan...');
    // TODO: Implement compliance scan
    alert('Compliance scan initiated. Results will be available shortly.');
  }

  viewDeviceDetails(device: Device) {
    this.selectedDevice = device;
    this.showDetailsModal = true;
  }

  closeDeviceModal() {
    this.showDeviceModal = false;
    this.isEditingDevice = false;
    this.editingDevice = null;
    this.deviceForm.reset();
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedDevice = null;
  }

  saveDevice() {
    if (this.deviceForm.valid) {
      const formData = this.deviceForm.value;
      const deviceData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
        status: 'offline',
        healthStatus: 'unknown',
        lastSeen: new Date().toISOString(),
        cpuUsage: 0,
        memoryUsage: 0,
        storageUsage: 0,
        alertCount: 0,
        recentAlerts: []
      };

      if (this.isEditingDevice && this.editingDevice) {
        // Update existing device
        this.http.put<Device>(`${this.apiUrl}/devices/${this.editingDevice.id}`, deviceData).subscribe({
          next: (updatedDevice) => {
            const index = this.devices.findIndex(d => d.id === updatedDevice.id);
            if (index !== -1) {
              this.devices[index] = updatedDevice;
              this.applyFilters();
              this.calculateStatistics();
            }
            this.closeDeviceModal();
          },
          error: (error) => {
            console.error('Error updating device:', error);
            // For demo purposes, update locally
            const index = this.devices.findIndex(d => d.id === this.editingDevice!.id);
            if (index !== -1) {
              this.devices[index] = { ...this.devices[index], ...deviceData };
              this.applyFilters();
              this.calculateStatistics();
            }
            this.closeDeviceModal();
          }
        });
      } else {
        // Create new device
        this.http.post<Device>(`${this.apiUrl}/devices`, deviceData).subscribe({
          next: (newDevice) => {
            this.devices.push(newDevice);
            this.applyFilters();
            this.calculateStatistics();
            this.closeDeviceModal();
          },
          error: (error) => {
            console.error('Error creating device:', error);
            // For demo purposes, add locally
            const newDevice: Device = {
              id: Math.max(...this.devices.map(d => d.id)) + 1,
              ...deviceData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            this.devices.push(newDevice);
            this.applyFilters();
            this.calculateStatistics();
            this.closeDeviceModal();
          }
        });
      }
    }
  }

  restartDevice(device: Device) {
    // Simulate device restart
    console.log(`Restarting device: ${device.deviceName}`);
    // In a real implementation, this would call the backend API
    alert(`Restart command sent to ${device.deviceName}`);
  }

  removeDevice(device: Device) {
    if (confirm(`Are you sure you want to remove ${device.deviceName}?`)) {
      this.http.delete(`${this.apiUrl}/devices/${device.id}`).subscribe({
        next: () => {
          this.devices = this.devices.filter(d => d.id !== device.id);
          this.applyFilters();
          this.calculateStatistics();
        },
        error: (error) => {
          console.error('Error removing device:', error);
          // For demo purposes, remove locally
          this.devices = this.devices.filter(d => d.id !== device.id);
          this.applyFilters();
          this.calculateStatistics();
        }
      });
    }
  }

  refreshDevices() {
    this.loadDevices();
  }

  runDeviceScan() {
    // Simulate device scan
    console.log('Running device scan...');
    // In a real implementation, this would call the backend API to scan for new devices
    alert('Device scan initiated. This may take a few minutes to complete.');
  }
}
