"""
SR Investments SaaS CRM
Complete ER Diagram, Workflow & DFD Specification Generator
Outputs high-resolution diagrams (PNG) and production-grade Word Document (.docx) in SOP folder.
"""

import os
import tempfile

# Ensure matplotlib uses a writable temp cache directory
os.environ['MPLCONFIGDIR'] = tempfile.gettempdir()

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

SOP_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(SOP_DIR, "images")
os.makedirs(IMG_DIR, exist_ok=True)

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

# ----------------------------------------------------------------------
# 1. DIAGRAM GENERATION FUNCTIONS
# ----------------------------------------------------------------------

def generate_complete_erd():
    """Generates the full comprehensive ER Diagram covering Central SaaS and Tenant DB."""
    fig, ax = plt.subplots(figsize=(18, 12), dpi=300)
    ax.set_xlim(0, 18)
    ax.set_ylim(0, 12)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(9.0, 11.6, "Entity-Relationship (ER) Diagram — Central SaaS & Tenant Operational Databases", 
            ha='center', va='center', fontsize=15, fontweight='bold', color='#0f172a')
    ax.text(9.0, 11.25, "SR Investments SaaS CRM Architecture | Dual-Database Multi-Tenant Isolation Model",
            ha='center', va='center', fontsize=10, color='#64748b')

    # Central SaaS DB boundary box
    ax.add_patch(patches.FancyBboxPatch((0.4, 6.2), 17.2, 4.8, boxstyle="round,pad=0.2", facecolor='#f8fafc', edgecolor='#3b82f6', linewidth=1.5, linestyle='--'))
    ax.text(0.7, 10.7, "CENTRAL SAAS MASTER DATABASE (Global SaaS Registries)", fontsize=11, fontweight='bold', color='#1e40af')

    # Table 1: TENANT_MASTER
    ax.add_patch(patches.FancyBboxPatch((0.7, 6.6), 3.8, 3.8, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#2563eb', linewidth=1.8))
    ax.add_patch(patches.Rectangle((0.7, 9.8), 3.8, 0.6, facecolor='#2563eb'))
    ax.text(2.6, 10.1, "TENANT_MASTER", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#ffffff')
    t_fields = [
        "PK  TenantId : VARCHAR(20)",
        "    TenantName : VARCHAR(100)",
        "    CompanyName : VARCHAR(100)",
        "    TagLine : VARCHAR(150)",
        "    ArnNumber : VARCHAR(50)",
        "    SpreadsheetId : VARCHAR(100)",
        "    DriveRootFolderId : VARCHAR(100)",
        "    SupportEmail : VARCHAR(100)",
        "    ContactPhone : VARCHAR(20)",
        "    Status : Active | Inactive",
        "    + 7 Standard Audit Fields"
    ]
    ax.text(0.9, 8.1, "\n".join(t_fields), fontsize=7.2, color='#1e293b', linespacing=1.3)

    # Table 2: TENANT_USER_MAPPING
    ax.add_patch(patches.FancyBboxPatch((5.1, 7.2), 3.8, 3.2, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#7c3aed', linewidth=1.8))
    ax.add_patch(patches.Rectangle((5.1, 9.8), 3.8, 0.6, facecolor='#7c3aed'))
    ax.text(7.0, 10.1, "TENANT_USER_MAPPING", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#ffffff')
    m_fields = [
        "PK  MappingId : VARCHAR(20)",
        "FK  UserId : VARCHAR(20)",
        "FK  TenantId : VARCHAR(20)",
        "    Role : Admin | RM | Staff",
        "    Status : Active | Inactive",
        "    + 7 Standard Audit Fields"
    ]
    ax.text(5.3, 8.4, "\n".join(m_fields), fontsize=7.2, color='#1e293b', linespacing=1.35)

    # Table 3: USER_MASTER
    ax.add_patch(patches.FancyBboxPatch((9.5, 6.6), 3.8, 3.8, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#059669', linewidth=1.8))
    ax.add_patch(patches.Rectangle((9.5, 9.8), 3.8, 0.6, facecolor='#059669'))
    ax.text(11.4, 10.1, "USER_MASTER", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#ffffff')
    u_fields = [
        "PK  UserId : VARCHAR(20)",
        "    Email : VARCHAR(100) [UNIQUE]",
        "    AlternateEmailsList : TEXT (CSV)",
        "    Password : VARCHAR(64) [SHA256]",
        "    FullName : VARCHAR(100)",
        "    Mobile : VARCHAR(20)",
        "    AlternateMobile : TEXT (CSV)",
        "    IsSuperAdmin : BOOLEAN",
        "    Status : Active | Inactive",
        "    + 7 Standard Audit Fields"
    ]
    ax.text(9.7, 8.1, "\n".join(u_fields), fontsize=7.2, color='#1e293b', linespacing=1.3)

    # Table 4: TENANT_LICENSES & SUBSCRIPTIONS
    ax.add_patch(patches.FancyBboxPatch((13.9, 6.6), 3.6, 3.8, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#d97706', linewidth=1.8))
    ax.add_patch(patches.Rectangle((13.9, 9.8), 3.6, 0.6, facecolor='#d97706'))
    ax.text(15.7, 10.1, "TENANT_LICENSES", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#ffffff')
    lic_fields = [
        "PK  Id : VARCHAR(20)",
        "FK  TenantId : VARCHAR(20)",
        "    LicenseType : Basic | Pro",
        "    StartDate : DATE",
        "    EndDate : DATE",
        "    Amount : NUMERIC(10,2)",
        "    PaymentMode : Bank | UPI",
        "    IsActive : BOOLEAN",
        "    Status : Active | Expired",
        "    + 7 Standard Audit Fields"
    ]
    ax.text(14.1, 8.1, "\n".join(lic_fields), fontsize=7.2, color='#1e293b', linespacing=1.3)

    # Central Relationships
    ax.annotate('', xy=(5.1, 8.8), xytext=(4.5, 8.8), arrowprops=dict(arrowstyle="-|>", color="#2563eb", lw=2))
    ax.text(4.6, 9.0, "1:N", fontsize=8, fontweight='bold', color="#2563eb")

    ax.annotate('', xy=(8.9, 8.8), xytext=(9.5, 8.8), arrowprops=dict(arrowstyle="-|>", color="#059669", lw=2))
    ax.text(9.0, 9.0, "N:1", fontsize=8, fontweight='bold', color="#059669")

    ax.annotate('', xy=(13.9, 8.8), xytext=(4.5, 7.2), arrowprops=dict(arrowstyle="-|>", color="#d97706", lw=1.5, ls="--"))
    ax.text(13.4, 7.5, "1:N", fontsize=8, fontweight='bold', color="#d97706")

    # Tenant DB boundary box
    ax.add_patch(patches.FancyBboxPatch((0.4, 0.4), 17.2, 5.4, boxstyle="round,pad=0.2", facecolor='#faf5ff', edgecolor='#9333ea', linewidth=1.5, linestyle='--'))
    ax.text(0.7, 5.4, "TENANT OPERATIONAL DATABASE (Dedicated Spreadsheet per Tenant Org)", fontsize=11, fontweight='bold', color='#7e22ce')

    # Table 5: CUSTOMERS
    ax.add_patch(patches.FancyBboxPatch((0.7, 0.8), 3.8, 4.3, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#0284c7', linewidth=1.8))
    ax.add_patch(patches.Rectangle((0.7, 4.5), 3.8, 0.6, facecolor='#0284c7'))
    ax.text(2.6, 4.8, "CUSTOMERS", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#ffffff')
    c_fields = [
        "PK  CustomerId : VARCHAR(20)",
        "    CustomerCode : VARCHAR(20)",
        "    FullName : VARCHAR(100)",
        "    Mobile : VARCHAR(20)",
        "    Email : VARCHAR(100)",
        "    PanNumber : VARCHAR(10)",
        "    KycStatus : Compliant | Pending",
        "    InvestorCategory : Retail | HNI",
        "    RiskProfile : Moderate | High",
        "    Status : Active | Pending",
        "    Approval_History : TEXT",
        "    + 7 Audit Fields & Approval"
    ]
    ax.text(0.9, 2.5, "\n".join(c_fields), fontsize=7.2, color='#1e293b', linespacing=1.28)

    # Table 6: EMPLOYEES
    ax.add_patch(patches.FancyBboxPatch((5.1, 0.8), 3.8, 4.3, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#ea580c', linewidth=1.8))
    ax.add_patch(patches.Rectangle((5.1, 4.5), 3.8, 0.6, facecolor='#ea580c'))
    ax.text(7.0, 4.8, "EMPLOYEES", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#ffffff')
    e_fields = [
        "PK  EmployeeId : VARCHAR(20)",
        "    EmployeeCode : VARCHAR(20)",
        "    FullName : VARCHAR(100)",
        "    Email : VARCHAR(100)",
        "    Mobile : VARCHAR(20)",
        "    AlternateEmails : TEXT (CSV)",
        "    DepartmentId : VARCHAR(20)",
        "    DesignationId : VARCHAR(20)",
        "    Role : Admin | RM | Staff",
        "    Status : Active | Inactive",
        "    + 7 Standard Audit Fields"
    ]
    ax.text(5.3, 2.5, "\n".join(e_fields), fontsize=7.2, color='#1e293b', linespacing=1.28)

    # Table 7: ROLES_RIGHTS (Redesigned with UserId)
    ax.add_patch(patches.FancyBboxPatch((9.5, 0.8), 3.8, 4.3, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#dc2626', linewidth=2))
    ax.add_patch(patches.Rectangle((9.5, 4.5), 3.8, 0.6, facecolor='#dc2626'))
    ax.text(11.4, 4.8, "ROLES_RIGHTS [REDESIGNED]", ha='center', va='center', fontsize=9, fontweight='bold', color='#ffffff')
    r_fields = [
        "PK  Role : VARCHAR(50)",
        "PK  UserId : VARCHAR(50) [EMPTY=ROLE]",
        "PK  Module : VARCHAR(50)",
        "    CanView : BOOLEAN",
        "    CanCreate : BOOLEAN",
        "    CanEdit : BOOLEAN",
        "    CanDelete : BOOLEAN",
        "    IsDeleted : BOOLEAN",
        "    Created_By : VARCHAR(100)",
        "    + 7 Standard Audit Fields",
        "    * Hierarchy: User Override > Role"
    ]
    ax.text(9.7, 2.5, "\n".join(r_fields), fontsize=7.2, color='#1e293b', linespacing=1.28)

    # Table 8: CUSTOMER_BANK & NOMINEE & SETTINGS
    ax.add_patch(patches.FancyBboxPatch((13.9, 0.8), 3.6, 4.3, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#0891b2', linewidth=1.8))
    ax.add_patch(patches.Rectangle((13.9, 4.5), 3.6, 0.6, facecolor='#0891b2'))
    ax.text(15.7, 4.8, "ANCILLARY & SETTINGS", ha='center', va='center', fontsize=9.2, fontweight='bold', color='#ffffff')
    anc_fields = [
        "CUSTOMER_BANK (1:N Customer)",
        "  BankId, CustomerId, AccountNo",
        "  IfscCode, BankName, IsPrimary",
        "CUSTOMER_NOMINEE (1:N Customer)",
        "  NomineeId, CustomerId, Share%",
        "COMPANY_SETTINGS (1:1 Tenant)",
        "  CompanyName, TagLine, ArnNo",
        "  AdminApprovalWorkflow (BOOL)",
        "MASTER TABLES (Dept, Desig, Roles)"
    ]
    ax.text(14.1, 2.4, "\n".join(anc_fields), fontsize=7.0, color='#1e293b', linespacing=1.3)

    # Partition arrow from TENANT_MASTER to Tenant DB
    ax.annotate('', xy=(2.6, 5.2), xytext=(2.6, 6.6), arrowprops=dict(arrowstyle="-|>", color="#9333ea", lw=2.5))
    ax.text(2.8, 5.8, "Clones & Routes via\nSpreadsheetId & DriveFolderId", fontsize=7.5, fontweight='bold', color="#7e22ce")

    # Connectors in Tenant DB
    ax.annotate('', xy=(13.9, 3.5), xytext=(4.5, 3.5), arrowprops=dict(arrowstyle="-|>", color="#0284c7", lw=1.5))
    ax.text(4.6, 3.7, "1:N (Bank/Nominee)", fontsize=7.5, color="#0284c7")

    ax.annotate('', xy=(9.5, 2.2), xytext=(8.9, 2.2), arrowprops=dict(arrowstyle="-|>", color="#dc2626", lw=1.5))
    ax.text(9.0, 2.4, "Overrides", fontsize=7.5, color="#dc2626")

    plt.tight_layout()
    path = os.path.join(IMG_DIR, "ER_Diagram_Complete_CRM.png")
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    return path


def generate_system_workflow_diagram():
    """Generates the System Topology and File/Authentication Workflow Diagram."""
    fig, ax = plt.subplots(figsize=(16, 10), dpi=300)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(8.0, 9.6, "System Architecture & End-to-End Operational Workflow", 
            ha='center', va='center', fontsize=15, fontweight='bold', color='#0f172a')
    ax.text(8.0, 9.25, "Google Apps Script Engine, Single SPA Frontend, Dynamic Tenant Resolver & Isolated Storage",
            ha='center', va='center', fontsize=10, color='#64748b')

    # Layer 1: Frontend SPA
    ax.add_patch(patches.FancyBboxPatch((0.5, 7.2), 15.0, 1.6, boxstyle="round,pad=0.15", facecolor='#eff6ff', edgecolor='#2563eb', linewidth=2))
    ax.text(0.8, 8.4, "1. PRESENTATION LAYER (React 18 + Vite SPA)", fontsize=11, fontweight='bold', color='#1e40af')
    
    ax.add_patch(patches.FancyBboxPatch((1.0, 7.4), 4.3, 0.8, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#93c5fd'))
    ax.text(3.15, 7.8, "SuperAdmin SaaS Portal\n(Tenant Master, Licenses, Config)", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')

    ax.add_patch(patches.FancyBboxPatch((5.85, 7.4), 4.3, 0.8, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#93c5fd'))
    ax.text(8.0, 7.8, "Multi-Tenant Workspace Picker\n(Auto-detects orgs via User Mapping)", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')

    ax.add_patch(patches.FancyBboxPatch((10.7, 7.4), 4.3, 0.8, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#93c5fd'))
    ax.text(12.85, 7.8, "Tenant Operational App\n(Customers, KYC, Staff, Approval, RBAC)", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0f172a')

    # Connecting down
    ax.annotate('', xy=(8.0, 6.2), xytext=(8.0, 7.2), arrowprops=dict(arrowstyle="->", color="#1e40af", lw=2))
    ax.text(8.2, 6.7, "Cross-Origin RPC & Google OAuth GIS", fontsize=8.5, color="#1e40af", fontweight='bold')

    # Layer 2: Apps Script Gateway
    ax.add_patch(patches.FancyBboxPatch((0.5, 4.4), 15.0, 1.8, boxstyle="round,pad=0.15", facecolor='#f0fdf4', edgecolor='#16a34a', linewidth=2))
    ax.text(0.8, 5.85, "2. BACKEND API GATEWAY (Google Apps Script Web App Microservices)", fontsize=11, fontweight='bold', color='#15803d')

    ax.add_patch(patches.FancyBboxPatch((1.0, 4.6), 3.2, 0.95, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#86efac'))
    ax.text(2.6, 5.07, "Authentication & GIS\nSHA-256 / Google Tokens\nWorkspace Detector", ha='center', va='center', fontsize=8, color='#14532d')

    ax.add_patch(patches.FancyBboxPatch((4.7, 4.6), 3.2, 0.95, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#86efac'))
    ax.text(6.3, 5.07, "Dynamic Sheet Router\nResolves SpreadsheetId\nStrict Isolation Guards", ha='center', va='center', fontsize=8, color='#14532d')

    ax.add_patch(patches.FancyBboxPatch((8.4, 4.6), 3.2, 0.95, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#86efac'))
    ax.text(10.0, 5.07, "RBAC & User Overrides\nModule Rights Evaluation\nData Approval Workflow", ha='center', va='center', fontsize=8, color='#14532d')

    ax.add_patch(patches.FancyBboxPatch((12.1, 4.6), 3.2, 0.95, boxstyle="round,pad=0.08", facecolor='#ffffff', edgecolor='#86efac'))
    ax.text(13.7, 5.07, "Drive Storage Hierarchy\nFolder Structure Provisioning\nAuto Employee/Customer Vaults", ha='center', va='center', fontsize=8, color='#14532d')

    # Arrows down to storage
    ax.annotate('', xy=(4.0, 3.4), xytext=(5.5, 4.4), arrowprops=dict(arrowstyle="->", color="#15803d", lw=2))
    ax.annotate('', xy=(12.0, 3.4), xytext=(10.5, 4.4), arrowprops=dict(arrowstyle="->", color="#15803d", lw=2))

    # Layer 3: Storage Layer
    # Box 3A: Central DB
    ax.add_patch(patches.FancyBboxPatch((0.5, 0.6), 6.8, 2.7, boxstyle="round,pad=0.15", facecolor='#fffbeb', edgecolor='#d97706', linewidth=2))
    ax.text(0.8, 2.9, "3A. CENTRAL SAAS DATABASE", fontsize=10.5, fontweight='bold', color='#b45309')
    db_items = [
        "• Central_SaaS_Master_DB",
        "  - Tenant_Master (Tenants, SId, FolderId)",
        "  - User_Master (Universal user identities)",
        "  - Tenant_User_Mapping (M:N memberships)",
        "  - Tenant_Licenses & Subscription_Plans",
        "  - Default-Config (Global settings & blacklisted session keys)"
    ]
    ax.text(0.9, 1.7, "\n".join(db_items), fontsize=7.8, color='#78350f', linespacing=1.25)

    # Box 3B: Isolated Tenant Drive & Sheets
    ax.add_patch(patches.FancyBboxPatch((8.0, 0.6), 7.5, 2.7, boxstyle="round,pad=0.15", facecolor='#faf5ff', edgecolor='#9333ea', linewidth=2))
    ax.text(8.3, 2.9, "3B. TENANT ISOLATED SPREADSHEETS & DRIVE FOLDERS", fontsize=10.5, fontweight='bold', color='#7e22ce')
    folder_items = [
        "• Root Folder: SRInvestmentsCRM/ (NO file uploads allowed in root)",
        "• Tenant Org Folder: org/<TenantId>/ (DriveRootFolderId)",
        "  ├── <TenantId>_CRM_DB.xlsx (Customers, Staff, Rights, Settings)",
        "  ├── EmployeeFiles/<EmployeeId>/files/ (Auto-created on upload)",
        "  └── CustomerFiles/<CustomerId>/files/ (Auto-created on upload)",
        "• SuperAdmin operates at SaaS level with Default-Config (No tenant dependency)"
    ]
    ax.text(8.4, 1.7, "\n".join(folder_items), fontsize=7.8, color='#581c87', linespacing=1.25)

    plt.tight_layout()
    path = os.path.join(IMG_DIR, "Workflow_Multi_Tenant_Architecture.png")
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    return path


def generate_dfd_level_0():
    """Generates Context Level 0 DFD."""
    fig, ax = plt.subplots(figsize=(14, 8.5), dpi=300)
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 8.5)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(7.0, 8.0, "Data Flow Diagram (DFD) — Level 0 Context Diagram", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a')

    # Center circle: CRM System
    circle = patches.Circle((7.0, 4.2), 1.9, facecolor='#eff6ff', edgecolor='#2563eb', linewidth=2.5)
    ax.add_patch(circle)
    ax.text(7.0, 4.4, "0.0\nSR INVESTMENTS\nSAAS CRM SYSTEM", ha='center', va='center', fontsize=11, fontweight='bold', color='#1e40af')
    ax.text(7.0, 3.4, "(Central Engine & Isolated DBs)", ha='center', va='center', fontsize=8, color='#3b82f6')

    # External Entities
    # 1. SuperAdmin (Top Left)
    ax.add_patch(patches.Rectangle((0.6, 6.2), 3.0, 1.3, facecolor='#f8fafc', edgecolor='#0f172a', linewidth=1.8))
    ax.text(2.1, 6.85, "SUPER ADMIN\n(Platform Owner)", ha='center', va='center', fontsize=9, fontweight='bold')
    
    # Arrows SuperAdmin
    ax.annotate('', xy=(5.5, 5.2), xytext=(3.6, 6.5), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    ax.text(4.0, 6.1, "Onboard Tenant, Licenses, Config", fontsize=7.5, color="#2563eb", rotation=-32)
    ax.annotate('', xy=(3.6, 6.2), xytext=(5.3, 4.9), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5))
    ax.text(4.5, 5.3, "Global Audit & Status Reports", fontsize=7.5, color="#059669", rotation=-32)

    # 2. Tenant Admin (Bottom Left)
    ax.add_patch(patches.Rectangle((0.6, 1.0), 3.0, 1.3, facecolor='#f8fafc', edgecolor='#0f172a', linewidth=1.8))
    ax.text(2.1, 1.65, "TENANT ADMIN\n(Org Manager)", ha='center', va='center', fontsize=9, fontweight='bold')

    # Arrows Tenant Admin
    ax.annotate('', xy=(5.4, 3.2), xytext=(3.6, 1.8), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    ax.text(4.0, 2.7, "Staff Setup, Approval, Rights", fontsize=7.5, color="#2563eb", rotation=32)
    ax.annotate('', xy=(3.6, 1.5), xytext=(5.2, 2.9), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5))
    ax.text(4.5, 2.0, "Approval Queue, Org Reports", fontsize=7.5, color="#059669", rotation=32)

    # 3. Staff & Advisors (Top Right)
    ax.add_patch(patches.Rectangle((10.4, 6.2), 3.0, 1.3, facecolor='#f8fafc', edgecolor='#0f172a', linewidth=1.8))
    ax.text(11.9, 6.85, "STAFF / ADVISORS\n(Relationship Mgrs)", ha='center', va='center', fontsize=9, fontweight='bold')

    # Arrows Staff
    ax.annotate('', xy=(8.7, 5.1), xytext=(10.4, 6.5), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    ax.text(9.2, 6.1, "Customer Entry, KYC, Docs", fontsize=7.5, color="#2563eb", rotation=32)
    ax.annotate('', xy=(10.4, 6.2), xytext=(8.8, 4.8), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5))
    ax.text(9.0, 5.3, "Permissions, Client Records", fontsize=7.5, color="#059669", rotation=32)

    # 4. Investor / Client (Bottom Right)
    ax.add_patch(patches.Rectangle((10.4, 1.0), 3.0, 1.3, facecolor='#f8fafc', edgecolor='#0f172a', linewidth=1.8))
    ax.text(11.9, 1.65, "INVESTOR / CLIENT\n(Mutual Fund Client)", ha='center', va='center', fontsize=9, fontweight='bold')

    # Arrows Client
    ax.annotate('', xy=(8.6, 3.3), xytext=(10.4, 1.8), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    ax.text(9.1, 2.7, "KYC Proofs, Bank Details", fontsize=7.5, color="#2563eb", rotation=-32)
    ax.annotate('', xy=(10.4, 1.5), xytext=(8.7, 3.0), arrowprops=dict(arrowstyle="->", color="#059669", lw=1.5))
    ax.text(9.0, 2.0, "Portfolio Valuation, Statements", fontsize=7.5, color="#059669", rotation=-32)

    plt.tight_layout()
    path = os.path.join(IMG_DIR, "DFD_Level_0_Context_Diagram.png")
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    return path


def generate_dfd_level_1():
    """Generates Level 1 Process Decomposition DFD."""
    fig, ax = plt.subplots(figsize=(15, 9.5), dpi=300)
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 9.5)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(7.5, 9.0, "Data Flow Diagram (DFD) — Level 1 Process Decomposition", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a')

    # 6 Major Processes
    procs = [
        (1.0, 6.7, "1.0", "Authentication & Identity", "Google GIS OAuth Token\nUsername / Password SHA-256", '#2563eb'),
        (5.8, 6.7, "2.0", "Workspace & Licensing", "Tenant_User_Mapping Match\nLicense Validity Verification", '#2563eb'),
        (10.6, 6.7, "3.0", "Tenant Onboarding", "Template Clone, Drive Folder\nLicense Provisioning & Plans", '#2563eb'),
        (1.0, 4.0, "4.0", "Customer Management", "KYC Details, Bank, Nominee\nCAS Ingestion & Portfolios", '#059669'),
        (5.8, 4.0, "5.0", "RBAC & User Overrides", "RolesRights Evaluation\nUser Custom Overrides > Role", '#059669'),
        (10.6, 4.0, "6.0", "Approval & Governance", "Approval Pending Workflow\nAudit History & Admin Signoff", '#059669'),
    ]

    for x, y, num, title, desc, col in procs:
        ax.add_patch(patches.FancyBboxPatch((x, y), 3.4, 1.5, boxstyle="round,pad=0.12", facecolor='#f8fafc', edgecolor=col, linewidth=1.8))
        ax.text(x + 1.7, y + 1.15, f"{num} {title}", ha='center', va='center', fontsize=9, fontweight='bold', color=col)
        ax.text(x + 1.7, y + 0.6, desc, ha='center', va='center', fontsize=7.8, color='#334155', linespacing=1.2)

    # Data Stores
    # D1: Central Master DB
    ax.plot([1.2, 6.2], [1.8, 1.8], color='#b45309', lw=2)
    ax.plot([1.2, 6.2], [0.8, 0.8], color='#b45309', lw=2)
    ax.plot([1.2, 1.2], [0.8, 1.8], color='#b45309', lw=2)
    ax.fill_between([1.2, 6.2], [0.8, 0.8], [1.8, 1.8], facecolor='#fffbeb')
    ax.text(1.5, 1.5, "D1", fontsize=9, fontweight='bold', color='#b45309')
    ax.text(3.7, 1.3, "Central_SaaS_Master_DB\n(Tenants, Users, Mappings, Licenses, Config)", ha='center', va='center', fontsize=8, color='#78350f', fontweight='bold')

    # D2: Tenant Isolated DB & Drive
    ax.plot([8.8, 13.8], [1.8, 1.8], color='#7e22ce', lw=2)
    ax.plot([8.8, 13.8], [0.8, 0.8], color='#7e22ce', lw=2)
    ax.plot([8.8, 8.8], [0.8, 1.8], color='#7e22ce', lw=2)
    ax.fill_between([8.8, 13.8], [0.8, 0.8], [1.8, 1.8], facecolor='#faf5ff')
    ax.text(9.1, 1.5, "D2", fontsize=9, fontweight='bold', color='#7e22ce')
    ax.text(11.3, 1.3, "Tenant Dedicated Sheets & Drive Vault\n(Customers, Staff, RolesRights, Settings)", ha='center', va='center', fontsize=8, color='#581c87', fontweight='bold')

    # Connectors
    ax.annotate('', xy=(5.8, 7.45), xytext=(4.4, 7.45), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))
    ax.annotate('', xy=(10.6, 7.45), xytext=(9.2, 7.45), arrowprops=dict(arrowstyle="->", color="#2563eb", lw=1.5))

    ax.annotate('', xy=(2.7, 1.8), xytext=(2.7, 6.7), arrowprops=dict(arrowstyle="<->", color="#b45309", lw=1.2, ls="--"))
    ax.annotate('', xy=(7.5, 1.8), xytext=(7.5, 6.7), arrowprops=dict(arrowstyle="<->", color="#b45309", lw=1.2, ls="--"))

    ax.annotate('', xy=(2.7, 1.8), xytext=(2.7, 4.0), arrowprops=dict(arrowstyle="<->", color="#7e22ce", lw=1.2))
    ax.annotate('', xy=(7.5, 1.8), xytext=(7.5, 4.0), arrowprops=dict(arrowstyle="<->", color="#7e22ce", lw=1.2))
    ax.annotate('', xy=(12.3, 1.8), xytext=(12.3, 4.0), arrowprops=dict(arrowstyle="<->", color="#7e22ce", lw=1.2))

    plt.tight_layout()
    path = os.path.join(IMG_DIR, "DFD_Level_1_Process_Flow.png")
    plt.savefig(path, bbox_inches='tight', dpi=300)
    plt.close()
    return path


# ----------------------------------------------------------------------
# 2. DOCX FORMATTING HELPERS
# ----------------------------------------------------------------------

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))


def format_table(table, col_widths, header_bg="1e40af"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, col in enumerate(table.columns):
        for cell in col.cells:
            cell.width = col_widths[i]
    for cell in table.rows[0].cells:
        set_cell_background(cell, header_bg)
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                run.font.size = Pt(8.5)
    for r_idx, row in enumerate(table.rows[1:]):
        bg = "f8fafc" if r_idx % 2 == 1 else "ffffff"
        for cell in row.cells:
            set_cell_background(cell, bg)
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                for run in p.runs:
                    run.font.size = Pt(8.0)


def add_header_banner(doc, title_text, subtitle_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    cell.width = Inches(6.8)
    set_cell_background(cell, "1e40af")
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r1 = p.add_run("SR INVESTMENTS SAAS CRM — TECHNICAL DOCUMENTATION\n")
    r1.font.size = Pt(9.5)
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(147, 197, 253)

    r2 = p.add_run(title_text)
    r2.font.size = Pt(17)
    r2.font.bold = True
    r2.font.color.rgb = RGBColor(255, 255, 255)

    p2 = cell.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_after = Pt(14)
    r3 = p2.add_run(subtitle_text)
    r3.font.size = Pt(9.5)
    r3.font.italic = True
    r3.font.color.rgb = RGBColor(224, 231, 255)
    doc.add_paragraph()


# ----------------------------------------------------------------------
# 3. BUILD COMPLETE MASTER DOCUMENT
# ----------------------------------------------------------------------

def build_complete_master_sop():
    doc = Document()

    # Document Header Banner
    add_header_banner(
        doc,
        "System Architecture, Workflows, Entity-Relationship (ER) & Data Flow Diagrams (DFD)",
        "Comprehensive Software Engineering Specification for the SR Investments Centralized Multi-Tenant SaaS CRM Platform."
    )

    # Section 1: Executive Summary
    doc.add_heading("1. Executive Summary & Architectural Overview", level=1)
    doc.add_paragraph(
        "The SR Investments SaaS CRM is a distributed multi-tenant platform designed for Mutual Fund Distributors, Wealth Managers, and Financial Advisors. "
        "The application marries high-performance React (Vite SPA) user interfaces with the zero-infrastructure maintenance of Google Cloud "
        "(Google Apps Script Web App API, Google Sheets database persistence, and Google Drive file vaults)."
    )
    doc.add_paragraph(
        "Key architectural principles include:\n"
        "• Strict SaaS Isolation: Global registries (Tenants, Users, Licenses) reside in the Central_SaaS_Master_DB, while all operational customer, employee, and transaction records exist strictly in dedicated, cloned spreadsheets per tenant.\n"
        "• Dual Authentication Vectors: Google Identity Services (GIS) OAuth 2.0 with interactive account selection popups, complemented by traditional Staff Code / Email / Mobile multi-credential login with SHA-256 cryptographic verification.\n"
        "• Dynamic Multi-Workspace Routing: Single user identities can belong to multiple client organizations with independent roles.\n"
        "• Granular Data Change Governance: Configurable Admin Approval Workflow ensures non-admin modifications enter an 'Approval Pending' state until authorized by an administrator.\n"
        "• Redesigned Hybrid Permissions: Role-Based Access Control (RBAC) baseline permissions with user-specific custom overrides and one-click role resets.\n"
        "• Structured Drive Storage: Automatic hierarchical folder generation (EmployeeFiles/<EmployeeId>/files, CustomerFiles/<CustomerId>/files) strictly within each tenant's Drive folder."
    )

    # Section 2: System Architecture Workflow
    doc.add_heading("2. System Architecture & End-to-End Workflows", level=1)
    arch_img = os.path.join(IMG_DIR, "Workflow_Multi_Tenant_Architecture.png")
    if os.path.exists(arch_img):
        doc.add_picture(arch_img, width=Inches(6.8))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_cap.add_run("Figure 1: High-Level System Topology, Storage Hierarchy & Routing Architecture")
        r.font.size = Pt(8.5)
        r.font.italic = True
        r.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_heading("2.1 Multi-Tenant Provisioning Workflow", level=2)
    doc.add_paragraph(
        "1. Tenant Folder Creation: An isolated folder is created under Google Drive root (SRInvestmentsCRM/org/<TenantId>).\n"
        "2. Database Template Cloning: The master template (_CRM_DATABASE_TEMPLATE) is duplicated into the tenant folder as <TenantId>_CRM_DB, and its unique SpreadsheetId is recorded.\n"
        "3. Registration in Central SaaS Master DB: A new record is registered in Tenant_Master containing ArnNumber, SpreadsheetId, DriveRootFolderId, and Contact details.\n"
        "4. Subscription Licensing: Initial plan tier and duration are recorded in Tenant_Licenses."
    )

    doc.add_heading("2.2 Authentication & Workspace Routing Workflow", level=2)
    doc.add_paragraph(
        "1. Credential Submission: The user signs in via Google OAuth GIS or enters Username/Mobile + Password.\n"
        "2. Central Identity Lookup: Apps Script matches the user against User_Master. If not found, it checks primary tenant Employees.\n"
        "3. Membership Resolution: All active tenant memberships are queried from Tenant_User_Mapping.\n"
        "4. Single vs Multi-Org Decision:\n"
        "   • If 1 workspace: Session is authenticated and direct tenant context is loaded.\n"
        "   • If >1 workspaces: A pre-auth token is issued and the frontend renders the interactive Workspace Picker.\n"
        "   • If SuperAdmin with NO tenant: Operates directly in the Central SaaS portal using Default-Config without any tenant dependency."
    )

    doc.add_heading("2.3 Permissions & Approval Governance Workflow", level=2)
    doc.add_paragraph(
        "1. RBAC Baseline: Baseline privileges (CanView, CanCreate, CanEdit, CanDelete) are defined per role across all standard CRM modules.\n"
        "2. User-Specific Overrides: When an administrator selects a specific user in RolesRights, custom permissions are saved with UserId populated, overriding their role default.\n"
        "3. Role Reset: An administrator can click 'Reset to Role Defaults' to remove the user's custom records and restore baseline role inheritance.\n"
        "4. Admin Approval Engine: When enabled in CompanySettings, non-admin additions, edits, and deletions are saved with Status = 'Approval Pending'. Admins review and sign off via the approval queue."
    )

    doc.add_heading("2.4 Document Storage & Drive Vault Hierarchy", level=2)
    doc.add_paragraph(
        "The system enforces strict document containment:\n"
        "• Root Folder (SRInvestmentsCRM/): No direct file uploads allowed. SuperAdmin cannot upload files without tenant mapping.\n"
        "• Tenant Folder (org/<TenantId>/): Contains <TenantId>_CRM_DB spreadsheet and subdirectories.\n"
        "• Employee Files: Stored under EmployeeFiles/<EmployeeId>/files/ (auto-created on first upload).\n"
        "• Customer Files: Stored under CustomerFiles/<CustomerId>/files/ (auto-created on first upload)."
    )

    # Section 3: Entity-Relationship Diagram & Database Schemas
    doc.add_heading("3. Entity-Relationship (ER) Schema Specification", level=1)
    er_img = os.path.join(IMG_DIR, "ER_Diagram_Complete_CRM.png")
    if os.path.exists(er_img):
        doc.add_picture(er_img, width=Inches(6.8))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_cap.add_run("Figure 2: Complete Entity-Relationship Diagram across Central SaaS and Tenant Databases")
        r.font.size = Pt(8.5)
        r.font.italic = True
        r.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_heading("3.1 Complete Data Dictionary — Central SaaS Master DB", level=2)
    
    # Table A: Central Tables
    central_schemas = [
        ("TENANT_MASTER", [
            ("TenantId", "VARCHAR(20)", "Primary Key", "Unique identifier for tenant (e.g. TEN001)."),
            ("TenantName", "VARCHAR(100)", "Required", "Display name of tenant organization."),
            ("CompanyName", "VARCHAR(100)", "Required", "Legal entity / company registration name."),
            ("TagLine", "VARCHAR(150)", "Optional", "Business slogan / sub-branding."),
            ("ArnNumber", "VARCHAR(50)", "AMFI Reg", "AMFI Registration Number for mutual fund distribution."),
            ("SpreadsheetId", "VARCHAR(100)", "Google ID", "Google Sheets spreadsheet ID of tenant isolated database."),
            ("DriveRootFolderId", "VARCHAR(100)", "Google ID", "Google Drive folder ID of tenant isolated storage root."),
            ("SupportEmail", "VARCHAR(100)", "Contact", "Official support email address for the tenant."),
            ("ContactPhone", "VARCHAR(20)", "Contact", "Official phone contact number."),
            ("OfficeAddress", "TEXT", "Optional", "Physical registered office address."),
            ("Status", "VARCHAR(20)", "State", "Active | Suspended | Terminated."),
            ("7 Audit Fields", "AUDIT", "Standard", "IsDeleted, Created_By, Created_At, Updated_By, Updated_At, Deleted_By, Deleted_At.")
        ]),
        ("USER_MASTER", [
            ("UserId", "VARCHAR(20)", "Primary Key", "Universal user identifier (e.g. USER1, USER2)."),
            ("Email", "VARCHAR(100)", "Unique", "Primary login email address."),
            ("AlternateEmailsList", "TEXT", "CSV", "Comma-separated list of secondary Google / login emails."),
            ("Password", "VARCHAR(64)", "SHA-256", "Cryptographic hash of password."),
            ("FullName", "VARCHAR(100)", "Display", "User's full legal name."),
            ("Mobile", "VARCHAR(20)", "Contact", "Primary contact telephone number."),
            ("AlternateMobile", "TEXT", "CSV", "Secondary contact telephone numbers."),
            ("IsSuperAdmin", "BOOLEAN", "Privilege", "True if platform founder with SaaS super-administrative powers."),
            ("Status", "VARCHAR(20)", "State", "Active | Inactive."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ]),
        ("TENANT_USER_MAPPING", [
            ("MappingId", "VARCHAR(20)", "Primary Key", "Unique mapping identifier (e.g. MAP001)."),
            ("UserId", "VARCHAR(20)", "Foreign Key", "References USER_MASTER.UserId."),
            ("TenantId", "VARCHAR(20)", "Foreign Key", "References TENANT_MASTER.TenantId."),
            ("Role", "VARCHAR(50)", "RBAC", "Assigned tenant role: Admin | Relationship Manager | Backoffice Staff | Staff."),
            ("Status", "VARCHAR(20)", "State", "Active | Inactive."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ]),
        ("TENANT_LICENSES", [
            ("Id", "VARCHAR(20)", "Primary Key", "Unique license entry identifier."),
            ("TenantId", "VARCHAR(20)", "Foreign Key", "References TENANT_MASTER.TenantId."),
            ("LicenseType", "VARCHAR(50)", "Tier", "Starter | Professional | Enterprise."),
            ("StartDate", "DATE", "Validity", "Commencement date of current subscription license."),
            ("EndDate", "DATE", "Validity", "Expiration date of current subscription license."),
            ("Amount", "NUMERIC", "Billing", "Total invoice amount paid for renewal."),
            ("PaymentMode", "VARCHAR(50)", "Billing", "NEFT | RTGS | UPI | Cheque."),
            ("TxnDate", "DATE", "Billing", "Date payment transaction settled."),
            ("IsActive", "BOOLEAN", "State", "True if current active operational license."),
            ("Status", "VARCHAR(20)", "State", "Active | Renewed | Expired."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ]),
        ("DEFAULT_CONFIG", [
            ("Key", "VARCHAR(50)", "Primary Key", "Platform config key (CompanyName, GasDeploymentUrl, GoogleOAuthClientId, etc.)."),
            ("Value", "TEXT", "Setting", "Configuration string or payload."),
            ("Description", "TEXT", "Documentation", "Explanation of functional parameter."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ])
    ]

    for tbl_name, cols in central_schemas:
        doc.add_heading(f"Table: {tbl_name} (Central SaaS DB)", level=3)
        table = doc.add_table(rows=len(cols) + 1, cols=4)
        format_table(table, [Inches(1.8), Inches(1.2), Inches(1.4), Inches(2.4)], header_bg="1e40af")
        table.rows[0].cells[0].paragraphs[0].text = "Column Name"
        table.rows[0].cells[1].paragraphs[0].text = "Data Type"
        table.rows[0].cells[2].paragraphs[0].text = "Constraint / Key"
        table.rows[0].cells[3].paragraphs[0].text = "Description & Rules"
        for r_idx, (cname, ctype, ckey, cdesc) in enumerate(cols):
            row = table.rows[r_idx + 1]
            row.cells[0].paragraphs[0].text = cname
            row.cells[1].paragraphs[0].text = ctype
            row.cells[2].paragraphs[0].text = ckey
            row.cells[3].paragraphs[0].text = cdesc

    doc.add_heading("3.2 Complete Data Dictionary — Tenant Operational Database", level=2)

    tenant_schemas = [
        ("CUSTOMERS", [
            ("CustomerId", "VARCHAR(20)", "Primary Key", "Unique internal client identifier (e.g. CUST_001)."),
            ("CustomerCode", "VARCHAR(20)", "Unique", "External investor reference code."),
            ("FullName", "VARCHAR(100)", "Required", "Complete legal investor name."),
            ("Mobile", "VARCHAR(20)", "Contact", "Primary investor telephone number."),
            ("Email", "VARCHAR(100)", "Contact", "Primary investor email address."),
            ("PanNumber", "VARCHAR(10)", "Tax ID", "Permanent Account Number (mandatory for SEBI/AMFI)."),
            ("AadhaarLast4", "VARCHAR(4)", "KYC", "Masked 4-digit Aadhaar identifier."),
            ("KycStatus", "VARCHAR(20)", "Compliance", "Compliant | Pending | Under Review."),
            ("InvestorCategory", "VARCHAR(30)", "Classification", "Retail | HNI | Corporate | NRI."),
            ("RiskProfile", "VARCHAR(30)", "Advisory", "Conservative | Moderate | Aggressive."),
            ("PanDocUrl / SignDocUrl", "TEXT", "Vault URLs", "Google Drive links to KYC proof artifacts."),
            ("Status", "VARCHAR(20)", "State", "Active | Inactive | Approval Pending."),
            ("Created_Approved_By / At", "AUDIT", "Governance", "Admin identity & timestamp of record approval."),
            ("Approval_History", "TEXT", "Governance", "JSON audit history of all modification reviews."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ]),
        ("CUSTOMER_BANK", [
            ("BankId", "VARCHAR(20)", "Primary Key", "Unique bank record ID."),
            ("CustomerId", "VARCHAR(20)", "Foreign Key", "References CUSTOMERS.CustomerId."),
            ("BankName", "VARCHAR(100)", "Required", "Banking institution name."),
            ("AccountNumber", "VARCHAR(30)", "Required", "Investor bank account number."),
            ("AccountType", "VARCHAR(20)", "Type", "Savings | Current | NRE | NRO."),
            ("IfscCode", "VARCHAR(11)", "Required", "IFSC branch routing code."),
            ("IsPrimary", "BOOLEAN", "Selection", "True if primary bank for redemption / SIP payout."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ]),
        ("CUSTOMER_NOMINEE", [
            ("NomineeId", "VARCHAR(20)", "Primary Key", "Unique nominee record ID."),
            ("CustomerId", "VARCHAR(20)", "Foreign Key", "References CUSTOMERS.CustomerId."),
            ("NomineeName", "VARCHAR(100)", "Required", "Full name of nominee."),
            ("Relation", "VARCHAR(50)", "Required", "Spouse | Child | Parent | Sibling | Other."),
            ("DateOfBirth", "DATE", "Required", "Nominee date of birth."),
            ("SharePercentage", "NUMERIC", "Allocation", "Percentage share allocation (total must equal 100%)."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ]),
        ("EMPLOYEES", [
            ("EmployeeId", "VARCHAR(20)", "Primary Key", "Unique employee identifier (e.g. EMP_001)."),
            ("EmployeeCode", "VARCHAR(20)", "Unique", "Staff registration code."),
            ("FullName", "VARCHAR(100)", "Required", "Staff full legal name."),
            ("Email", "VARCHAR(100)", "Unique", "Corporate staff email address."),
            ("Mobile", "VARCHAR(20)", "Contact", "Official mobile phone number."),
            ("AlternateEmails", "TEXT", "CSV", "Secondary login emails."),
            ("DepartmentId", "VARCHAR(20)", "Master Link", "References MasterDepartments."),
            ("DesignationId", "VARCHAR(20)", "Master Link", "References MasterDesignations."),
            ("Role", "VARCHAR(50)", "RBAC", "Admin | Relationship Manager | Backoffice Staff | Staff."),
            ("Password", "VARCHAR(64)", "SHA-256", "Cryptographic password hash."),
            ("Status", "VARCHAR(20)", "State", "Active | Inactive."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ]),
        ("ROLES_RIGHTS [REDESIGNED]", [
            ("Role", "VARCHAR(50)", "Key", "Role name (e.g. Relationship Manager, Backoffice Staff)."),
            ("UserId", "VARCHAR(50)", "Key", "EMPTY = Role baseline for all users. POPULATED = User custom override."),
            ("Module", "VARCHAR(50)", "Key", "Target module: Dashboard, Customers, Staff, RolesRights, Settings, etc."),
            ("CanView", "BOOLEAN", "Permission", "True if access to view module and its records."),
            ("CanCreate", "BOOLEAN", "Permission", "True if allowed to add new records."),
            ("CanEdit", "BOOLEAN", "Permission", "True if allowed to update existing records."),
            ("CanDelete", "BOOLEAN", "Permission", "True if allowed to delete records."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ]),
        ("COMPANY_SETTINGS", [
            ("CompanyName", "VARCHAR(100)", "Branding", "Tenant organization display name."),
            ("TagLine", "VARCHAR(150)", "Branding", "Tenant sub-brand or tagline."),
            ("ArnNumber", "VARCHAR(50)", "Regulatory", "AMFI registration number."),
            ("SupportEmail", "VARCHAR(100)", "Support", "Customer support contact email."),
            ("AdminApprovalWorkflow", "BOOLEAN", "Governance", "When enabled, non-admin changes require admin approval."),
            ("ApprovalOnAdd / Edit / Delete", "BOOLEAN", "Governance", "Granular approval triggers per operation."),
            ("7 Audit Fields", "AUDIT", "Standard", "Full audit trail.")
        ])
    ]

    for tbl_name, cols in tenant_schemas:
        doc.add_heading(f"Table: {tbl_name} (Tenant Operational DB)", level=3)
        table = doc.add_table(rows=len(cols) + 1, cols=4)
        format_table(table, [Inches(1.8), Inches(1.2), Inches(1.4), Inches(2.4)], header_bg="7e22ce")
        table.rows[0].cells[0].paragraphs[0].text = "Column Name"
        table.rows[0].cells[1].paragraphs[0].text = "Data Type"
        table.rows[0].cells[2].paragraphs[0].text = "Constraint / Key"
        table.rows[0].cells[3].paragraphs[0].text = "Description & Rules"
        for r_idx, (cname, ctype, ckey, cdesc) in enumerate(cols):
            row = table.rows[r_idx + 1]
            row.cells[0].paragraphs[0].text = cname
            row.cells[1].paragraphs[0].text = ctype
            row.cells[2].paragraphs[0].text = ckey
            row.cells[3].paragraphs[0].text = cdesc

    # Section 4: Data Flow Diagrams (DFD)
    doc.add_heading("4. Data Flow Diagrams (DFD)", level=1)
    
    # 4.1 Level 0 Context Diagram
    doc.add_heading("4.1 DFD Level 0 — System Context Diagram", level=2)
    doc.add_paragraph(
        "The Level 0 Context Diagram maps the interactions between the centralized CRM core and external actor entities:"
    )
    dfd0_img = os.path.join(IMG_DIR, "DFD_Level_0_Context_Diagram.png")
    if os.path.exists(dfd0_img):
        doc.add_picture(dfd0_img, width=Inches(6.6))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_cap.add_run("Figure 3: DFD Level 0 — System Context & External Actor Interactions")
        r.font.size = Pt(8.5)
        r.font.italic = True
        r.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph(
        "External Entity Descriptions:\n"
        "1. SuperAdmin (Platform Owner): Manages SaaS subscriptions, onboarded tenants, payment accounts, and global platform defaults.\n"
        "2. Tenant Administrator: Governs tenant staff, reviews approval queues, manages company branding, and assigns role rights.\n"
        "3. Relationship Manager / Staff: Onboards investors, records KYC documents, computes SIP illustrations, and services client requests.\n"
        "4. Investor / Client: Supplies KYC verification artifacts, receives portfolio valuation reports, and tracks investments."
    )

    # 4.2 Level 1 Process Decomposition
    doc.add_heading("4.2 DFD Level 1 — Process Flow Decomposition", level=2)
    doc.add_paragraph(
        "The Level 1 diagram decomposes the application into its primary operational sub-processes and data stores:"
    )
    dfd1_img = os.path.join(IMG_DIR, "DFD_Level_1_Process_Flow.png")
    if os.path.exists(dfd1_img):
        doc.add_picture(dfd1_img, width=Inches(6.8))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_cap.add_run("Figure 4: DFD Level 1 — Sub-Processes, Inter-Process Flows & Data Store Interactions")
        r.font.size = Pt(8.5)
        r.font.italic = True
        r.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph(
        "Process Breakdown:\n"
        "• Process 1.0 (Authentication & Identity): Ingests Google OAuth JWT or username credentials, verifies against D1 (User_Master), and returns verified identity.\n"
        "• Process 2.0 (Workspace & Licensing): Queries Tenant_User_Mapping and Tenant_Licenses in D1. Renders workspace picker if multiple orgs detected; verifies active subscription validity.\n"
        "• Process 3.0 (Tenant Onboarding & Provisioning): Duplicates database template, creates DriveRootFolderId, and seeds baseline records.\n"
        "• Process 4.0 (Customer Management): Manages investor records, bank details, and nominee allocations in D2 (Tenant DB).\n"
        "• Process 5.0 (RBAC & User Privileges): Enforces module access rights. Checks user custom overrides first; falls back to role baseline.\n"
        "• Process 6.0 (Approval Governance): Intercepts non-admin mutations when approval workflow is active, marking status 'Approval Pending' until admin review."
    )

    # Section 5: Standard Operating Procedures (SOP) Quick Guide
    doc.add_heading("5. Operational Guidelines & SOP Matrix", level=1)
    table_sop = doc.add_table(rows=6, cols=3)
    format_table(table_sop, [Inches(1.8), Inches(2.2), Inches(2.8)], header_bg="1e40af")
    table_sop.rows[0].cells[0].paragraphs[0].text = "Procedure / Task"
    table_sop.rows[0].cells[1].paragraphs[0].text = "Execution Vector"
    table_sop.rows[0].cells[2].paragraphs[0].text = "Standard Operating Rule"

    sops = [
        ("New Tenant Setup", "Tenant Master > + Onboard Client", "Create org/<TenantId>/ folder, duplicate template DB, copy IDs into portal, and activate starter license."),
        ("License Renewal", "Tenant Master > Licenses Card", "Select plan tier, enter renewal dates and transaction details, click Save & Activate."),
        ("User Rights Customization", "User Rights > Specific User Mode", "Select user from dropdown, toggle desired module privileges, click SAVE User Permissions. Use Reset to Role Defaults anytime."),
        ("Admin Approval Signoff", "Customers / Staff > Approval Queue", "Admin reviews pending record changes, validates audit history, and marks Approved or Rejected."),
        ("Code Deployment", "Local Terminal: npm run push:gas", "Clasp pushes local .gs files to Google Apps Script cloud deployment. Strictly verify locally before pushing.")
    ]
    for idx, (p, v, r) in enumerate(sops):
        row = table_sop.rows[idx + 1]
        row.cells[0].paragraphs[0].text = p
        row.cells[1].paragraphs[0].text = v
        row.cells[2].paragraphs[0].text = r

    # Save to both file names
    master_path = os.path.join(SOP_DIR, "CRM_Complete_Architecture_Workflow_ERD_DFD.docx")
    doc.save(master_path)

    # Also update 04_DFD_And_ER_Diagrams.docx
    sop04_path = os.path.join(SOP_DIR, "04_DFD_And_ER_Diagrams.docx")
    doc.save(sop04_path)

    return master_path, sop04_path


# ----------------------------------------------------------------------
# 4. EXECUTION
# ----------------------------------------------------------------------
if __name__ == "__main__":
    print("1. Generating high-resolution ER Diagram...")
    erd_path = generate_complete_erd()
    print(f"   ✓ ERD generated: {erd_path}")

    print("2. Generating System Workflow & Architecture Diagram...")
    wf_path = generate_system_workflow_diagram()
    print(f"   ✓ Workflow generated: {wf_path}")

    print("3. Generating DFD Level 0 Context Diagram...")
    dfd0_path = generate_dfd_level_0()
    print(f"   ✓ DFD Level 0 generated: {dfd0_path}")

    print("4. Generating DFD Level 1 Process Diagram...")
    dfd1_path = generate_dfd_level_1()
    print(f"   ✓ DFD Level 1 generated: {dfd1_path}")

    print("5. Generating Master Word Document (.docx)...")
    m_path, s4_path = build_complete_master_sop()
    print(f"   ✓ Master Document generated: {m_path}")
    print(f"   ✓ SOP 04 Updated: {s4_path}")
    print("\nAll technical specifications, diagrams, and docx manuals successfully generated in SOP folder!")
