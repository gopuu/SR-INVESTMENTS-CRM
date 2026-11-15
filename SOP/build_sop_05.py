import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def format_table(table, col_widths=None):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(table.rows):
        for j, cell in enumerate(row.cells):
            tcPr = cell._tc.get_or_add_tcPr()
            tcMar = OxmlElement('w:tcMar')
            for m in ['top', 'bottom']:
                node = OxmlElement(f'w:{m}')
                node.set(qn('w:w'), '120')
                node.set(qn('w:type'), 'dxa')
                tcMar.append(node)
            for m in ['left', 'right']:
                node = OxmlElement(f'w:{m}')
                node.set(qn('w:w'), '160')
                node.set(qn('w:type'), 'dxa')
                tcMar.append(node)
            tcPr.append(tcMar)
            
            if i == 0:
                set_cell_background(cell, "1E40AF") # Royal Blue Header
                for p in cell.paragraphs:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    for run in p.runs:
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(255, 255, 255)
                        run.font.size = Pt(9.5)
            else:
                if i % 2 == 1:
                    set_cell_background(cell, "F8FAFC")
                else:
                    set_cell_background(cell, "FFFFFF")
                for p in cell.paragraphs:
                    for run in p.runs:
                        run.font.size = Pt(9)
            if col_widths and j < len(col_widths):
                cell.width = col_widths[j]

