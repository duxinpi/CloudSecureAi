const fs = require('fs');
const { exec } = require('child_process');

// Simple HTML to PDF conversion using system tools
function createPDF() {
    const htmlFile = 'INTRODUCTION.html';
    const pdfFile = 'INTRODUCTION.pdf';
    
    if (!fs.existsSync(htmlFile)) {
        console.log(`Error: ${htmlFile} not found`);
        return;
    }
    
    // Try different PDF conversion methods
    const methods = [
        'wkhtmltopdf',
        'weasyprint',
        'pandoc'
    ];
    
    for (const method of methods) {
        try {
            let command;
            switch (method) {
                case 'wkhtmltopdf':
                    command = `wkhtmltopdf ${htmlFile} ${pdfFile}`;
                    break;
                case 'weasyprint':
                    command = `weasyprint ${htmlFile} ${pdfFile}`;
                    break;
                case 'pandoc':
                    command = `pandoc ${htmlFile} -o ${pdfFile}`;
                    break;
            }
            
            exec(command, (error, stdout, stderr) => {
                if (!error) {
                    console.log(`PDF created successfully using ${method}: ${pdfFile}`);
                    return;
                }
            });
        } catch (err) {
            continue;
        }
    }
    
    console.log('PDF conversion tools not available. Please use browser print to PDF function.');
    console.log(`Open ${htmlFile} in your browser and use Print > Save as PDF`);
}

createPDF();
