import PyPDF2

def read_pdf(file_path):
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text()
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page_text if page_text else "[No text found on this page]"
            return text
    except FileNotFoundError:
        return "Error: File not found."
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

if __name__ == "__main__":
    path_to_pdf = input("Enter the path to the PDF file: ")
    pdf_text = read_pdf(path_to_pdf)
    print("\nExtracted Text:")
    print(pdf_text)
