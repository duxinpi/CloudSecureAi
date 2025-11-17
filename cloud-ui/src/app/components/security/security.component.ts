import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css']
})
export class SecurityComponent {
  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  exportSecurityReport() {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString();

    const reportLines = [
      'Security Overview Report',
      '========================',
      `Generated: ${formattedDate} ${formattedTime}`,
      '',
      'Current Posture:',
      '- Accounts secured: AWS, Azure, GCP',
      '- Open alerts: 0 critical, 2 high, 5 medium',
      '- Last scan: within 24 hours',
      '',
      'Recommendations:',
      '1. Enable MFA for all admin users',
      '2. Rotate access keys older than 90 days',
      '3. Apply CIS benchmark hardening to new resources',
      '',
      'End of report.'
    ];

    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    if ((navigator as any).msSaveOrOpenBlob) {
      (navigator as any).msSaveOrOpenBlob(blob, 'security-report.txt');
      return;
    }

    const url = window.URL.createObjectURL(blob);

    const anchor = this.renderer.createElement('a');
    anchor.href = url;
    anchor.download = `security-report-${timestamp.getFullYear()}-${(timestamp.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${timestamp.getDate().toString().padStart(2, '0')}.txt`;
    anchor.style.display = 'none';
    this.renderer.appendChild(this.document.body, anchor);
    anchor.click();
    this.renderer.removeChild(this.document.body, anchor);

    window.URL.revokeObjectURL(url);
  }
}


