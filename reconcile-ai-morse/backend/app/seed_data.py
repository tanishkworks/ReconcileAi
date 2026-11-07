"""
Realistic pre-seeded dataset of 30 diverse Indian and Global B2B invoices and bank records.
Distribution:
- 18 Clean invoices that balance mathematically and reconcile cleanly with bank deposits (Attempt #1).
- 6 Partial payments / 10% TDS withholding deductions that balance mathematically but show variance against bank deposits.
- 6 Intentionally corrupted / ambiguous OCR invoices that trigger retry loops and fail deterministic math audit.
"""

from typing import List, Dict, Any

SEED_BANK_LEDGER: List[Dict[str, Any]] = [
    # 18 Clean Records
    {"deposit_id": "DEP-2026-001", "transaction_date": "2026-03-02", "vendor_name": "Cloudflare Inc", "deposit_amount": 2832.00, "reference_no": "ACH-CF-9812", "notes": "Automated monthly infrastructure settlement"},
    {"deposit_id": "DEP-2026-002", "transaction_date": "2026-03-03", "vendor_name": "Amazon Internet Services Pvt Ltd", "deposit_amount": 146910.00, "reference_no": "NEFT-AWS-00412", "notes": "AWS Cloud Hosting Compute & Storage"},
    {"deposit_id": "DEP-2026-003", "transaction_date": "2026-03-04", "vendor_name": "Snowflake India Pvt Ltd", "deposit_amount": 100300.00, "reference_no": "RTGS-SNOW-8819", "notes": "Data Cloud credits consumption"},
    {"deposit_id": "DEP-2026-004", "transaction_date": "2026-03-05", "vendor_name": "Datadog Ireland Ltd", "deposit_amount": 1850.00, "reference_no": "WIRE-DD-7712", "notes": "Observability and APM monitoring tier"},
    {"deposit_id": "DEP-2026-005", "transaction_date": "2026-03-06", "vendor_name": "Razorpay Software Pvt Ltd", "deposit_amount": 45076.00, "reference_no": "IMPS-RZP-3391", "notes": "Gateway settlement and platform access"},
    {"deposit_id": "DEP-2026-006", "transaction_date": "2026-03-07", "vendor_name": "Twilio Ireland Ltd", "deposit_amount": 950.00, "reference_no": "ACH-TW-4921", "notes": "SMS / OTP gateway traffic"},
    {"deposit_id": "DEP-2026-007", "transaction_date": "2026-03-08", "vendor_name": "Info Edge India Ltd", "deposit_amount": 177000.00, "reference_no": "NEFT-IE-9014", "notes": "Naukri enterprise recruitment license"},
    {"deposit_id": "DEP-2026-008", "transaction_date": "2026-03-09", "vendor_name": "Microsoft Operations Pte Ltd", "deposit_amount": 75756.00, "reference_no": "WIRE-MSFT-1284", "notes": "M365 & Azure cognitive services"},
    {"deposit_id": "DEP-2026-009", "transaction_date": "2026-03-10", "vendor_name": "Google Cloud India Pvt Ltd", "deposit_amount": 132160.00, "reference_no": "RTGS-GCP-6619", "notes": "GCP Vertex AI & BigQuery monthly billing"},
    {"deposit_id": "DEP-2026-010", "transaction_date": "2026-03-11", "vendor_name": "GitHub B.V.", "deposit_amount": 2100.00, "reference_no": "ACH-GH-7731", "notes": "GitHub Enterprise Cloud licenses"},
    {"deposit_id": "DEP-2026-011", "transaction_date": "2026-03-12", "vendor_name": "Zoho Corporation Pvt Ltd", "deposit_amount": 49560.00, "reference_no": "NEFT-ZOHO-5521", "notes": "Zoho One Enterprise suite"},
    {"deposit_id": "DEP-2026-012", "transaction_date": "2026-03-13", "vendor_name": "Slack Technologies LLC", "deposit_amount": 1440.00, "reference_no": "WIRE-SLK-4412", "notes": "Slack Enterprise Grid workspace"},
    {"deposit_id": "DEP-2026-013", "transaction_date": "2026-03-14", "vendor_name": "Freshworks Technologies Pvt Ltd", "deposit_amount": 87320.00, "reference_no": "NEFT-FRSH-9921", "notes": "Freshdesk Customer Support seats"},
    {"deposit_id": "DEP-2026-014", "transaction_date": "2026-03-15", "vendor_name": "SendGrid Inc", "deposit_amount": 680.00, "reference_no": "ACH-SG-1102", "notes": "Marketing email delivery pool"},
    {"deposit_id": "DEP-2026-015", "transaction_date": "2026-03-16", "vendor_name": "Tata Communications Ltd", "deposit_amount": 112100.00, "reference_no": "RTGS-TCL-8830", "notes": "Dedicated MPLS lease line Bangalore DC"},
    {"deposit_id": "DEP-2026-016", "transaction_date": "2026-03-17", "vendor_name": "Atlassian Pty Ltd", "deposit_amount": 1600.00, "reference_no": "ACH-ATL-4419", "notes": "Jira Software & Confluence Cloud"},
    {"deposit_id": "DEP-2026-017", "transaction_date": "2026-03-18", "vendor_name": "Postman Inc", "deposit_amount": 1180.00, "reference_no": "WIRE-POST-3321", "notes": "Enterprise API platform licenses"},
    {"deposit_id": "DEP-2026-018", "transaction_date": "2026-03-19", "vendor_name": "Bharti Airtel Ltd", "deposit_amount": 68440.00, "reference_no": "NEFT-AIR-7721", "notes": "Corporate fiber and primary SIP trunk"},

    # 6 TDS / Shortfall Deposit Records (Showing 10% TDS deduction or withholding)
    {"deposit_id": "DEP-2026-019", "transaction_date": "2026-03-20", "vendor_name": "Ernst & Young LLP India", "deposit_amount": 450000.00, "reference_no": "RTGS-EY-9912", "notes": "Statutory audit fees - 10% TDS Sec 194J withheld (₹50,000)"},
    {"deposit_id": "DEP-2026-020", "transaction_date": "2026-03-21", "vendor_name": "Trilegal Law Offices", "deposit_amount": 318600.00, "reference_no": "NEFT-TRI-1192", "notes": "Legal retainer - 10% TDS Sec 194J withheld (₹35,400)"},
    {"deposit_id": "DEP-2026-021", "transaction_date": "2026-03-22", "vendor_name": "Mindtree Solutions Ltd", "deposit_amount": 796500.00, "reference_no": "RTGS-MIND-5521", "notes": "Cloud migration phase 2 - 10% TDS withheld (₹88,500)"},
    {"deposit_id": "DEP-2026-022", "transaction_date": "2026-03-23", "vendor_name": "McKinsey & Company India", "deposit_amount": 1080000.00, "reference_no": "RTGS-MCK-4410", "notes": "Digital roadmap advisory - 10% contractual withholding (₹1,20,000)"},
    {"deposit_id": "DEP-2026-023", "transaction_date": "2026-03-24", "vendor_name": "Deloitte Touche Tohmatsu India", "deposit_amount": 424800.00, "reference_no": "RTGS-DEL-7714", "notes": "SOC2 Type II assessment - 10% TDS withheld (₹47,200)"},
    {"deposit_id": "DEP-2026-024", "transaction_date": "2026-03-25", "vendor_name": "Kroll Cyber Risk Advisory", "deposit_amount": 585000.00, "reference_no": "NEFT-KROL-3321", "notes": "Pen-testing audit - 10% withholding applied (₹65,000)"},
]

