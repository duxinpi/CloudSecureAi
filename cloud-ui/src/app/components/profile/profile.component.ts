import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChangePasswordRequest, ChangePasswordResponse } from '../../models/auth.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  // Edit mode state
  isEditingPersonalInfo = false;
  isEditingProfile = false;
  showSessionTimeoutModal = false;
  showChangePasswordModal = false;
  showActiveSessionsModal = false;
  
  // Password change security
  passwordChangeAttempts = 0;
  maxPasswordChangeAttempts = 5;
  isChangingPassword = false;
  lastPasswordChangeAttempt: number | null = null;
  passwordChangeError = '';
  
  // Password change data
  changePasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  passwordStrength = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    notCommon: false,
    notSequential: false
  };
  
  passwordStrengthText = '';

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

  // Session timeout configuration
  sessionTimeoutOptions = [
    { value: '15 minutes', minutes: 15 },
    { value: '30 minutes', minutes: 30 },
    { value: '1 hour', minutes: 60 },
    { value: '2 hours', minutes: 120 },
    { value: '4 hours', minutes: 240 },
    { value: '8 hours', minutes: 480 },
    { value: '12 hours', minutes: 720 },
    { value: '24 hours', minutes: 1440 }
  ];
  selectedSessionTimeout: string = '8 hours';

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

  // Active sessions data
  activeSessions = [
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome 120.0',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.100',
      lastActive: '2 minutes ago',
      isCurrent: true,
      loginTime: '2 hours ago'
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      browser: 'Safari Mobile',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.105',
      lastActive: '1 hour ago',
      isCurrent: false,
      loginTime: '1 day ago'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

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
    this.isEditingPersonalInfo = true;
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
    this.isEditingPersonalInfo = false;
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
    // Check if user is locked out
    if (this.passwordChangeAttempts >= this.maxPasswordChangeAttempts) {
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      if (this.lastPasswordChangeAttempt && 
          Date.now() - this.lastPasswordChangeAttempt < lockoutDuration) {
        const remainingMinutes = Math.ceil((lockoutDuration - (Date.now() - this.lastPasswordChangeAttempt)) / 60000);
        this.passwordChangeError = `Too many failed attempts. Please try again in ${remainingMinutes} minute(s).`;
        this.showChangePasswordModal = true;
        return;
      } else {
        // Reset attempts after lockout period
        this.passwordChangeAttempts = 0;
        this.lastPasswordChangeAttempt = null;
      }
    }
    
    this.showChangePasswordModal = true;
    this.passwordChangeError = '';
    this.resetPasswordForm();
  }

  resetPasswordForm(): void {
    // Clear all password fields securely
    this.changePasswordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordStrength = {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
      notCommon: false,
      notSequential: false
    };
    this.passwordStrengthText = '';
    this.isChangingPassword = false;
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.passwordChangeError = '';
    this.resetPasswordForm();
  }

  // Common weak passwords to check against
  private commonPasswords = [
    'password', 'password123', '12345678', '123456789', '1234567890',
    'qwerty', 'qwerty123', 'abc123', 'admin', 'admin123',
    'letmein', 'welcome', 'monkey', 'dragon', 'master',
    'sunshine', 'password1', 'princess', 'football', 'iloveyou'
  ];

  // Check if password contains sequential characters
  private hasSequentialChars(password: string): boolean {
    const sequences = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuiopasdfghjklzxcvbnm'];
    const lowerPassword = password.toLowerCase();
    
    for (let i = 0; i < lowerPassword.length - 2; i++) {
      for (const seq of sequences) {
        const substr = lowerPassword.substring(i, i + 3);
        if (seq.includes(substr) || seq.split('').reverse().join('').includes(substr)) {
          return true;
        }
      }
    }
    return false;
  }

  // Check if password is common/weak
  private isCommonPassword(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    return this.commonPasswords.some(common => 
      lowerPassword.includes(common) || common.includes(lowerPassword)
    );
  }

  // Check if password contains repeated characters
  private hasRepeatedChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }
    return false;
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        notCommon: false,
        notSequential: false
      };
      this.passwordStrengthText = '';
      return;
    }

    const minLength = 12;
    const maxLength = 128;
    
    this.passwordStrength = {
      length: password.length >= minLength && password.length <= maxLength,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\;'\/~`|]/.test(password),
      notCommon: !this.isCommonPassword(password),
      notSequential: !this.hasSequentialChars(password) && !this.hasRepeatedChars(password)
    };

    const strengthCount = Object.values(this.passwordStrength).filter(v => v).length;
    
    if (strengthCount === 0) {
      this.passwordStrengthText = '';
    } else if (strengthCount <= 3) {
      this.passwordStrengthText = 'Weak';
    } else if (strengthCount <= 5) {
      this.passwordStrengthText = 'Medium';
    } else if (strengthCount === 6) {
      this.passwordStrengthText = 'Strong';
    } else {
      this.passwordStrengthText = 'Very Strong';
    }
  }

  isPasswordStrong(): boolean {
    return Object.values(this.passwordStrength).every(v => v);
  }

  getStrengthWidth(): number {
    const strengthCount = Object.values(this.passwordStrength).filter(v => v).length;
    const maxStrength = Object.keys(this.passwordStrength).length;
    return (strengthCount / maxStrength) * 100;
  }

  onSubmitChangePassword(): void {
    if (this.isChangingPassword) {
      return; // Prevent double submission
    }

    this.passwordChangeError = '';

    // Check lockout status
    if (this.passwordChangeAttempts >= this.maxPasswordChangeAttempts) {
      const lockoutDuration = 15 * 60 * 1000;
      if (this.lastPasswordChangeAttempt && 
          Date.now() - this.lastPasswordChangeAttempt < lockoutDuration) {
        const remainingMinutes = Math.ceil((lockoutDuration - (Date.now() - this.lastPasswordChangeAttempt)) / 60000);
        this.passwordChangeError = `Too many failed attempts. Please try again in ${remainingMinutes} minute(s).`;
        return;
      } else {
        this.passwordChangeAttempts = 0;
        this.lastPasswordChangeAttempt = null;
      }
    }

    // Validation
    if (!this.changePasswordData.currentPassword) {
      this.passwordChangeError = 'Current password is required';
      return;
    }

    if (!this.changePasswordData.newPassword) {
      this.passwordChangeError = 'New password is required';
      return;
    }

    if (this.changePasswordData.newPassword.length < 12) {
      this.passwordChangeError = 'New password must be at least 12 characters long';
      this.passwordChangeAttempts++;
      this.lastPasswordChangeAttempt = Date.now();
      return;
    }

    if (this.changePasswordData.newPassword.length > 128) {
      this.passwordChangeError = 'New password must be no more than 128 characters';
      return;
    }

    if (!this.isPasswordStrong()) {
      this.passwordChangeError = 'New password does not meet security requirements';
      this.passwordChangeAttempts++;
      this.lastPasswordChangeAttempt = Date.now();
      return;
    }

    if (this.changePasswordData.newPassword !== this.changePasswordData.confirmPassword) {
      this.passwordChangeError = 'New password and confirmation do not match';
      return;
    }

    if (this.changePasswordData.currentPassword === this.changePasswordData.newPassword) {
      this.passwordChangeError = 'New password must be different from your current password';
      this.passwordChangeAttempts++;
      this.lastPasswordChangeAttempt = Date.now();
      return;
    }

    // Check if password contains username or email
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      const username = currentUser.username?.toLowerCase() || '';
      const email = currentUser.email?.toLowerCase() || '';
      const newPasswordLower = this.changePasswordData.newPassword.toLowerCase();
      
      if (username && newPasswordLower.includes(username)) {
        this.passwordChangeError = 'New password cannot contain your username';
        this.passwordChangeAttempts++;
        this.lastPasswordChangeAttempt = Date.now();
        return;
      }
      
      if (email) {
        const emailParts = email.split('@');
        if (emailParts[0] && newPasswordLower.includes(emailParts[0])) {
          this.passwordChangeError = 'New password cannot contain your email';
          this.passwordChangeAttempts++;
          this.lastPasswordChangeAttempt = Date.now();
          return;
        }
      }
    }

    // All validations passed
    this.isChangingPassword = true;
    this.passwordChangeError = '';

    const changePasswordRequest: ChangePasswordRequest = {
      currentPassword: this.changePasswordData.currentPassword,
      newPassword: this.changePasswordData.newPassword
    };

    // IMPORTANT: Do NOT log passwords - only log generic operation status
    this.authService.changePassword(changePasswordRequest).subscribe({
      next: (response: ChangePasswordResponse) => {
        this.isChangingPassword = false;
        this.passwordChangeAttempts = 0;
        this.lastPasswordChangeAttempt = null;
        
        // Clear sensitive data immediately
        this.resetPasswordForm();
        this.closeChangePasswordModal();
        
        // Update last password change time
        this.securitySettings.lastPasswordChange = 'Just now';
        
        alert('Password changed successfully! Please login again.');
        // Force logout for security
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        this.isChangingPassword = false;
        this.passwordChangeAttempts++;
        this.lastPasswordChangeAttempt = Date.now();
        
        // Generic error message - do NOT expose specific validation details
        const errorMsg = error.error?.message || 'Failed to change password. Please verify your current password and try again.';
        this.passwordChangeError = errorMsg;
        
        // Clear current password field for security
        this.changePasswordData.currentPassword = '';
      }
    });
  }

  configureSessionTimeout(): void {
    this.selectedSessionTimeout = this.securitySettings.sessionTimeout;
    this.showSessionTimeoutModal = true;
  }

  saveSessionTimeout(): void {
    this.securitySettings.sessionTimeout = this.selectedSessionTimeout;
    this.showSessionTimeoutModal = false;
    console.log('Session timeout updated to:', this.securitySettings.sessionTimeout);
    // TODO: Call API to save session timeout to backend
  }

  cancelSessionTimeoutConfig(): void {
    this.showSessionTimeoutModal = false;
    this.selectedSessionTimeout = this.securitySettings.sessionTimeout;
  }

  viewActiveSessions(): void {
    this.showActiveSessionsModal = true;
    // TODO: Fetch active sessions from backend API
  }

  closeActiveSessionsModal(): void {
    this.showActiveSessionsModal = false;
  }

  terminateSession(sessionId: string): void {
    if (confirm('Are you sure you want to terminate this session? You will be logged out from that device.')) {
      // Find the session
      const session = this.activeSessions.find(s => s.id === sessionId);
      if (session) {
        // If terminating current session, logout completely
        if (session.isCurrent) {
          alert('You cannot terminate your current session. Please use the logout button instead.');
          return;
        }
        
        // Remove session from list
        this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
        this.securitySettings.activeSessions = this.activeSessions.length;
        
        // TODO: Call backend API to terminate session
        console.log('Terminating session:', sessionId);
        
        // Show success message
        alert('Session terminated successfully.');
      }
    }
  }

  terminateAllOtherSessions(): void {
    const otherSessions = this.activeSessions.filter(s => !s.isCurrent);
    if (otherSessions.length === 0) {
      alert('No other active sessions to terminate.');
      return;
    }
    
    if (confirm(`Are you sure you want to terminate all other sessions (${otherSessions.length})? You will be logged out from all other devices.`)) {
      // Keep only current session
      this.activeSessions = this.activeSessions.filter(s => s.isCurrent);
      this.securitySettings.activeSessions = this.activeSessions.length;
      
      // TODO: Call backend API to terminate all other sessions
      console.log('Terminating all other sessions');
      
      // Show success message
      alert(`Successfully terminated ${otherSessions.length} session(s).`);
    }
  }

  hasOtherSessions(): boolean {
    return this.activeSessions.filter(s => !s.isCurrent).length > 0;
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
