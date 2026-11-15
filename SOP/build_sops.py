import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(OUTPUT_DIR, "images")
os.makedirs(IMG_DIR, exist_ok=True)

# Set common style for matplotlib
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

# ----------------------------------------------------------------------
# 1. GENERATE DIAGRAM IMAGES (PNG)
# ----------------------------------------------------------------------

def generate_system_architecture_diagram():
    fig, ax = plt.subplots(figsize=(13, 8), dpi=300)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 9)
    ax.axis('off')

    # Background canvas
    fig.patch.set_facecolor('#f8fafc')
    ax.set_facecolor('#f8fafc')

    # Title
    ax.text(6.5, 8.5, "SR Investments SaaS CRM — Centralized Multi-Tenant Architecture", 
            ha='center', va='center', fontsize=15, fontweight='bold', color='#0f172a')

    # Layers
    # Layer 1: Client Frontends
    rect1 = patches.FancyBboxPatch((0.5, 6.2), 12, 1.6, boxstyle="round,pad=0.2", 
                                   facecolor='#eff6ff', edgecolor='#3b82f6', linewidth=2)
    ax.add_patch(rect1)
    ax.text(0.8, 7.5, "PRESENTATION LAYER (Single React + Vite SPA)", fontsize=11, fontweight='bold', color='#1e40af')
    
    # Sub-boxes in Layer 1
    ax.add_patch(patches.FancyBboxPatch((1.2, 6.4), 3.2, 0.9, boxstyle="round,pad=0.1", facecolor='#ffffff', edgecolor='#93c5fd'))
    ax.text(2.8, 6.85, "Founder / SuperAdmin\n(Tenant Master Portal)", ha='center', va='center', fontsize=9, fontweight='bold', color='#0f172a')
    
    ax.add_patch(patches.FancyBboxPatch((4.9, 6.4), 3.2, 0.9, boxstyle="round,pad=0.1", facecolor='#ffffff', edgecolor='#93c5fd'))
    ax.text(6.5, 6.85, "Client Admins\n(Company Dashboard)", ha='center', va='center', fontsize=9, fontweight='bold', color='#0f172a')

    ax.add_patch(patches.FancyBboxPatch((8.6, 6.4), 3.2, 0.9, boxstyle="round,pad=0.1", facecolor='#ffffff', edgecolor='#93c5fd'))
    ax.text(10.2, 6.85, "Advisors & Staff\n(Customers, KYC, SIP)", ha='center', va='center', fontsize=9, fontweight='bold', color='#0f172a')

    # Arrows down
    ax.annotate('', xy=(6.5, 5.3), xytext=(6.5, 6.1),
                arrowprops=dict(arrowstyle="->", color="#1e40af", lw=2.5))
    ax.text(7.2, 5.7, "JSON API & Google OAuth GIS", fontsize=9, color="#1e40af", fontweight='bold')

    # Layer 2: Central Backend & Security
    rect2 = patches.FancyBboxPatch((0.5, 3.8), 12, 1.4, boxstyle="round,pad=0.2", 
                                   facecolor='#f0fdf4', edgecolor='#10b981', linewidth=2)
    ax.add_patch(rect2)
    ax.text(0.8, 4.85, "CENTRAL BACKEND ENGINE (Google Apps Script Web App API)", fontsize=11, fontweight='bold', color='#065f46')

    ax.add_patch(patches.FancyBboxPatch((1.2, 4.0), 3.2, 0.75, boxstyle="round,pad=0.1", facecolor='#ffffff', edgecolor='#a7f3d0'))
    ax.text(2.8, 4.38, "OAuth & SHA-256 Auth\nRole Rights Verification", ha='center', va='center', fontsize=8.5, color='#065f46')

    ax.add_patch(patches.FancyBboxPatch((4.9, 4.0), 3.2, 0.75, boxstyle="round,pad=0.1", facecolor='#ffffff', edgecolor='#a7f3d0'))
    ax.text(6.5, 4.38, "Tenant Workspace Resolver\n& Multi-Org Switcher", ha='center', va='center', fontsize=8.5, color='#065f46')

    ax.add_patch(patches.FancyBboxPatch((8.6, 4.0), 3.2, 0.75, boxstyle="round,pad=0.1", facecolor='#ffffff', edgecolor='#a7f3d0'))
    ax.text(10.2, 4.38, "Dynamic Sheet Router\nDrive File Isolation Bridge", ha='center', va='center', fontsize=8.5, color='#065f46')

    # Arrows down to Data layer
    ax.annotate('', xy=(3.5, 2.9), xytext=(4.5, 3.7),
                arrowprops=dict(arrowstyle="->", color="#059669", lw=2))
    ax.annotate('', xy=(9.5, 2.9), xytext=(8.5, 3.7),
                arrowprops=dict(arrowstyle="->", color="#059669", lw=2))

    # Layer 3: Data Layer
    # Central Master DB
    rect3 = patches.FancyBboxPatch((0.5, 0.6), 5.7, 2.2, boxstyle="round,pad=0.2", 
                                   facecolor='#fffbeb', edgecolor='#f59e0b', linewidth=2)
    ax.add_patch(rect3)
    ax.text(0.8, 2.45, "CENTRAL SAAS MASTER DB", fontsize=10.5, fontweight='bold', color='#b45309')
    ax.text(0.8, 2.15, "Spreadsheet: Central_SaaS_Master_DB", fontsize=8.5, fontstyle='italic', color='#78350f')
    
    tabs_master = "• Tenant_Master (Org Profiles, Sheet IDs)\n• User_Master (Auth, SHA-256, SuperAdmin)\n• Tenant_User_Mapping (Multi-org roles)\n• Tenant_Licensing (Renewals, History)\n• User_Documents (Drive IDs, KYC)"
    ax.text(0.8, 1.25, tabs_master, fontsize=8, color='#78350f', linespacing=1.3)

    # Isolated Tenant DBs
    rect4 = patches.FancyBboxPatch((6.8, 0.6), 5.7, 2.2, boxstyle="round,pad=0.2", 
                                   facecolor='#faf5ff', edgecolor='#a855f7', linewidth=2)
    ax.add_patch(rect4)
    ax.text(7.1, 2.45, "ISOLATED CLIENT WORKSPACES (Per Tenant)", fontsize=10.5, fontweight='bold', color='#6b21a8')
    ax.text(7.1, 2.15, "Location: SRInvestmentsCRM/org/<TenantId>/", fontsize=8.5, fontstyle='italic', color='#581c87')
    
    tabs_tenant = "• Client Database Sheet (Cloned from Template)\n  - Customers (Investor KYC, Portfolio, Nominees)\n  - Employees (Staff Directory, Mobile, Passwords)\n  - Masters (Departments, Designations, Roles)\n• Dedicated Google Drive Root Folder\n  - Investor KYC Docs, Uploads, Invoices"
    ax.text(7.1, 1.15, tabs_tenant, fontsize=8, color='#581c87', linespacing=1.3)

    plt.tight_layout()
    path = os.path.join(IMG_DIR, "System_Architecture_Diagram.png")
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    return path