def add_header_banner(doc, title, subtitle):
    section = doc.sections[0]
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run(title)
    run_title.font.size = Pt(19)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(12)
    run_sub = p_sub.add_run(subtitle)
    run_sub.font.size = Pt(10)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(100, 116, 139)

    table = doc.add_table(rows=2, cols=4)
    format_table(table, [Inches(1.6), Inches(2.2), Inches(1.4), Inches(1.6)])
    table.rows[0].cells[0].paragraphs[0].text = "Document Code:"
    table.rows[0].cells[1].paragraphs[0].text = "SOP-GAS-005"
    table.rows[0].cells[2].paragraphs[0].text = "Version / Status:"
    table.rows[0].cells[3].paragraphs[0].text = "v2.0 (Active Live)"

    table.rows[1].cells[0].paragraphs[0].text = "Target GAS Project:"
    table.rows[1].cells[1].paragraphs[0].text = "Central_SaaS_SR_CRM_Backend"
    table.rows[1].cells[2].paragraphs[0].text = "Tool Engine:"
    table.rows[1].cells[3].paragraphs[0].text = "@google/clasp"

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def build_sop_05():
    doc = Document()
    add_header_banner(doc, 
                      "SOP 05: Local Code to Google Apps Script (GAS) Sync", 
                      "Standard Operating Procedure for automated bi-directional synchronization (Push & Pull) between local VS Code environment and Google Apps Script without manual copy-pasting.")

    # Section 1
    doc.add_heading("1. Purpose & Operational Scope", level=1)
    doc.add_paragraph(
        "This Standard Operating Procedure (SOP) defines the automated CI/CD procedure to synchronize local code in the apps-script/ "
        "directory directly with the Google Apps Script cloud engine using Google's official @google/clasp (Command Line Apps Script Projects) tool. "
        "Manual copy-pasting into the browser editor is eliminated, ensuring zero syntax errors and maintaining full Git version integrity."
    )

    # Section 2
    doc.add_heading("2. Target Project Configuration", level=1)
    table_cfg = doc.add_table(rows=5, cols=2)
    format_table(table_cfg, [Inches(2.4), Inches(4.4)])
    table_cfg.rows[0].cells[0].paragraphs[0].text = "Configuration Parameter"
    table_cfg.rows[0].cells[1].paragraphs[0].text = "Active Environment Value"
    
    cfg_data = [
        ("GAS Project Name", "Central_SaaS_SR_CRM_Backend"),
        ("Script ID (Active)", "1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39"),
        ("Apps Script URL", "https://script.google.com/u/1/home/projects/1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39/edit"),
        ("Local Root Directory", "G:\\CODE\\SR-Investments-Website\\sr-investments-crm-v1\\sr-investments-crm")
    ]
    for idx, (param, val) in enumerate(cfg_data):
        table_cfg.rows[idx+1].cells[0].paragraphs[0].text = param
        table_cfg.rows[idx+1].cells[1].paragraphs[0].text = val

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Section 3: Step-by-Step Operating Instructions
    doc.add_heading("3. Step-by-Step Operating Instructions", level=1)

    steps = [
        ("Step 1: One-Time Google Account Permission (30 Seconds)",
         "Google Cloud security requires developer API access enabled once per Google user account:\n"
         "1. Open your web browser and navigate to: https://script.google.com/home/usersettings\n"
         "2. Locate the setting row labeled 'Google Apps Script API'.\n"
         "3. Toggle the switch to ON.\n"
         "   (If it is already ON, you may proceed directly to Step 2)."),

        ("Step 2: One-Time Terminal Authentication ('login:gas')",
         "In your project root terminal, execute:\n"
         "   npm run login:gas\n"
         "   (or run: npx clasp login)\n\n"
         "Execution flow:\n"
         "• A Google authentication window opens in your browser.\n"
         "• Sign in with your deployment Google account (e.g. kgopal8306@gmail.com).\n"
         "• Click 'Allow' to grant clasp permissions to sync with Apps Script.\n"
         "• The terminal displays: 'Logged in! You may now close this browser window.'\n"
         "• An OAuth token is securely saved in your home profile at ~/.clasprc.json."),

        ("Step 3: Pushing Local Code to Google Apps Script ('push:gas')",
         "Whenever code changes are made to local files in apps-script/:\n"
         "   npm run push:gas\n"
         "   (or run: npx clasp push)\n\n"
         "What happens automatically:\n"
         "• Clasp reads .clasp.json and maps to Script ID: 1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39\n"
         "• All 5 code files (Code.gs, Common_Code.gs, Customer_Code.gs, Employee_Code.gs, Login_Code.gs), Bridge.html, and appsscript.json are uploaded.\n"
         "• Terminal confirms: 'Pushed 7 files.' in under 2 seconds.\n"
         "• Code is live immediately in Google Apps Script editor."),

        ("Step 4: Post-Push Deployment — Do You Need a New Version?",
         "YES, for production Web Apps! While pushing updates the editor code (@HEAD), public Web App URLs (.../exec) execute the code locked to the Deployment Version.\n\n"
         "CRITICAL RULE: Always update your EXISTING deployment with 'New version'. This keeps your Web App URL EXACTLY THE SAME, requiring zero changes in frontend configuration:\n\n"
         "• Browser 3-Click Method (Recommended):\n"
         "  1. In Apps Script, click Deploy > Manage deployments.\n"
         "  2. Click the ✏️ Edit (pencil icon) on your active deployment (e.g. 'SR-CRM v1').\n"
         "  3. Change Version dropdown to 'New version'.\n"
         "  4. Click Deploy. Done!\n\n"
         "• CLI Automated Method:\n"
         "  Run: npm run deploy:gas (or: npx clasp deploy --description 'Update v...')"),

        ("Step 5: Pulling Remote Cloud Edits to Local ('pull:gas')",
         "If emergency edits or comments were added directly in the Google web editor:\n"
         "   npm run pull:gas\n"
         "   (or run: npx clasp pull)\n\n"
         "What happens:\n"
         "• Downloads all latest cloud scripts into your local apps-script/ folder.\n"
         "• Ensures your local Git repository stays 100% in sync with cloud changes.")
    ]

    for title, desc in steps:
        p_step = doc.add_paragraph()
        r_step = p_step.add_run(title)
        r_step.bold = True
        r_step.font.color.rgb = RGBColor(30, 64, 175)
        p_desc = doc.add_paragraph(desc)
        p_desc.paragraph_format.left_indent = Inches(0.2)
        p_desc.paragraph_format.space_after = Pt(8)

    # Section 4: Command Reference Table
    doc.add_heading("4. Developer Command Reference", level=1)
    table_cmd = doc.add_table(rows=6, cols=3)
    format_table(table_cmd, [Inches(1.8), Inches(1.8), Inches(3.2)])
    table_cmd.rows[0].cells[0].paragraphs[0].text = "NPM Script"
    table_cmd.rows[0].cells[1].paragraphs[0].text = "Clasp Native"
    table_cmd.rows[0].cells[2].paragraphs[0].text = "Operation Description"

    cmds = [
        ("npm run push:gas", "npx clasp push", "Uploads all local .gs and manifest files to GAS"),
        ("npm run pull:gas", "npx clasp pull", "Downloads remote cloud files to local apps-script/"),
        ("npm run login:gas", "npx clasp login", "Performs OAuth2 browser authentication with Google"),
        ("—", "npx clasp status", "Compares local vs remote file statuses"),
        ("—", "npx clasp open", "Opens active GAS web editor in default browser")
    ]
    for idx, (npm_c, clasp_c, desc) in enumerate(cmds):
        table_cmd.rows[idx+1].cells[0].paragraphs[0].text = npm_c
        table_cmd.rows[idx+1].cells[1].paragraphs[0].text = clasp_c
        table_cmd.rows[idx+1].cells[2].paragraphs[0].text = desc

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Section 5: Troubleshooting Guide
    doc.add_heading("5. Troubleshooting & Best Practices", level=1)
    table_err = doc.add_table(rows=4, cols=3)
    format_table(table_err, [Inches(2.2), Inches(2.2), Inches(2.4)])
    table_err.rows[0].cells[0].paragraphs[0].text = "Symptom / Error Message"
    table_err.rows[0].cells[1].paragraphs[0].text = "Root Cause"
    table_err.rows[0].cells[2].paragraphs[0].text = "Standard Resolution"

    errs = [
        ("User has not enabled the Apps Script API", "Google API access switch is OFF", "Open https://script.google.com/home/usersettings and toggle switch to ON."),
        ("Could not find file .clasprc.json", "Session expired or not logged in", "Run 'npm run login:gas' in terminal and complete browser authorization."),
        ("Manifest file mismatch", "appsscript.json missing or corrupted", "Ensure apps-script/appsscript.json exists with valid timeZone and oauthScopes.")
    ]
    for idx, (symp, cause, res) in enumerate(errs):
        table_err.rows[idx+1].cells[0].paragraphs[0].text = symp
        table_err.rows[idx+1].cells[1].paragraphs[0].text = cause
        table_err.rows[idx+1].cells[2].paragraphs[0].text = res

    # Save DOCX
    out_path = os.path.join(OUTPUT_DIR, "05_SOP_Local_To_GAS_Push_And_Pull.docx")
    doc.save(out_path)
    print(f"Successfully generated: {out_path}")

if __name__ == "__main__":
    build_sop_05()

