import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    with zipfile.ZipFile(path) as docx:
        xml_content = docx.read('word/document.xml')
    tree = ET.XML(xml_content)
    WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
    PARA = WORD_NAMESPACE + 'p'
    TEXT = WORD_NAMESPACE + 't'
    
    texts = []
    for paragraph in tree.iter(PARA):
        texts.append(''.join(node.text for node in paragraph.iter(TEXT) if node.text))
    return '\n'.join(texts)

if __name__ == "__main__":
    content = read_docx(r'C:\Users\nikhi\Downloads\Project Title.docx')
    with open('read_docx_output.txt', 'w', encoding='utf-8') as f:
        f.write(content)