SEED_INVOICES: List[Dict[str, Any]] = [
    # 18 Clean Invoices (Pass math audit attempt #1, Match bank deposit exactly)
    {
        "invoice_id": "INV-2026-001",
        "vendor_name": "Cloudflare Inc",
        "invoice_date": "2026-03-01",
        "currency": "USD",
        "line_items": [
            {"description": "Enterprise Edge CDN Bandwidth", "amount": 1800.00},
            {"description": "Advanced DDoS Bot Management", "amount": 600.00}
        ],
        "tax_amount": 432.00,
        "stated_total": 2832.00,
        "category": "clean",
        "raw_text": "CLOUDFLARE INC. Invoice #INV-2026-001\nDate: 01-Mar-2026\n1. Enterprise Edge CDN Bandwidth: $1,800.00\n2. Advanced DDoS Bot Management: $600.00\nSubtotal: $2,400.00\nTax (18%): $432.00\nTotal Due: $2,832.00\nWire to Cloudflare Inc."
    },
    {
        "invoice_id": "INV-2026-002",
        "vendor_name": "Amazon Internet Services Pvt Ltd",
        "invoice_date": "2026-03-02",
        "currency": "INR",
        "line_items": [
            {"description": "Amazon EC2 Elastic Compute Cluster", "amount": 74500.00},
            {"description": "Amazon RDS Multi-AZ PostgreSQL", "amount": 35000.00},
            {"description": "AWS S3 Intelligent Tiering Storage", "amount": 15000.00}
        ],
        "tax_amount": 22410.00,
        "stated_total": 146910.00,
        "category": "clean",
        "raw_text": "AMAZON INTERNET SERVICES PVT LTD\nGSTIN: 29AABCA1234F1Z5\nTax Invoice Ref: INV-2026-002\nDate: 02-Mar-2026\nEC2 Cluster: INR 74,500.00\nRDS PostgreSQL: INR 35,000.00\nS3 Storage: INR 15,000.00\nTaxable: INR 1,24,500.00\nIGST 18%: INR 22,410.00\nTotal Payable: INR 1,46,910.00"
    },
    {
        "invoice_id": "INV-2026-003",
        "vendor_name": "Snowflake India Pvt Ltd",
        "invoice_date": "2026-03-03",
        "currency": "INR",
        "line_items": [
            {"description": "Snowflake Enterprise Warehouse Credits", "amount": 85000.00}
        ],
        "tax_amount": 15300.00,
        "stated_total": 100300.00,
        "category": "clean",
        "raw_text": "SNOWFLAKE INDIA PVT LTD\nTax Invoice: INV-2026-003\nDate: 03-Mar-2026\nLine item: Snowflake Enterprise Warehouse Credits - INR 85,000.00\nGST @ 18%: INR 15,300.00\nNet Amount: INR 1,00,300.00"
    },
    {
        "invoice_id": "INV-2026-004",
        "vendor_name": "Datadog Ireland Ltd",
        "invoice_date": "2026-03-04",
        "currency": "USD",
        "line_items": [
            {"description": "APM Distributed Tracing Hosts (15 units)", "amount": 1200.00},
            {"description": "Log Management Ingestion (5TB)", "amount": 650.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 1850.00,
        "category": "clean",
        "raw_text": "DATADOG IRELAND LIMITED\nInvoice No: INV-2026-004\nDate: 04-Mar-2026\n15x APM Hosts: $1,200.00\nLog Ingestion 5TB: $650.00\nVAT / Tax: $0.00\nGrand Total: $1,850.00"
    },
    {
        "invoice_id": "INV-2026-005",
        "vendor_name": "Razorpay Software Pvt Ltd",
        "invoice_date": "2026-03-05",
        "currency": "INR",
        "line_items": [
            {"description": "Merchant Gateway Processing Fee", "amount": 32000.00},
            {"description": "Smart Routing & Fraud Detection Shield", "amount": 6200.00}
        ],
        "tax_amount": 6876.00,
        "stated_total": 45076.00,
        "category": "clean",
        "raw_text": "RAZORPAY SOFTWARE PVT LTD\nInvoice: INV-2026-005\nDate: 05-Mar-2026\nProcessing Fee: 32,000.00\nFraud Shield: 6,200.00\nSubtotal: 38,200.00\nGST 18%: 6,876.00\nTotal Due: 45,076.00"
    },
    {
        "invoice_id": "INV-2026-006",
        "vendor_name": "Twilio Ireland Ltd",
        "invoice_date": "2026-03-06",
        "currency": "USD",
        "line_items": [
            {"description": "Programmable SMS High-Volume Carrier Gateway", "amount": 750.00},
            {"description": "Voice API Webhook Trunks", "amount": 200.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 950.00,
        "category": "clean",
        "raw_text": "Twilio Ireland - INV-2026-006\nDate: 06-Mar-2026\nSMS Delivery: $750.00\nVoice API: $200.00\nTotal: $950.00"
    },
    {
        "invoice_id": "INV-2026-007",
        "vendor_name": "Info Edge India Ltd",
        "invoice_date": "2026-03-07",
        "currency": "INR",
        "line_items": [
            {"description": "Naukri Resume Database Access & Job Postings", "amount": 150000.00}
        ],
        "tax_amount": 27000.00,
        "stated_total": 177000.00,
        "category": "clean",
        "raw_text": "INFO EDGE (INDIA) LIMITED\nInvoice: INV-2026-007\nDate: 07-Mar-2026\nNaukri Corporate Subscription: INR 1,50,000.00\nGST 18%: INR 27,000.00\nTotal: INR 1,77,000.00"
    },
    {
        "invoice_id": "INV-2026-008",
        "vendor_name": "Microsoft Operations Pte Ltd",
        "invoice_date": "2026-03-08",
        "currency": "INR",
        "line_items": [
            {"description": "Microsoft 365 E5 Enterprise Suite", "amount": 42000.00},
            {"description": "Azure OpenAI GPT-4 Deployment Instances", "amount": 22200.00}
        ],
        "tax_amount": 11556.00,
        "stated_total": 75756.00,
        "category": "clean",
        "raw_text": "MICROSOFT OPERATIONS PTE LTD\nInvoice: INV-2026-008\nDate: 08-Mar-2026\nM365 E5: INR 42,000.00\nAzure OpenAI: INR 22,200.00\nGST: INR 11,556.00\nTotal: INR 75,756.00"
    },
    {
        "invoice_id": "INV-2026-009",
        "vendor_name": "Google Cloud India Pvt Ltd",
        "invoice_date": "2026-03-09",
        "currency": "INR",
        "line_items": [
            {"description": "Google Vertex AI Foundation Model Queries", "amount": 62000.00},
            {"description": "BigQuery Analysis Slots & Storage", "amount": 50000.00}
        ],
        "tax_amount": 20160.00,
        "stated_total": 132160.00,
        "category": "clean",
        "raw_text": "GOOGLE CLOUD INDIA PVT LTD\nInvoice: INV-2026-009\nDate: 09-Mar-2026\nVertex AI: INR 62,000.00\nBigQuery: INR 50,000.00\nGST 18%: INR 20,160.00\nTotal Due: INR 1,32,160.00"
    },
    {
        "invoice_id": "INV-2026-010",
        "vendor_name": "GitHub B.V.",
        "invoice_date": "2026-03-10",
        "currency": "USD",
        "line_items": [
            {"description": "GitHub Enterprise 100 User Seats", "amount": 2100.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 2100.00,
        "category": "clean",
        "raw_text": "GITHUB B.V. - Amsterdam\nInvoice: INV-2026-010\nDate: 10-Mar-2026\n100 Enterprise Seats: $2,100.00\nTax: $0.00\nBalance Due: $2,100.00"
    },
    {
        "invoice_id": "INV-2026-011",
        "vendor_name": "Zoho Corporation Pvt Ltd",
        "invoice_date": "2026-03-11",
        "currency": "INR",
        "line_items": [
            {"description": "Zoho Books & Expense Automation", "amount": 22000.00},
            {"description": "Zoho CRM Plus Annual Seats", "amount": 20000.00}
        ],
        "tax_amount": 7560.00,
        "stated_total": 49560.00,
        "category": "clean",
        "raw_text": "ZOHO CORPORATION PVT LTD\nInvoice: INV-2026-011\nDate: 11-Mar-2026\nZoho Books: 22,000.00\nZoho CRM Plus: 20,000.00\nGST 18%: 7,560.00\nTotal: 49,560.00"
    },
    {
        "invoice_id": "INV-2026-012",
        "vendor_name": "Slack Technologies LLC",
        "invoice_date": "2026-03-12",
        "currency": "USD",
        "line_items": [
            {"description": "Slack Enterprise Grid Subscription", "amount": 1440.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 1440.00,
        "category": "clean",
        "raw_text": "SLACK TECHNOLOGIES LLC\nInvoice: INV-2026-012\nDate: 12-Mar-2026\nEnterprise Grid: $1,440.00\nTax: $0.00\nTotal: $1,440.00"
    },
    {
        "invoice_id": "INV-2026-013",
        "vendor_name": "Freshworks Technologies Pvt Ltd",
        "invoice_date": "2026-03-13",
        "currency": "INR",
        "line_items": [
            {"description": "Freshdesk Omnichannel Support Suite", "amount": 74000.00}
        ],
        "tax_amount": 13320.00,
        "stated_total": 87320.00,
        "category": "clean",
        "raw_text": "FRESHWORKS TECHNOLOGIES PVT LTD\nInvoice: INV-2026-013\nDate: 13-Mar-2026\nFreshdesk Omnichannel: INR 74,000.00\nGST 18%: INR 13,320.00\nTotal: INR 87,320.00"
    },
    {
        "invoice_id": "INV-2026-014",
        "vendor_name": "SendGrid Inc",
        "invoice_date": "2026-03-14",
        "currency": "USD",
        "line_items": [
            {"description": "Dedicated IP & 2M Email Tier", "amount": 680.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 680.00,
        "category": "clean",
        "raw_text": "SENDGRID (TWILIO)\nInvoice: INV-2026-014\nDate: 14-Mar-2026\nDedicated Email Pool: $680.00\nTax: $0.00\nTotal: $680.00"
    },
    {
        "invoice_id": "INV-2026-015",
        "vendor_name": "Tata Communications Ltd",
        "invoice_date": "2026-03-15",
        "currency": "INR",
        "line_items": [
            {"description": "Bangalore DC Dedicated Leased Line 1Gbps", "amount": 95000.00}
        ],
        "tax_amount": 17100.00,
        "stated_total": 112100.00,
        "category": "clean",
        "raw_text": "TATA COMMUNICATIONS LIMITED\nInvoice: INV-2026-015\nDate: 15-Mar-2026\nDedicated Leased Line: INR 95,000.00\nGST 18%: INR 17,100.00\nTotal: INR 1,12,100.00"
    },
    {
        "invoice_id": "INV-2026-016",
        "vendor_name": "Atlassian Pty Ltd",
        "invoice_date": "2026-03-16",
        "currency": "USD",
        "line_items": [
            {"description": "Jira Software Cloud 200 Users", "amount": 1100.00},
            {"description": "Confluence Cloud 200 Users", "amount": 500.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 1600.00,
        "category": "clean",
        "raw_text": "ATLASSIAN PTY LTD\nInvoice: INV-2026-016\nDate: 16-Mar-2026\nJira Cloud: $1,100.00\nConfluence Cloud: $500.00\nTotal: $1,600.00"
    },
    {
        "invoice_id": "INV-2026-017",
        "vendor_name": "Postman Inc",
        "invoice_date": "2026-03-17",
        "currency": "USD",
        "line_items": [
            {"description": "Postman Enterprise Workspace API Suite", "amount": 1180.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 1180.00,
        "category": "clean",
        "raw_text": "POSTMAN INC\nInvoice: INV-2026-017\nDate: 17-Mar-2026\nEnterprise Workspace: $1,180.00\nTax: $0.00\nTotal: $1,180.00"
    },
    {
        "invoice_id": "INV-2026-018",
        "vendor_name": "Bharti Airtel Ltd",
        "invoice_date": "2026-03-18",
        "currency": "INR",
        "line_items": [
            {"description": "Airtel Corporate Leased Line Bandwidth", "amount": 38000.00},
            {"description": "SIP Trunk 60 Channels Call Bundle", "amount": 20000.00}
        ],
        "tax_amount": 10440.00,
        "stated_total": 68440.00,
        "category": "clean",
        "raw_text": "BHARTI AIRTEL LIMITED\nInvoice: INV-2026-018\nDate: 18-Mar-2026\nLeased Line: INR 38,000.00\nSIP Trunk: INR 20,000.00\nGST 18%: INR 10,440.00\nTotal: INR 68,440.00"
    },

    # 6 Partial Payments / 10% TDS Deductions (Pass math audit, variance in bank ledger)
    {
        "invoice_id": "INV-2026-019",
        "vendor_name": "Ernst & Young LLP India",
        "invoice_date": "2026-03-19",
        "currency": "INR",
        "line_items": [
            {"description": "Statutory Financial Audit Retainer Fee", "amount": 350000.00},
            {"description": "Direct & International Tax Advisory", "amount": 73728.81}
        ],
        "tax_amount": 76271.19,
        "stated_total": 500000.00,
        "category": "shortfall_tds",
        "raw_text": "ERNST & YOUNG LLP INDIA\nTax Invoice: INV-2026-019\nDate: 19-Mar-2026\nStatutory Audit: INR 3,50,000.00\nTax Advisory: INR 73,728.81\nGST: INR 76,271.19\nGross Invoice Amount: INR 5,00,000.00\n(Subject to 10% TDS under Section 194J)"
    },
    {
        "invoice_id": "INV-2026-020",
        "vendor_name": "Trilegal Law Offices",
        "invoice_date": "2026-03-20",
        "currency": "INR",
        "line_items": [
            {"description": "Corporate Governance & Regulatory Counsel", "amount": 200000.00},
            {"description": "M&A Financing Documentation Review", "amount": 100000.00}
        ],
        "tax_amount": 54000.00,
        "stated_total": 354000.00,
        "category": "shortfall_tds",
        "raw_text": "TRILEGAL LAW OFFICES\nInvoice: INV-2026-020\nDate: 20-Mar-2026\nCorporate Counsel: INR 2,00,000.00\nM&A Documentation: INR 1,00,000.00\nGST 18%: INR 54,000.00\nTotal Billed: INR 3,54,000.00"
    },
    {
        "invoice_id": "INV-2026-021",
        "vendor_name": "Mindtree Solutions Ltd",
        "invoice_date": "2026-03-21",
        "currency": "INR",
        "line_items": [
            {"description": "Cloud Microservices Architecture Migration", "amount": 500000.00},
            {"description": "CI/CD Kubernetes Hardening Sprints", "amount": 250000.00}
        ],
        "tax_amount": 135000.00,
        "stated_total": 885000.00,
        "category": "shortfall_tds",
        "raw_text": "MINDTREE SOLUTIONS LTD\nInvoice: INV-2026-021\nDate: 21-Mar-2026\nCloud Microservices: INR 5,00,000.00\nK8s Hardening: INR 2,50,000.00\nGST 18%: INR 1,35,000.00\nTotal Due: INR 8,85,000.00"
    },
    {
        "invoice_id": "INV-2026-022",
        "vendor_name": "McKinsey & Company India",
        "invoice_date": "2026-03-22",
        "currency": "INR",
        "line_items": [
            {"description": "Strategic Omnichannel Market Expansion", "amount": 1016949.15}
        ],
        "tax_amount": 183050.85,
        "stated_total": 1200000.00,
        "category": "shortfall_tds",
        "raw_text": "MCKINSEY & COMPANY INDIA\nInvoice: INV-2026-022\nDate: 22-Mar-2026\nAdvisory Engagement: INR 10,16,949.15\nGST 18%: INR 1,83,050.85\nTotal Payable: INR 12,00,000.00"
    },
    {
        "invoice_id": "INV-2026-023",
        "vendor_name": "Deloitte Touche Tohmatsu India",
        "invoice_date": "2026-03-23",
        "currency": "INR",
        "line_items": [
            {"description": "SOC2 Type II Readiness & Pen Testing", "amount": 400000.00}
        ],
        "tax_amount": 72000.00,
        "stated_total": 472000.00,
        "category": "shortfall_tds",
        "raw_text": "DELOITTE TOUCHE TOHMATSU INDIA\nInvoice: INV-2026-023\nDate: 23-Mar-2026\nSOC2 Engagement: INR 4,00,000.00\nGST 18%: INR 72,000.00\nTotal: INR 4,72,000.00"
    },
    {
        "invoice_id": "INV-2026-024",
        "vendor_name": "Kroll Cyber Risk Advisory",
        "invoice_date": "2026-03-24",
        "currency": "INR",
        "line_items": [
            {"description": "Threat Modeling & Red Team Infiltration Test", "amount": 550847.46}
        ],
        "tax_amount": 99152.54,
        "stated_total": 650000.00,
        "category": "shortfall_tds",
        "raw_text": "KROLL CYBER RISK ADVISORY\nInvoice: INV-2026-024\nDate: 24-Mar-2026\nPenetration Test: INR 5,50,847.46\nGST: INR 99,152.54\nTotal Due: INR 6,50,000.00"
    },

    # 6 Intentionally Corrupted / Ambiguous Invoices (Trigger retry loops & fail deterministic math audit)
    {
        "invoice_id": "INV-2026-025",
        "vendor_name": "Apex Logistics Services",
        "invoice_date": "2026-03-25",
        "currency": "INR",
        "line_items": [
            {"description": "Interstate Freight Dispatch MH-KA", "amount": 32000.00},
            {"description": "Pallet Handling & Cold Chain Storage", "amount": 16500.00}
        ],
        "tax_amount": 8730.00,
        "stated_total": 62400.00,  # Line sum 48,500 + tax 8,730 = 57,230. Discrepancy = 5,170.00
        "category": "corrupted_math_fail",
        "raw_text": "[CORRUPTED OCR SCAN]\nAPEX LOG1STICS SERVIC3S\nInv Ref: INV-2026-025\nDate: 25/03/2026\nLine 1: 32000.00\nLine 2: 16500.00\nTax: 8730.00\nTOTAL AMOUNT DUE: INR 62,400.00 [MISMATCH: 57,230 calculated vs 62,400 stated]"
    },
    {
        "invoice_id": "INV-2026-026",
        "vendor_name": "Global Hardware Supplies",
        "invoice_date": "2026-03-26",
        "currency": "USD",
        "line_items": [
            {"description": "CAT6 Ethernet Spools (10x)", "amount": 340.00},
            {"description": "Rack Mount Patch Panels", "amount": 4.00}  # OCR dropped '00' from 400.00
        ],
        "tax_amount": 50.00,
        "stated_total": 790.00,  # Line sum 344 + 50 = 394 vs 790 stated
        "category": "corrupted_math_fail",
        "raw_text": "[BLURRED THERMAL RECEIPT]\nGLOBAL HARDWARE SUPPLIES LLC\nDoc #INV-2026-026\nDate: 26-Mar-2026\n* CAT6 Spools: $340.00\n* Patch Panels: $4.00 (smudged digit)\nTax: $50.00\nTotal Due: $790.00"
    },
    {
        "invoice_id": "INV-2026-027",
        "vendor_name": "Pacific Print & Paper Co",
        "invoice_date": "2026-03-27",
        "currency": "INR",
        "line_items": [
            {"description": "Marketing Brochures Q1 Run", "amount": 12000.00},
            {"description": "Custom Folders & Letterheads", "amount": 6000.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 28000.00,  # Line sum 18,000 vs 28,000 stated (bleed-through artifact)
        "category": "corrupted_math_fail",
        "raw_text": "PACIFIC PRINT & PAPER CO\nInvoice: INV-2026-027\nDate: 27-Mar-2026\nBrochures: 12,000.00\nFolders: 6,000.00\nTotal Payable: 28,000.00 [Scanner bleed-through artifact detected]"
    },
    {
        "invoice_id": "INV-2026-028",
        "vendor_name": "Metro Facilities Management",
        "invoice_date": "2026-03-28",
        "currency": "INR",
        "line_items": [
            {"description": "Office Sanitation & Janitorial Services", "amount": 22000.00},
            {"description": "HVAC Air Conditioning Maintenance", "amount": 10000.00}
        ],
        "tax_amount": 0.00,
        "stated_total": 55000.00,  # Missing line item truncated by scanner edge
        "category": "corrupted_math_fail",
        "raw_text": "[TRUNCATED PDF MARGIN]\nMETRO FACILITIES MGT\nINV-2026-028\nSanitation: 22,000.00\nHVAC: 10,000.00\n[Line 3 cut off by scanner feed]\nStated Total: INR 55,000.00"
    },
    {
        "invoice_id": "INV-2026-029",
        "vendor_name": "Quantum IT Peripherals",
        "invoice_date": "2026-03-29",
        "currency": "INR",
        "line_items": [
            {"description": "Ergonomic Keyboards & Mice (15 units)", "amount": 15000.00}
        ],
        "tax_amount": 1200.00,
        "stated_total": 22500.00,  # Sum 16,200 vs 22,500 stated
        "category": "corrupted_math_fail",
        "raw_text": "QUANTUM IT PERIPHERALS\nRef: INV-2026-029\nPeripherals: 15,000.00\nTax: 1,200.00\nTotal Claimed: 22,500.00 [Unreconciled surcharge]"
    },
    {
        "invoice_id": "INV-2026-030",
        "vendor_name": "Unknown Ghost Vendor Ltd",
        "invoice_date": "2026-03-30",
        "currency": "INR",
        "line_items": [
            {"description": "Unspecified Cloud Strategy Audit", "amount": 40000.00}
        ],
        "tax_amount": 5000.00,
        "stated_total": 94500.00,  # Sum 45,000 vs 94,500 stated
        "category": "corrupted_math_fail",
        "raw_text": "[GARBLED OCR METADATA]\nUNKNOWN GHOST VENDOR LTD\nInvoice: INV-2026-030\nItem: 40000.00\nTax: 5000.00\nTotal: 94,500.00"
    }
]
