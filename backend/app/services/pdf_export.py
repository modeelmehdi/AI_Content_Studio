from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape
from fastapi import HTTPException
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def export_pdf(content):
    font_path = Path(__file__).resolve().parents[2] / 'assets/NotoSans-Regular.ttf'
    if not font_path.exists():
        raise HTTPException(503, 'The PDF font is missing from the server installation.')
    if 'StudioSans' not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont('StudioSans', str(font_path)))
    text = content['title'] + '\n' + content.get('text', '')
    font = pdfmetrics.getFont('StudioSans')
    unsupported = {c for c in text if ord(c) > 31 and ord(c) not in font.face.charToGlyph}
    if unsupported:
        raise HTTPException(422, 'This PDF font cannot represent some characters. Use TXT export to preserve the exact content, or remove unsupported symbols.')
    stream = BytesIO()
    doc = SimpleDocTemplate(stream, pagesize=(595.28, 841.89), topMargin=55, bottomMargin=55, leftMargin=48, rightMargin=48, title=content['title'], author='AI Content Studio · Modeel Mehdi')
    styles = getSampleStyleSheet()
    for name in ('Normal', 'Title', 'Heading2'):
        styles[name].fontName = 'StudioSans'
        styles[name].alignment = TA_LEFT
    styles['Normal'].fontSize = 10
    styles['Normal'].leading = 16
    styles['Title'].fontSize = 23
    styles['Title'].leading = 29
    styles['Title'].textColor = colors.HexColor('#243d65')
    story = [Paragraph('AI CONTENT STUDIO', styles['Heading2']), Spacer(1, 14), Paragraph(escape(content['title']), styles['Title']), Spacer(1, 10), Paragraph(escape('Created ' + content['created_at'][:10] + ' · ' + content['kind'].title()), styles['Normal']), Spacer(1, 22)]
    for line in content.get('text', '').splitlines():
        # Escape every user-controlled character before ReportLab sees markup.
        if line.strip():
            story.append(Paragraph(escape(line), styles['Normal']))
            story.append(Spacer(1, 5))
        else:
            story.append(Spacer(1, 9))
    if content.get('seo_title'):
        story.extend([Spacer(1, 16), Paragraph('SEO title', styles['Heading2']), Paragraph(escape(content['seo_title']), styles['Normal'])])
    if content.get('meta_description'):
        story.extend([Spacer(1, 12), Paragraph('Meta description', styles['Heading2']), Paragraph(escape(content['meta_description']), styles['Normal'])])

    def footer(canvas, document):
        canvas.setFont('StudioSans', 8)
        canvas.setFillColor(colors.HexColor('#66758c'))
        canvas.drawString(48, 30, 'AI Content Studio · Modeel Mehdi')
        canvas.drawRightString(document.pagesize[0] - 48, 30, f'Page {document.page}')

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return stream.getvalue()
