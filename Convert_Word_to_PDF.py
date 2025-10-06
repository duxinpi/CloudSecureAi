from docx2pdf import convert
import os

def convert_word_to_pdf(input_path, output_path=None):
    
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"The file '{input_path}' does not exist.")

    try:
        convert(input_path, output_path)
        print(f"Conversion successful! PDF saved to: {output_path or os.path.dirname(input_path)}")
    except Exception as e:
        print(f"Error during conversion: {e}")
        # TO DO, get file name from user
