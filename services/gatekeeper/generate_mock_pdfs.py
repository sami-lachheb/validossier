import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def create_cover_letter(path):
    c = canvas.Canvas(path, pagesize=A4)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 780, "COVER LETTER")
    c.setFont("Helvetica", 11)
    
    lines = [
        "",
        "To: Direction de la Pharmacie et du Médicament",
        "",
        "Subject: Marketing Authorization Application — Oxalip-100",
        "             (Oxaliplatin 100mg/20mL)",
        "Application Type: New AMM Submission",
        "Batch Reference: OXAL12-2024-TN",
        "Date: 2026-07-18",
        "",
        "Dear Review Committee,",
        "",
        "We hereby submit the complete eCTD dossier for Oxalip-100",
        "(Oxaliplatin 100mg/20mL, solution for IV infusion) for review",
        "under the Tunisian AMM regulatory pathway.",
        "",
        "All modules (1 through 5) are enclosed in compliance with",
        "JORT Decree No. 2023-072.",
        "",
        "Respectfully,",
        "Sarah M.",
        "Regulatory Affairs Lead",
    ]
    y = 750
    for line in lines:
        c.drawString(50, y, line)
        y -= 18
    c.save()


def create_safety_log(path):
    c = canvas.Canvas(path, pagesize=A4)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 780, "MODULE 5.3 — PATIENT SAFETY LISTING")
    c.setFont("Helvetica", 11)
    
    lines = [
        "",
        "Study: OXA-TN-2024-001",
        "Batch: OXAL12-2024-TN-CORRECTED",
        "",
    ]
    y = 750
    for line in lines:
        c.drawString(50, y, line)
        y -= 18
    
    # Table header
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "ADVERSE EVENTS TABLE")
    y -= 22
    c.line(50, y, 400, y)
    y -= 18
    c.drawString(50, y, "Event")
    c.drawString(250, y, "Count")
    c.drawString(350, y, "Total")
    y -= 4
    c.line(50, y, 400, y)
    y -= 18
    
    # Table rows
    c.setFont("Helvetica", 11)
    rows = [
        ("Nausea", "12", "150"),
        ("Fatigue", "8", "150"),
        ("Dizziness", "1", "150"),
        ("Injection Site Pain", "3", "150"),
    ]
    for event, count, total in rows:
        c.drawString(50, y, event)
        c.drawString(265, y, count)
        c.drawString(360, y, total)
        y -= 18
    
    c.line(50, y, 400, y)
    y -= 26
    
    c.setFont("Helvetica", 10)
    notes = [
        "Investigator Notes:",
        "All adverse events were Grade 1-2 severity.",
        "No treatment discontinuations were attributed to adverse events.",
        "The dizziness event resolved spontaneously within 24 hours",
        "without intervention.",
    ]
    for note in notes:
        c.drawString(50, y, note)
        y -= 16
    
    c.save()


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), 'mock_data')
    os.makedirs(out, exist_ok=True)
    create_cover_letter(os.path.join(out, 'oxalip-cover-letter.pdf'))
    create_safety_log(os.path.join(out, 'oxalip-safety-log.pdf'))
    print("Mock PDFs generated successfully.")
