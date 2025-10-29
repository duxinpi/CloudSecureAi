import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  // Edit mode state
  isEditingPersonalInfo = false;
  isEditingProfile = false;
  
  // Profile data
  profileData = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    title: 'Security Administrator',
    department: 'IT Security',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    memberSince: 'January 15, 2023',
    employeeId: 'EMP-2023-001',
    lastActive: '2 hours ago'
  };

  // Editable profile data (copy for editing)
  editableProfileData = { ...this.profileData };

  // Security settings
  securitySettings = {
    twoFactorAuth: true,
    passwordStrength: 'Strong',
    lastPasswordChange: '30 days ago',
    sessionTimeout: '8 hours',
    activeSessions: 2
  };

  // Preferences
  preferences = {
    language: 'English (United States)',
    timezone: 'Pacific Standard Time (PST)',
    theme: 'Dark Mode',
    emailNotifications: true,
    smsNotifications: false,
    dashboardLayout: 'Compact view with all widgets'
  };

  // Recent activity
  recentActivity = [
    {
      type: 'login',
      title: 'Successful Login',
      description: 'Logged in from Chrome on MacOS',
      time: '2 hours ago',
      icon: 'login'
    },
    {
      type: 'security',
      title: 'Security Scan Completed',
      description: 'Vulnerability scan finished with 3 issues found',
      time: '5 hours ago',
      icon: 'security'
    },
    {
      type: 'settings',
      title: 'Profile Updated',
      description: 'Changed notification preferences',
      time: '1 day ago',
      icon: 'settings'
    },
    {
      type: 'password',
      title: 'Password Changed',
      description: 'Password successfully updated',
      time: '30 days ago',
      icon: 'password'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  // Toggle methods for interactive elements
  toggleTwoFactorAuth(): void {
    this.securitySettings.twoFactorAuth = !this.securitySettings.twoFactorAuth;
  }

  toggleTheme(): void {
    this.preferences.theme = this.preferences.theme === 'Dark Mode' ? 'Light Mode' : 'Dark Mode';
  }

  toggleEmailNotifications(): void {
    this.preferences.emailNotifications = !this.preferences.emailNotifications;
  }

  toggleSmsNotifications(): void {
    this.preferences.smsNotifications = !this.preferences.smsNotifications;
  }

  // Action methods
  editProfile(): void {
    this.isEditingProfile = true;
    this.editableProfileData = { ...this.profileData };
  }

  editPersonalInfo(): void {
    this.isEditingPersonalInfo = true;
    this.editableProfileData = { ...this.profileData };
  }

  savePersonalInfo(): void {
    // Update the profile data with edited values
    this.profileData = { ...this.editableProfileData };
    this.isEditingPersonalInfo = false;
    console.log('Personal information saved:', this.profileData);
  }

  saveProfile(): void {
    // Update the profile data with edited values
    this.profileData = { ...this.editableProfileData };
    this.isEditingProfile = false;
    console.log('Profile saved:', this.profileData);
  }

  cancelEdit(): void {
    this.isEditingPersonalInfo = false;
    this.isEditingProfile = false;
    this.editableProfileData = { ...this.profileData };
  }

  openSettings(): void {
    console.log('Settings clicked');
    // Implement settings functionality
  }

  changePassword(): void {
    console.log('Change password clicked');
    // Implement change password functionality
  }

  configureSessionTimeout(): void {
    console.log('Configure session timeout clicked');
    // Implement session timeout configuration
  }

  viewActiveSessions(): void {
    console.log('View active sessions clicked');
    // Implement view active sessions functionality
  }

  changeLanguage(): void {
    console.log('Change language clicked');
    // Implement language change functionality
  }

  changeTimezone(): void {
    console.log('Change timezone clicked');
    // Implement timezone change functionality
  }

  customizeDashboard(): void {
    console.log('Customize dashboard clicked');
    // Implement dashboard customization functionality
  }

  viewAllActivity(): void {
    console.log('View all activity clicked');
    // Implement view all activity functionality
  }

  // Utility method to get user initials
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
