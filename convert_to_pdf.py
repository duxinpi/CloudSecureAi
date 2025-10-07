#!/usr/bin/env python3
import webbrowser
import os
import subprocess
import sys

def convert_html_to_pdf():
    html_file = "INTRODUCTION.html"
    pdf_file = "INTRODUCTION.pdf"
    
    if not os.path.exists(html_file):
        print(f"Error: {html_file} not found")
        return False
    
    try:
        # Try using wkhtmltopdf if available   
        result = subprocess.run(['which', 'wkhtmltopdf'], capture_output=True, text=True)
        if result.returncode == 0:
            subprocess.run(['wkhtmltopdf', html_file, pdf_file], check=True)
            print(f"PDF created successfully: {pdf_file}")
            return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    try:
        # Try using weasyprint if available
        result = subprocess.run(['which', 'weasyprint'], capture_output=True, text=True)
        if result.returncode == 0:
            subprocess.run(['weasyprint', html_file, pdf_file], check=True)
            print(f"PDF created successfully: {pdf_file}")
            return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Fallback: open in browser for manual PDF creation
    print("PDF conversion tools not available. Opening HTML file in browser for manual PDF creation.")
    print("Please use your browser's 'Print to PDF' function to save as PDF.")
    webbrowser.open(f"file://{os.path.abspath(html_file)}")
    return False

if __name__ == "__main__":
    convert_html_to_pdf()