def generate_dfd_level_0():
    fig, ax = plt.subplots(figsize=(11, 7), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(5.5, 6.5, "Data Flow Diagram (DFD) — Level 0 Context Diagram", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a')

    # Central Process
    center_circle = patches.Circle((5.5, 3.5), 1.35, facecolor='#eff6ff', edgecolor='#2563eb', linewidth=2.5)
    ax.add_patch(center_circle)
    ax.text(5.5, 3.65, "0.0\nSR Investments\nSaaS CRM Engine", ha='center', va='center', fontsize=11, fontweight='bold', color='#1e3a8a')
    ax.text(5.5, 2.7, "(GAS + React)", ha='center', va='center', fontsize=8.5, color='#3b82f6')

    # Entities
    # 1. SuperAdmin (Founder) - Top Left
    ax.add_patch(patches.Rectangle((0.6, 4.8), 2.4, 1.1, facecolor='#f8fafc', edgecolor='#0f172a', linewidth=2))
    ax.text(1.8, 5.35, "CRM Founder /\nSuperAdmin", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0f172a')
    # Flow
    ax.annotate('', xy=(4.3, 4.1), xytext=(3.0, 5.1), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    ax.text(2.6, 4.4, "Onboard Clients,\nLicenses, Global Config", fontsize=7.5, color="#1e40af", rotation=25)

    # 2. Client Organization Admin - Top Right
    ax.add_patch(patches.Rectangle((8.0, 4.8), 2.4, 1.1, facecolor='#f8fafc', edgecolor='#0f172a', linewidth=2))
    ax.text(9.2, 5.35, "Tenant Org\nAdmin", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0f172a')
    # Flow
    ax.annotate('', xy=(6.7, 4.1), xytext=(8.0, 5.1), arrowprops=dict(arrowstyle="<-", color="#2563eb", lw=1.5))
    ax.text(7.6, 4.4, "Staff Management,\nClient Reports, Settings", fontsize=7.5, color="#1e40af", rotation=-25)

    # 3. Staff / Investment Advisor - Bottom Left
    ax.add_patch(patches.Rectangle((0.6, 1.2), 2.4, 1.1, facecolor='#f8fafc', edgecolor='#0f172a', linewidth=2))
    ax.text(1.8, 1.75, "Investment\nAdvisor / Staff", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0f172a')
    # Flow
    ax.annotate('', xy=(4.3, 2.9), xytext=(3.0, 1.9), arrowprops=dict(arrowstyle="<->", color="#059669", lw=1.5))
    ax.text(2.5, 2.6, "Customer KYC,\nSIP Portfolio CRUD", fontsize=7.5, color="#065f46", rotation=-25)

    # 4. Investor / Customer - Bottom Right
    ax.add_patch(patches.Rectangle((8.0, 1.2), 2.4, 1.1, facecolor='#f8fafc', edgecolor='#0f172a', linewidth=2))
    ax.text(9.2, 1.75, "Investor /\nClient Lead", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0f172a')
    # Flow
    ax.annotate('', xy=(8.0, 1.9), xytext=(6.7, 2.9), arrowprops=dict(arrowstyle="->", color="#7c3aed", lw=1.5))
    ax.text(7.6, 2.6, "Portfolio Statement,\nDocument Vault", fontsize=7.5, color="#6b21a8", rotation=25)

    plt.tight_layout()
    path = os.path.join(IMG_DIR, "DFD_Level_0_Context_Diagram.png")
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    return path

def generate_dfd_level_1():
    fig, ax = plt.subplots(figsize=(13, 8.5), dpi=300)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 9)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(6.5, 8.5, "Data Flow Diagram (DFD) — Level 1 Process Decomposition", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a')

    # Processes
    # 1.0 Auth & GIS
    ax.add_patch(patches.FancyBboxPatch((0.8, 6.2), 3.2, 1.3, boxstyle="round,pad=0.15", facecolor='#eff6ff', edgecolor='#2563eb', linewidth=1.5))
    ax.text(2.4, 7.0, "1.0 User Authentication", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#1e40af')
    ax.text(2.4, 6.55, "Google Identity (GIS)\nUsername/Mobile + SHA256", ha='center', va='center', fontsize=8, color='#3b82f6')

    # 2.0 Tenant Workspace Selector
    ax.add_patch(patches.FancyBboxPatch((4.9, 6.2), 3.2, 1.3, boxstyle="round,pad=0.15", facecolor='#eff6ff', edgecolor='#2563eb', linewidth=1.5))
    ax.text(6.5, 7.0, "2.0 Workspace Routing", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#1e40af')
    ax.text(6.5, 6.55, "Tenant_User_Mapping Match\nSingle vs Multi-Workspace", ha='center', va='center', fontsize=8, color='#3b82f6')

    # 3.0 Tenant Onboarding & Licensing
    ax.add_patch(patches.FancyBboxPatch((9.0, 6.2), 3.2, 1.3, boxstyle="round,pad=0.15", facecolor='#eff6ff', edgecolor='#2563eb', linewidth=1.5))
    ax.text(10.6, 7.0, "3.0 SaaS Provisioning", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#1e40af')
    ax.text(10.6, 6.55, "Tenant Setup & Licenses\nAudit Trail Logging", ha='center', va='center', fontsize=8, color='#3b82f6')

    # 4.0 Customer & SIP Portfolio
    ax.add_patch(patches.FancyBboxPatch((0.8, 3.6), 3.2, 1.3, boxstyle="round,pad=0.15", facecolor='#f0fdf4', edgecolor='#10b981', linewidth=1.5))
    ax.text(2.4, 4.4, "4.0 Investor Management", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#065f46')
    ax.text(2.4, 3.95, "KYC Details, Nominees,\nSIP Calculator & Quotes", ha='center', va='center', fontsize=8, color='#059669')

    # 5.0 Staff & Access Control
    ax.add_patch(patches.FancyBboxPatch((4.9, 3.6), 3.2, 1.3, boxstyle="round,pad=0.15", facecolor='#f0fdf4', edgecolor='#10b981', linewidth=1.5))
    ax.text(6.5, 4.4, "5.0 Staff & RBAC Engine", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#065f46')
    ax.text(6.5, 3.95, "Role Matrix Permissions,\nAlternate Mobile & Email", ha='center', va='center', fontsize=8, color='#059669')

    # 6.0 Drive Storage & File Vault
    ax.add_patch(patches.FancyBboxPatch((9.0, 3.6), 3.2, 1.3, boxstyle="round,pad=0.15", facecolor='#f0fdf4', edgecolor='#10b981', linewidth=1.5))
    ax.text(10.6, 4.4, "6.0 Drive File Isolation", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#065f46')
    ax.text(10.6, 3.95, "Folder ID Resolution,\nKYC Docs & Photo Vault", ha='center', va='center', fontsize=8, color='#059669')

    # Data Stores (Open-ended rectangles)
    # D1: Central Master DB
    ax.plot([1.0, 5.0], [1.7, 1.7], color='#b45309', lw=2)
    ax.plot([1.0, 5.0], [0.8, 0.8], color='#b45309', lw=2)
    ax.plot([1.0, 1.0], [0.8, 1.7], color='#b45309', lw=2)
    ax.fill_between([1.0, 5.0], [0.8, 0.8], [1.7, 1.7], facecolor='#fffbeb')
    ax.text(1.2, 1.45, "D1", fontsize=9, fontweight='bold', color='#b45309')
    ax.text(3.1, 1.25, "Central_SaaS_Master_DB\n(Tenants, Users, Licenses)", ha='center', va='center', fontsize=8.5, color='#78350f', fontweight='bold')

    # D2: Tenant Isolated DB
    ax.plot([7.5, 11.5], [1.7, 1.7], color='#6b21a8', lw=2)
    ax.plot([7.5, 11.5], [0.8, 0.8], color='#6b21a8', lw=2)
    ax.plot([7.5, 7.5], [0.8, 1.7], color='#6b21a8', lw=2)
    ax.fill_between([7.5, 11.5], [0.8, 0.8], [1.7, 1.7], facecolor='#faf5ff')
    ax.text(7.7, 1.45, "D2", fontsize=9, fontweight='bold', color='#6b21a8')
    ax.text(9.6, 1.25, "Tenant Dedicated Sheets & Drive\n(Customers, Staff, KYC Vault)", ha='center', va='center', fontsize=8.5, color='#581c87', fontweight='bold')

    # Connecting arrows
    ax.annotate('', xy=(4.9, 6.8), xytext=(4.0, 6.8), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    ax.annotate('', xy=(9.0, 6.8), xytext=(8.1, 6.8), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    
    # Process to Data stores
    ax.annotate('', xy=(2.4, 1.7), xytext=(2.4, 6.2), arrowprops=dict(arrowstyle="<->", color="#b45309", lw=1.2, ls="--"))
    ax.annotate('', xy=(6.5, 1.7), xytext=(6.5, 6.2), arrowprops=dict(arrowstyle="<->", color="#b45309", lw=1.2, ls="--"))
    ax.annotate('', xy=(10.6, 1.7), xytext=(10.6, 6.2), arrowprops=dict(arrowstyle="<->", color="#b45309", lw=1.2, ls="--"))

    ax.annotate('', xy=(2.4, 1.7), xytext=(2.4, 3.6), arrowprops=dict(arrowstyle="<->", color="#6b21a8", lw=1.2))
    ax.annotate('', xy=(6.5, 1.7), xytext=(6.5, 3.6), arrowprops=dict(arrowstyle="<->", color="#6b21a8", lw=1.2))
    ax.annotate('', xy=(9.6, 1.7), xytext=(10.6, 3.6), arrowprops=dict(arrowstyle="<->", color="#6b21a8", lw=1.2))

    plt.tight_layout()
    path = os.path.join(IMG_DIR, "DFD_Level_1_Process_Flow.png")
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    return path

def generate_er_diagram():
    fig, ax = plt.subplots(figsize=(14, 9), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 9)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(7.0, 8.6, "Entity-Relationship (ER) Diagram — Multi-Tenant SaaS Schema", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a')

    # Entity 1: TENANT_MASTER
    ax.add_patch(patches.FancyBboxPatch((0.5, 4.8), 3.8, 3.2, boxstyle="round,pad=0.1", facecolor='#f8fafc', edgecolor='#2563eb', linewidth=2))
    ax.add_patch(patches.Rectangle((0.5, 7.3), 3.8, 0.7, facecolor='#2563eb'))
    ax.text(2.4, 7.65, "TENANT_MASTER", ha='center', va='center', fontsize=10, fontweight='bold', color='#ffffff')
    t_fields = [
        "PK  TenantId : VARCHAR(20)",
        "    CompanyName : VARCHAR(100)",
        "    ArnNumber : VARCHAR(50)",
        "    SpreadsheetId : VARCHAR(100)",
        "    DriveRootFolderId : VARCHAR(100)",
        "    SupportEmail : VARCHAR(100)",
        "    ContactPhone : VARCHAR(20)",
        "    Status : Active | Inactive",
        "    + 7 Audit Fields (IsDeleted...)"
    ]
    ax.text(0.7, 5.9, "\n".join(t_fields), fontsize=7.5, color='#1e293b', linespacing=1.35)

    # Entity 2: USER_MASTER
    ax.add_patch(patches.FancyBboxPatch((9.7, 4.8), 3.8, 3.2, boxstyle="round,pad=0.1", facecolor='#f8fafc', edgecolor='#059669', linewidth=2))
    ax.add_patch(patches.Rectangle((9.7, 7.3), 3.8, 0.7, facecolor='#059669'))
    ax.text(11.6, 7.65, "USER_MASTER", ha='center', va='center', fontsize=10, fontweight='bold', color='#ffffff')
    u_fields = [
        "PK  UserId : VARCHAR(20)",
        "    Email : VARCHAR(100) [UNIQUE]",
        "    GoogleEmails : TEXT (CSV)",
        "    Password : VARCHAR(64) [SHA256]",
        "    FullName : VARCHAR(100)",
        "    Mobile : VARCHAR(20) [UNIQUE]",
        "    AlternateMobile : TEXT (CSV)",
        "    IsSuperAdmin : BOOLEAN",
        "    + 7 Audit Fields (IsDeleted...)"
    ]
    ax.text(9.9, 5.9, "\n".join(u_fields), fontsize=7.5, color='#1e293b', linespacing=1.35)

    # Entity 3: TENANT_USER_MAPPING (Bridge table in the middle)
    ax.add_patch(patches.FancyBboxPatch((5.1, 5.2), 3.8, 2.5, boxstyle="round,pad=0.1", facecolor='#f8fafc', edgecolor='#7c3aed', linewidth=2))
    ax.add_patch(patches.Rectangle((5.1, 7.0), 3.8, 0.7, facecolor='#7c3aed'))
    ax.text(7.0, 7.35, "TENANT_USER_MAPPING", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#ffffff')
    m_fields = [
        "PK  MappingId : VARCHAR(20)",
        "FK  UserId : VARCHAR(20)",
        "FK  TenantId : VARCHAR(20)",
        "    Role : Admin | Staff | Advisor",
        "    Status : Active | Inactive",
        "    + 7 Audit Fields (IsDeleted...)"
    ]
    ax.text(5.3, 6.0, "\n".join(m_fields), fontsize=7.5, color='#1e293b', linespacing=1.35)

    # Entity 4: TENANT_LICENSING
    ax.add_patch(patches.FancyBboxPatch((0.5, 0.8), 3.8, 2.8, boxstyle="round,pad=0.1", facecolor='#f8fafc', edgecolor='#f59e0b', linewidth=2))
    ax.add_patch(patches.Rectangle((0.5, 2.9), 3.8, 0.7, facecolor='#f59e0b'))
    ax.text(2.4, 3.25, "TENANT_LICENSING", ha='center', va='center', fontsize=10, fontweight='bold', color='#ffffff')
    lic_fields = [
        "PK  Id : VARCHAR(20)",
        "FK  TenantId : VARCHAR(20)",
        "    LicenseType : Starter | Pro | Ent",
        "    StartDate : DATE",
        "    EndDate : DATE",
        "    Amount : NUMERIC(10,2)",
        "    IsActive : BOOLEAN",
        "    Status : Active | Renewed | Inact",
        "    + 7 Audit Fields (IsDeleted...)"
    ]
    ax.text(0.7, 1.8, "\n".join(lic_fields), fontsize=7.5, color='#1e293b', linespacing=1.35)

    # Entity 5: CUSTOMERS (Per-tenant DB)
    ax.add_patch(patches.FancyBboxPatch((5.1, 0.8), 3.8, 2.8, boxstyle="round,pad=0.1", facecolor='#f8fafc', edgecolor='#0284c7', linewidth=2))
    ax.add_patch(patches.Rectangle((5.1, 2.9), 3.8, 0.7, facecolor='#0284c7'))
    ax.text(7.0, 3.25, "CUSTOMERS (Client DB)", ha='center', va='center', fontsize=10, fontweight='bold', color='#ffffff')
    c_fields = [
        "PK  CustomerId : VARCHAR(20)",
        "    CustomerCode : VARCHAR(20)",
        "    FullName : VARCHAR(100)",
        "    Email : VARCHAR(100)",
        "    Mobile : VARCHAR(20)",
        "    PanNumber : VARCHAR(10)",
        "    KycStatus : Compliant | Pending",
        "    + Nominee, Bank, 7 Audit Fields"
    ]
    ax.text(5.3, 1.8, "\n".join(c_fields), fontsize=7.5, color='#1e293b', linespacing=1.35)

    # Entity 6: EMPLOYEES / STAFF (Per-tenant DB)
    ax.add_patch(patches.FancyBboxPatch((9.7, 0.8), 3.8, 2.8, boxstyle="round,pad=0.1", facecolor='#f8fafc', edgecolor='#ea580c', linewidth=2))
    ax.add_patch(patches.Rectangle((9.7, 2.9), 3.8, 0.7, facecolor='#ea580c'))
    ax.text(11.6, 3.25, "EMPLOYEES (Client DB)", ha='center', va='center', fontsize=10, fontweight='bold', color='#ffffff')
    e_fields = [
        "PK  EmployeeId : VARCHAR(20)",
        "    EmployeeCode : VARCHAR(20)",
        "    FullName : VARCHAR(100)",
        "    Email : VARCHAR(100)",
        "    Mobile : VARCHAR(20)",
        "    AlternateMobile : TEXT (CSV)",
        "    Password : VARCHAR(64) [SHA256]",
        "    + Dept, Desig, Role, 7 Audit"
    ]
    ax.text(9.9, 1.8, "\n".join(e_fields), fontsize=7.5, color='#1e293b', linespacing=1.35)

    # Relationship connectors
    # 1. TENANT_MASTER to TENANT_USER_MAPPING (1 : N)
    ax.annotate('', xy=(5.1, 6.45), xytext=(4.3, 6.45),
                arrowprops=dict(arrowstyle="-|>", color="#1e40af", lw=2))
    ax.text(4.4, 6.6, "1 : N", fontsize=8, fontweight='bold', color="#1e40af")

    # 2. USER_MASTER to TENANT_USER_MAPPING (1 : N)
    ax.annotate('', xy=(8.9, 6.45), xytext=(9.7, 6.45),
                arrowprops=dict(arrowstyle="-|>", color="#047857", lw=2))
    ax.text(9.1, 6.6, "N : 1", fontsize=8, fontweight='bold', color="#047857")

    # 3. TENANT_MASTER to TENANT_LICENSING (1 : N)
    ax.annotate('', xy=(2.4, 3.6), xytext=(2.4, 4.8),
                arrowprops=dict(arrowstyle="-|>", color="#d97706", lw=2))
    ax.text(2.55, 4.2, "1 : N (Licenses)", fontsize=8, fontweight='bold', color="#d97706")

    # 4. TENANT_MASTER to CUSTOMERS & EMPLOYEES (Logical isolation)
    ax.annotate('', xy=(6.5, 3.6), xytext=(3.5, 4.8),
                arrowprops=dict(arrowstyle="->", color="#0284c7", lw=1.5, ls="--"))
    ax.text(4.5, 4.0, "Isolated Database", fontsize=7.5, color="#0284c7")

    plt.tight_layout()
    path = os.path.join(IMG_DIR, "ER_Diagram_Multi_Tenant_SaaS.png")
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    return path

# ----------------------------------------------------------------------
# 2. HELPER FUNCTIONS FOR STYLING DOCX
# ----------------------------------------------------------------------

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
                        run.font.color.rgb = RGBColor(30, 41, 59)
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
    p_title.paragraph_format.space_after = Pt(2)
    run_org = p_title.add_run("SR INVESTMENTS CRM PLATFORM — STANDARD OPERATING PROCEDURE\n")
    run_org.font.size = Pt(8.5)
    run_org.font.bold = True
    run_org.font.color.rgb = RGBColor(37, 99, 235) # Royal Blue

    run_title = p_title.add_run(title)
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    run_sub = p_sub.add_run(subtitle)
    run_sub.font.size = Pt(10.5)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(100, 116, 139)

    # Metadata Table
    table = doc.add_table(rows=2, cols=4)
    format_table(table, [Inches(1.6), Inches(1.8), Inches(1.6), Inches(1.8)])
    table.rows[0].cells[0].paragraphs[0].text = "Document ID:"
    table.rows[0].cells[1].paragraphs[0].text = "SOP-CRM-SAAS-01"
    table.rows[0].cells[2].paragraphs[0].text = "Version / Status:"
    table.rows[0].cells[3].paragraphs[0].text = "v2.5 (Production Live)"

    table.rows[1].cells[0].paragraphs[0].text = "Target Audience:"
    table.rows[1].cells[1].paragraphs[0].text = "Founder / Platform Admin"
    table.rows[1].cells[2].paragraphs[0].text = "Security Level:"
    table.rows[1].cells[3].paragraphs[0].text = "Confidential / Founder Only"

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

# ----------------------------------------------------------------------
# 3. BUILD DOCX DOCUMENTS
# ----------------------------------------------------------------------

def build_docx_01_client_setup():
    doc = Document()
    add_header_banner(doc, 
                      "SOP 01: New Client Setup & Tenant Onboarding", 
                      "Comprehensive step-by-step procedure for onboarding client organizations, isolating Google Drive storage, provisioning dedicated Sheets, and assigning administrator access.")

    # Section 1: Overview & Prerequisites
    h1 = doc.add_heading("1. Purpose & Operational Scope", level=1)
    doc.add_paragraph(
        "This Standard Operating Procedure (SOP) defines the operational workflow to provision a completely isolated multi-tenant organization in the SR Investments Centralized SaaS CRM platform. "
        "Each onboarded client receives logically isolated Google Sheets databases, dedicated Google Drive storage directories for investor KYC and financial documents, an initial subscription license, and administrator credentials."
    )

    doc.add_heading("2. Prerequisites & Asset Checklist", level=1)
    p = doc.add_paragraph()
    p.add_run("Before beginning client onboarding, ensure the following prerequisites are met:\n").font.bold = True
    items = [
        ("SuperAdmin Access: ", "The operator must be logged in as a verified SuperAdmin (UserId: USER1, or designated IsSuperAdmin = TRUE in Central_SaaS_Master_DB)."),
        ("Google Drive Master Access: ", "Full Edit / Owner permissions on root folder: My Drive > SRInvestmentsCRM."),
        ("Client Details Collected: ", "Company Name, ARN Number, EUIN, Primary Support Email, Phone Number, Physical Office Address."),
        ("Subscription Agreement: ", "Selected License Tier (Starter, Professional, or Enterprise), Billing Duration (3, 6, 12, or 24 months), and Subscription Amount.")
    ]
    for title, desc in items:
        p_item = doc.add_paragraph(style='List Bullet')
        r_title = p_item.add_run(title)
        r_title.bold = True
        p_item.add_run(desc)

    # Section 3: Step-by-Step Procedure
    doc.add_heading("3. Step-by-Step Provisioning Procedure", level=1)

    steps = [
        ("Step 1: Create Dedicated Client Folder in Google Drive", 
         "1. Open Google Drive and navigate to: My Drive > SRInvestmentsCRM > org.\n"
         "2. Click '+ New > New folder' and name it after the client organization (e.g., 'ABC_Investments' or 'Client_TEN002').\n"
         "3. Open the newly created folder in your web browser.\n"
         "4. Extract the Folder ID from the browser URL bar:\n"
         "   https://drive.google.com/drive/folders/1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy\n"
         "   Copy the ID (e.g., '1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy'). This is your DriveRootFolderId."),

        ("Step 2: Clone Database Template for the Client",
         "1. Navigate back to the root folder: My Drive > SRInvestmentsCRM.\n"
         "2. Right-click the master template spreadsheet: '_CRM_DATABASE_TEMPLATE'.\n"
         "3. Select 'Make a copy'. Google Drive will create 'Copy of _CRM_DATABASE_TEMPLATE'.\n"
         "4. Move the copied file inside the client's dedicated folder created in Step 1 (org/ABC_Investments).\n"
         "5. Rename the file to standard format: '<ClientName>_CRM_DB' (e.g., 'ABC_Investments_CRM_DB').\n"
         "6. Open the newly copied sheet and copy its Spreadsheet ID from the browser URL:\n"
         "   https://docs.google.com/spreadsheets/d/1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM/edit\n"
         "   Copy the ID between /d/ and /edit (e.g., '1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM'). This is your SpreadsheetId."),

        ("Step 3: Register Tenant in CRM SuperAdmin Portal",
         "1. Log in to the CRM frontend at http://localhost:5173 (or production domain).\n"
         "2. In the left navigation sidebar, click 'Tenant Master (SaaS)'.\n"
         "3. Click the blue '+ Onboard New Client' button in the top-right toolbar.\n"
         "4. Complete the tenant registration modal form:\n"
         "   • Organization Name: Legal trade name (e.g., 'ABC Investments Pvt Ltd')\n"
         "   • Tenant ID (Code): Leave blank for auto-generation (TEN002) or enter custom code\n"
         "   • AMFI / ARN Number: Official mutual fund distribution code (e.g., 'ARN-192841')\n"
         "   • Dedicated Spreadsheet ID: Paste the Spreadsheet ID copied from Step 2\n"
         "   • Drive Root Folder ID: Paste the Folder ID copied from Step 1\n"
         "   • Support Email & Contact Phone: Official business communications contact\n"
         "   • Initial License Tier: Starter / Professional / Enterprise\n"
         "   • Subscription Period: 12 Months (or selected tenure)\n"
         "   • Subscription Amount: ₹60,000 (or agreed commercial rate)\n"
         "5. Click 'Onboard Client'. The system automatically creates audit-compliant records in both 'Tenant_Master' and 'Tenant_Licensing'."),

        ("Step 4: Provision Client Administrator & Initial Staff",
         "1. Once the tenant is registered, open Central_SaaS_Master_DB in Google Sheets (or navigate to Staff in CRM).\n"
         "2. In tab 'User_Master', verify or add the client administrator's primary email, full name, mobile number, and SHA-256 password.\n"
         "3. In tab 'Tenant_User_Mapping', create a row mapping the UserId to the new TenantId:\n"
         "   • MappingId: MAP_<timestamp>\n"
         "   • UserId: <UserId or Admin Email>\n"
         "   • TenantId: <TEN002>\n"
         "   • Role: Admin\n"
         "   • Status: Active\n"
         "   • Audit Fields: IsDeleted=FALSE, Created_By=<SuperAdminEmail>, Created_At=<ISO Timestamp>\n"
         "4. When this user logs in with their Google Account or password, the system immediately recognizes their workspace.")
    ]

    for title, body in steps:
        h2 = doc.add_heading(title, level=2)
        doc.add_paragraph(body)

    # Verification Table
    doc.add_heading("4. Post-Onboarding Verification Checklist", level=1)
    table = doc.add_table(rows=6, cols=3)
    format_table(table, [Inches(1.2), Inches(3.2), Inches(2.5)])
    table.rows[0].cells[0].paragraphs[0].text = "Check #"
    table.rows[0].cells[1].paragraphs[0].text = "Verification Step"
    table.rows[0].cells[2].paragraphs[0].text = "Expected Result"

    v_data = [
        ("CHK-01", "Tenant_Master Row Created", "New row with TenantId, CompanyName, SpreadsheetId, IsDeleted=FALSE."),
        ("CHK-02", "Tenant_Licensing Row Created", "New license row with StartDate, EndDate, IsActive=TRUE, Status=Active."),
        ("CHK-03", "Client Database Access", "Copied sheet contains Customers, Employees, Masters schema tabs intact."),
        ("CHK-04", "Drive Folder Isolation", "Client upload files route only to client's Drive folder ID, not root."),
        ("CHK-05", "Admin Login & Workspace Route", "Client Admin logs in and opens client workspace without seeing other tenants.")
    ]
    for idx, (cid, step, res) in enumerate(v_data):
        row = table.rows[idx + 1]
        row.cells[0].paragraphs[0].text = cid
        row.cells[1].paragraphs[0].text = step
        row.cells[2].paragraphs[0].text = res

    doc_path = os.path.join(OUTPUT_DIR, "01_SOP_New_Client_Setup.docx")
    doc.save(doc_path)
    return doc_path

def build_docx_02_license_renewal():
    doc = Document()
    add_header_banner(doc, 
                      "SOP 02: Tenant License Renewal & Subscription Management", 
                      "Operational protocol for managing client SaaS licensing lifecycles, processing renewals, tracking subscription payment histories, and handling expiration grace periods.")

    doc.add_heading("1. Policy & Subscription Governance", level=1)
    doc.add_paragraph(
        "The SR Investments CRM platform operates on a central subscription licensing framework. Every client organization (Tenant) is governed by an active license record in the central 'Tenant_Licensing' registry. "
        "Licensing status governs client access privileges. When a tenant's license expires or becomes inactive, non-superadmin workspace users are restricted until renewal is completed."
    )

    doc.add_heading("2. License Types & Commercial Terms", level=1)
    table = doc.add_table(rows=4, cols=4)
    format_table(table, [Inches(1.4), Inches(1.8), Inches(1.8), Inches(1.9)])
    table.rows[0].cells[0].paragraphs[0].text = "Tier"
    table.rows[0].cells[1].paragraphs[0].text = "Default Validity"
    table.rows[0].cells[2].paragraphs[0].text = "Standard Fee"
    table.rows[0].cells[3].paragraphs[0].text = "Entitlements"

    tiers = [
        ("Starter", "12 Months", "₹25,000 / year", "Up to 3 Staff, 1,000 Customers, Core Mutual Fund CRM"),
        ("Professional", "12 Months", "₹60,000 / year", "Up to 15 Staff, 10,000 Customers, Automated SIP Tracker, Custom Reports"),
        ("Enterprise", "12 / 24 Months", "₹1,20,000 / year", "Unlimited Staff & Customers, Dedicated Drive Vault, Priority SLA")
    ]
    for idx, (t, val, fee, ent) in enumerate(tiers):
        row = table.rows[idx + 1]
        row.cells[0].paragraphs[0].text = t
        row.cells[1].paragraphs[0].text = val
        row.cells[2].paragraphs[0].text = fee
        row.cells[3].paragraphs[0].text = ent

    doc.add_heading("3. Step-by-Step License Renewal Workflow", level=1)
    steps = [
        ("Step 1: Access Tenant Licensing Controls",
         "1. Log into the CRM as SuperAdmin.\n"
         "2. In the sidebar, select 'Tenant Master (SaaS)'.\n"
         "3. Locate the target client organization in the Client Organizations Directory.\n"
         "4. In the client row, click the 'Licenses' button (Credit Card icon) in the Actions column."),

        ("Step 2: Review Subscription History",
         "1. The 'Subscription & License History' drawer opens displaying all past licenses for this organization.\n"
         "2. Review previous Start Dates, End Dates, Invoiced Amounts, and current status (Active, Renewed, or Expired).\n"
         "3. Check for any outstanding renewal invoices or client payment confirmations."),

        ("Step 3: Process Renewal Record",
         "1. In the 'Add License / Renewal' form at the top of the modal:\n"
         "   • License Type: Confirm or upgrade tier (Starter / Professional / Enterprise).\n"
         "   • Start Date: Select the renewal effective date (defaults to current date or day following prior license expiry).\n"
         "   • End Date: Calculated automatically based on period (e.g., +365 days for 1 year).\n"
         "   • Subscription Fee (₹): Enter commercial payment amount received.\n"
         "   • Initial Status: Active.\n"
         "   • Operational Notes: Reference payment transaction ID, NEFT/UPI reference, or contract agreement number.\n"
         "2. Click 'Save & Activate Renewal'."),

        ("Step 4: System Automatic Transition & Audit Logging",
         "1. Upon saving, the backend automatically transitions any prior 'Active' license records for this tenant to 'Renewed'.\n"
         "2. The new license record is stamped with:\n"
         "   - Id: LIC_<timestamp>\n"
         "   - TenantId: <TargetTenantId>\n"
         "   - IsActive: TRUE, Status: Active\n"
         "   - Created_By: <SuperAdminEmail>\n"
         "   - Created_At: <ISO Timestamp>\n"
         "3. The tenant's workspace active banner updates immediately across all client user dashboards.")
    ]
    for title, desc in steps:
        doc.add_heading(title, level=2)
        doc.add_paragraph(desc)

    doc.add_heading("4. License Deactivation & Suspension Protocol", level=1)
    doc.add_paragraph(
        "If a client organization terminates service or fails payment past the grace period (15 days):\n"
        "1. Open the License History drawer for the tenant.\n"
        "2. Click the 'Deactivate' action toggle on the active license row.\n"
        "3. Set status to 'Inactive'. The system immediately flags the license as IsActive = FALSE.\n"
        "4. Note: Soft deactivation preserves all customer databases, KYC files, and employee history in Drive and Sheets without data deletion."
    )

    doc_path = os.path.join(OUTPUT_DIR, "02_SOP_License_Renewal.docx")
    doc.save(doc_path)
    return doc_path

def build_docx_03_architecture():
    doc = Document()
    add_header_banner(doc, 
                      "Project Architecture & Technical Specification", 
                      "Comprehensive architectural blueprint of the SR Investments Multi-Tenant SaaS CRM: Google Apps Script Web App API, React Vite SPA frontend, Google Identity Services, and Centralized vs Isolated Spreadsheet Storage.")

    doc.add_heading("1. Executive Technical Summary", level=1)
    doc.add_paragraph(
        "The SR Investments CRM platform is an enterprise-grade multi-tenant Mutual Fund Distribution & Wealth Management SaaS application. "
        "It combines the zero-infrastructure operating cost of Google Cloud (Google Apps Script, Google Sheets, Google Drive) with a high-performance modern React SPA frontend deployed via CDN / GitHub Pages."
    )

    # Insert Architecture Diagram Image
    arch_img = os.path.join(IMG_DIR, "System_Architecture_Diagram.png")
    if os.path.exists(arch_img):
        doc.add_heading("2. High-Level Architecture Diagram", level=1)
        doc.add_paragraph("The following diagram illustrates the three-tier multi-tenant architecture and data isolation boundaries:")
        doc.add_picture(arch_img, width=Inches(6.8))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_cap.add_run("Figure 1: SR Investments SaaS CRM — Centralized Multi-Tenant Architectural Topology")
        r.font.size = Pt(8.5)
        r.font.italic = True
        r.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_heading("3. Core Structural Components", level=1)
    comps = [
        ("Presentation Layer (React 18 + Vite SPA):", 
         "A unified single-page application serving all tenants dynamically. Built with React hooks, context-driven session state (AuthContext), Royal Blue design language, and Lucide vector iconography. The client SPA detects the user's active tenant and dynamically injects organization branding and rights."),

        ("Authentication & Identity Layer (GIS + SHA-256):",
         "Supports two enterprise login vectors: (1) Native Google Identity Services (GIS) OAuth 2.0 with prompt='select_account' popups, returning verified JWT email payloads; (2) Traditional Staff ID / Email / Mobile multi-credential login with SHA-256 password cryptographic verification."),

        ("Multi-Workspace Routing Engine:",
         "When a user identity belongs to multiple client organizations (e.g., an advisor consulting for ABC Investments as Admin and XYZ Finance as Employee), the backend returns a multi-tenant pre-auth payload. The frontend displays the interactive 'Select your workspace' screen before initializing tenant context."),

        ("Backend API Engine (Google Apps Script Web App):",
         "A headless REST/JSON RPC microservice executing on Google infrastructure. Employs a dual transport bridge (direct POST and postMessage iframe Bridge) to achieve cross-origin zero-CORS latency. Handles schema migration, audit fields, and dynamic sheet routing."),

        ("Data Storage Layer (Dual-Database Model):",
         "• Central_SaaS_Master_DB: Global registry holding Tenant_Master, User_Master, Tenant_User_Mapping, and Tenant_Licensing.\n"
         "• Individual Tenant DBs: Independent spreadsheets per client cloned from _CRM_DATABASE_TEMPLATE holding Customers, Employees, and Master settings.\n"
         "• Individual Tenant Drive Folders: Strict folder isolation preventing cross-tenant document visibility.")
    ]
    for title, desc in comps:
        p = doc.add_paragraph()
        r = p.add_run(title + "\n")
        r.bold = True
        r.font.color.rgb = RGBColor(30, 64, 175)
        p.add_run(desc)

    doc.add_heading("4. 7-Field Enterprise Audit Standard", level=1)
    doc.add_paragraph(
        "To ensure compliance with SEBI and AMFI financial record-keeping guidelines, every database table across both the Central Master DB and individual Tenant DBs enforces 7 standardized audit columns:"
    )
    table = doc.add_table(rows=8, cols=3)
    format_table(table, [Inches(1.8), Inches(1.5), Inches(3.5)])
    table.rows[0].cells[0].paragraphs[0].text = "Audit Field"
    table.rows[0].cells[1].paragraphs[0].text = "Data Type"
    table.rows[0].cells[2].paragraphs[0].text = "Functional Purpose"

    audits = [
        ("IsDeleted", "BOOLEAN", "Soft-deletion flag. Records are never physically purged; hidden from active views."),
        ("Created_By", "VARCHAR(100)", "Email address of operator or system that created the row."),
        ("Created_At", "TIMESTAMP", "ISO-8601 UTC timestamp of original record creation."),
        ("Updated_By", "VARCHAR(100)", "Email address of operator who last modified the row."),
        ("Updated_At", "TIMESTAMP", "ISO-8601 UTC timestamp of the most recent update."),
        ("Deleted_By", "VARCHAR(100)", "Email address of operator who soft-deleted the record."),
        ("Deleted_At", "TIMESTAMP", "ISO-8601 UTC timestamp when soft-deletion occurred.")
    ]
    for idx, (f, t, d) in enumerate(audits):
        row = table.rows[idx + 1]
        row.cells[0].paragraphs[0].text = f
        row.cells[1].paragraphs[0].text = t
        row.cells[2].paragraphs[0].text = d

    doc_path = os.path.join(OUTPUT_DIR, "03_Project_Architecture_And_Flow.docx")
    doc.save(doc_path)
    return doc_path

def build_docx_04_diagrams():
    doc = Document()
    add_header_banner(doc, 
                      "DFD & Entity-Relationship (ER) Documentation", 
                      "Formal software engineering design documentation: Level 0 Context DFD, Level 1 Process DFD, and Complete Multi-Tenant Entity-Relationship Database Schema with Referential Cardinality.")

    doc.add_heading("1. Document Overview", level=1)
    doc.add_paragraph(
        "This specification provides visual data flow diagrams and entity-relationship models for the SR Investments SaaS CRM platform. "
        "It details how data moves through authentication, workspace routing, customer onboarding, and storage isolation boundaries."
    )

    # 1. DFD Level 0
    dfd0_img = os.path.join(IMG_DIR, "DFD_Level_0_Context_Diagram.png")
    if os.path.exists(dfd0_img):
        doc.add_heading("2. DFD Level 0 — Context Diagram", level=1)
        doc.add_paragraph("The Context Diagram establishes the boundary between the CRM Engine and external user entities:")
        doc.add_picture(dfd0_img, width=Inches(6.6))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_cap.add_run("Figure 2: DFD Level 0 — System Context & External Entities")
        r.font.size = Pt(8.5)
        r.font.italic = True
        r.font.color.rgb = RGBColor(100, 116, 139)

    # 2. DFD Level 1
    dfd1_img = os.path.join(IMG_DIR, "DFD_Level_1_Process_Flow.png")
    if os.path.exists(dfd1_img):
        doc.add_heading("3. DFD Level 1 — Process Flow Decomposition", level=1)
        doc.add_paragraph("The Level 1 diagram decomposes the CRM engine into six core sub-processes and two data stores:")
        doc.add_picture(dfd1_img, width=Inches(6.8))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_cap.add_run("Figure 3: DFD Level 1 — Sub-Processes, Inter-Process Flows & Data Store Interactions")
        r.font.size = Pt(8.5)
        r.font.italic = True
        r.font.color.rgb = RGBColor(100, 116, 139)

    # 3. ER Diagram
    er_img = os.path.join(IMG_DIR, "ER_Diagram_Multi_Tenant_SaaS.png")
    if os.path.exists(er_img):
        doc.add_heading("4. Entity-Relationship (ER) Schema Model", level=1)
        doc.add_paragraph("The ER Model specifies table structures, primary keys, foreign keys, and cardinalities between central and tenant registries:")
        doc.add_picture(er_img, width=Inches(6.8))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_cap.add_run("Figure 4: Entity-Relationship Diagram — Multi-Tenant SaaS Relational Topology")
        r.font.size = Pt(8.5)
        r.font.italic = True
        r.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_heading("5. Data Dictionary & Cardinality Relationships", level=1)
    table = doc.add_table(rows=6, cols=4)
    format_table(table, [Inches(1.8), Inches(1.8), Inches(1.2), Inches(2.0)])
    table.rows[0].cells[0].paragraphs[0].text = "Parent Entity"
    table.rows[0].cells[1].paragraphs[0].text = "Child Entity"
    table.rows[0].cells[2].paragraphs[0].text = "Cardinality"
    table.rows[0].cells[3].paragraphs[0].text = "Enforcement Key / Rule"

    rel_data = [
        ("TENANT_MASTER", "TENANT_LICENSING", "1 : N", "FK: TenantId. One tenant maintains historical license renewals."),
        ("TENANT_MASTER", "TENANT_USER_MAPPING", "1 : N", "FK: TenantId. One tenant associates multiple staff/advisors."),
        ("USER_MASTER", "TENANT_USER_MAPPING", "1 : N", "FK: UserId. One user can hold roles across multiple tenants."),
        ("TENANT_MASTER", "CUSTOMERS (Client DB)", "1 : N", "Dynamic routing via SpreadsheetId & DriveRootFolderId."),
        ("TENANT_MASTER", "EMPLOYEES (Client DB)", "1 : N", "Dynamic routing via SpreadsheetId & TenantId.")
    ]
    for idx, (p, c, card, rule) in enumerate(rel_data):
        row = table.rows[idx + 1]
        row.cells[0].paragraphs[0].text = p
        row.cells[1].paragraphs[0].text = c
        row.cells[2].paragraphs[0].text = card
        row.cells[3].paragraphs[0].text = rule

    doc_path = os.path.join(OUTPUT_DIR, "04_DFD_And_ER_Diagrams.docx")
    doc.save(doc_path)
    return doc_path

# ----------------------------------------------------------------------
# 4. EXECUTION
# ----------------------------------------------------------------------
if __name__ == "__main__":
    print("Generating diagrams...")
    generate_system_architecture_diagram()
    generate_dfd_level_0()
    generate_dfd_level_1()
    generate_er_diagram()
    print("Generating docx files...")
    f1 = build_docx_01_client_setup()
    f2 = build_docx_02_license_renewal()
    f3 = build_docx_03_architecture()
    f4 = build_docx_04_diagrams()
    print("Done! Generated:")
    print(f1, f2, f3, f4, sep="\n")

