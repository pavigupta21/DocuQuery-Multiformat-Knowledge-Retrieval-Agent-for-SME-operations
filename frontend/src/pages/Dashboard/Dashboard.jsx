import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  FileSpreadsheet, 
  MailCheck, 
  CheckCircle2, 
  Ticket, 
  AlertTriangle,
  Clock,
  Download,
  UploadCloud,
  Check,
  X,
  Trash2
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ user, activeModal, setActiveModal }) => {
  const [query, setQuery] = useState("What is our refund policy for bulk orders quoted to Acme Corp last month?");
  const [hasSearched, setHasSearched] = useState(true);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Ingested Documents State
  const [documents, setDocuments] = useState([
    { id: 1, name: "Refund_Policy_2026.pdf", type: "pdf", size: "1.4 MB", chunks: 18, date: "2026-05-10", status: "Indexed" },
    { id: 2, name: "Acme_Quotes.xlsx", type: "excel", size: "850 KB", chunks: 42, date: "2026-05-14", status: "Indexed" },
    { id: 3, name: "Email_Thread_892.eml", type: "email", size: "320 KB", chunks: 8, date: "2026-05-18", status: "Indexed" }
  ]);

  // Support Tickets History State
  const [tickets, setTickets] = useState([
    { 
      id: "T-8821", 
      customer: "Acme Corp", 
      category: "Bulk Order Refund Resolution", 
      date: "May 18, 2026",
      status: "Submitted",
      citations: "Refund_Policy_2026.pdf (p.4), Acme_Quotes.xlsx (Row 14)"
    },
    { 
      id: "T-8820", 
      customer: "Stark Industries", 
      category: "Enterprise SLA Inquiry", 
      date: "May 12, 2026",
      status: "Resolved",
      citations: "SLA_Agreement_2026.pdf (p.12)"
    }
  ]);

  const [uploadMessage, setUploadMessage] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
    }
  };

  // Simulate Document Upload
  const handleFileUpload = (type, defaultName) => {
    const newDoc = {
      id: Date.now(),
      name: defaultName,
      type: type,
      size: `${(Math.random() * 2 + 0.2).toFixed(1)} MB`,
      chunks: Math.floor(Math.random() * 35) + 5,
      date: new Date().toISOString().split('T')[0],
      status: "Indexed"
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setUploadMessage(`Successfully ingested and indexed ${defaultName}!`);
    setTimeout(() => setUploadMessage(""), 4000);
  };

  const handleDeleteDocument = (id) => {
    setDocuments((prev) => prev.filter(doc => doc.id !== id));
  };

  const handleCreateTicketSubmit = () => {
    setTicketSubmitted(true);
    const newTicket = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: "Acme Corp",
      category: "Bulk Order Refund Resolution",
      date: "Just Now",
      status: "Submitted",
      citations: "Refund_Policy_2026.pdf (p.4), Acme_Quotes.xlsx (Row 14)"
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Welcome */}
      <div className="dashboard-header-simple">
        <div className="dashboard-welcome">
          <h2>Welcome back, {user?.name || user?.full_name || 'SME Employee'}!</h2>
          <p>Retrieve evidence, upload SME business files, and generate trusted support tickets.</p>
        </div>
      </div>

      {/* 1. MULTI-FORMAT DOCUMENT INGESTION HUB */}
      <section className="ingestion-hub-section">
        <div className="ingestion-hub-header">
          <div className="ingestion-title-group">
            <UploadCloud size={22} color="#6366f1" />
            <div>
              <h3 className="ingestion-title">Multi-Format Document Ingestion Hub</h3>
              <p className="ingestion-subtitle">Upload business PDFs, Excel pricing sheets, or Email threads into RAG Vector Search</p>
            </div>
          </div>
          {uploadMessage && (
            <span style={{ fontSize: '0.825rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={16} /> {uploadMessage}
            </span>
          )}
        </div>

        {/* 3 Upload Format Options Grid */}
        <div className="upload-cards-grid">
          {/* PDF Upload Option */}
          <div 
            className="upload-dropzone-card pdf"
            onClick={() => handleFileUpload('pdf', `Policy_Doc_${Math.floor(Math.random()*100)}.pdf`)}
          >
            <div className="upload-icon-circle">
              <FileText size={22} />
            </div>
            <span className="upload-type-title">Upload PDF Policies</span>
            <span className="upload-type-desc">Drop company policy manuals, contract terms, or SLA documents (.pdf)</span>
          </div>

          {/* Excel Upload Option */}
          <div 
            className="upload-dropzone-card excel"
            onClick={() => handleFileUpload('excel', `Pricing_Quotes_${Math.floor(Math.random()*100)}.xlsx`)}
          >
            <div className="upload-icon-circle">
              <FileSpreadsheet size={22} />
            </div>
            <span className="upload-type-title">Upload Excel Sheets</span>
            <span className="upload-type-desc">Drop bulk quotation tables, inventory spreadsheets, or rate sheets (.xlsx, .csv)</span>
          </div>

          {/* Email Upload Option */}
          <div 
            className="upload-dropzone-card email"
            onClick={() => handleFileUpload('email', `Customer_Thread_${Math.floor(Math.random()*100)}.eml`)}
          >
            <div className="upload-icon-circle">
              <MailCheck size={22} />
            </div>
            <span className="upload-type-title">Upload Email Threads</span>
            <span className="upload-type-desc">Import customer support emails, quote threads, or message archives (.eml, .txt)</span>
          </div>
        </div>

        {/* Active Indexed Files Row */}
        <div className="active-documents-bar">
          <div className="active-doc-header">
            <span>Currently Active Indexed Sources ({documents.length} Files)</span>
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
              onClick={() => setActiveModal('documents')}
            >
              View All Ingested Files →
            </button>
          </div>

          <div className="active-docs-list">
            {documents.map((doc) => (
              <div key={doc.id} className={`doc-chip ${doc.type}`}>
                {doc.type === 'pdf' && <FileText size={14} />}
                {doc.type === 'excel' && <FileSpreadsheet size={14} />}
                {doc.type === 'email' && <MailCheck size={14} />}
                <span>{doc.name}</span>
                <Check className="status-check-icon" size={14} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MAIN RAG SEARCH & HISTORY GRID */}
      <div className="dashboard-grid-layout">
        <div className="main-search-panel">
          {/* Query Input Bar */}
          <div className="search-query-section">
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <Search className="search-icon-inside" size={20} />
              <input
                type="text"
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about PDF policies, Excel quotes, or email threads..."
              />
              <button type="submit" className="btn-ask-query">
                <Sparkles size={16} />
                Ask RAG
              </button>
            </form>
          </div>

          {/* RAG Answer & Evidence Panel */}
          {hasSearched && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
              
              {/* Conflict Detection Banner */}
              <div className="conflict-banner">
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div className="conflict-content">
                  <span className="conflict-title">Conflict Detected & Auto-Resolved</span>
                  <span>
                    Compared 2026 Refund Policy (May 2026) against 2024 Archival Standard. 
                    Prioritized <strong>2026 Policy PDF (most recent source date)</strong>.
                  </span>
                </div>
              </div>

              {/* RAG Results Card */}
              <div className="answer-preview-card">
                <div className="answer-header">
                  <div className="answer-title-group">
                    <CheckCircle2 size={20} />
                    Retrieved Answer & Trusted Evidence
                  </div>
                  
                  <div className="answer-header-actions">
                    <span className="confidence-badge">98% Citation Match</span>
                    <button 
                      className="btn-crm-ticket"
                      onClick={() => {
                        setTicketSubmitted(false);
                        setActiveModal('ticket-create');
                      }}
                    >
                      <Ticket size={14} />
                      Auto-Populate CRM Ticket
                    </button>
                  </div>
                </div>

                <p className="answer-body">
                  Based on <strong>Refund_Policy_2026.pdf (Page 4)</strong> and recent quotation in <strong>Acme_Quotes.xlsx (Row 14)</strong>, bulk orders over 50 units receive a <strong>30-day money-back guarantee with a 5% restocking fee</strong>. Email thread #892 from May 18 confirms Acme Corp was granted standard bulk refund terms.
                </p>

                <span className="citations-header">Exact Source Attribution (3 Evidence Items)</span>

                <div className="citations-grid">
                  <div className="citation-card pdf">
                    <span className="citation-source-type">
                      <FileText size={14} /> PDF Policy (Page 4)
                    </span>
                    <p className="citation-excerpt">
                      “Section 4.2: Bulk returns requested within 30 days are subject to a 5% processing fee...”
                    </p>
                  </div>

                  <div className="citation-card excel">
                    <span className="citation-source-type">
                      <FileSpreadsheet size={14} /> Excel Quote (Sheet: May 2026)
                    </span>
                    <p className="citation-excerpt">
                      “Acme Corp Quote #AC-992 | 100 Units | Discount: 15% | Terms: Standard 30-Day Guarantee”
                    </p>
                  </div>

                  <div className="citation-card email">
                    <span className="citation-source-type">
                      <MailCheck size={14} /> Email Thread #892
                    </span>
                    <p className="citation-excerpt">
                      “Re: Acme Corp Bulk Refund Request - Approved by Sales Lead on May 18”
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right Sidebar: Employee Conversation History */}
        <aside className="history-sidebar">
          <div className="sidebar-title">
            <Clock size={16} />
            Recent Query History
          </div>

          <div className="history-list">
            <div className="history-item active">
              Acme Corp bulk refund policy
            </div>
            <div className="history-item">
              Q3 Enterprise SLA response time
            </div>
            <div className="history-item">
              Vendor payment terms in Excel
            </div>
            <div className="history-item">
              Remote work equipment reimbursement
            </div>
          </div>
        </aside>
      </div>

      {/* ==========================================================================
         MODAL 1: ALL UPLOADED DOCUMENTS (From Top Right Dropdown)
         ========================================================================== */}
      {activeModal === 'documents' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <FileText size={20} color="#6366f1" />
                All Uploaded & Ingested Documents
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              These files have been cleaned, chunked into vector embeddings, and indexed for DocuQuery RAG pipeline search.
            </p>

            <table className="doc-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Format</th>
                  <th>Size</th>
                  <th>Vector Chunks</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 700 }}>{doc.name}</td>
                    <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{doc.type}</td>
                    <td>{doc.size}</td>
                    <td>{doc.chunks} Chunks</td>
                    <td>
                      <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>Indexed</span>
                    </td>
                    <td>
                      <button 
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL 2: SUPPORT TICKETS LIST (From Top Right Dropdown)
         ========================================================================== */}
      {activeModal === 'tickets' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Ticket size={20} color="#8b5cf6" />
                SME Customer Support Tickets
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Support tickets auto-populated from RAG retrieval evidence for customer issue resolution.
            </p>

            <table className="doc-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Citations Used</th>
                  <th>Status</th>
                  <th>PDF Export</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{t.id}</td>
                    <td style={{ fontWeight: 600 }}>{t.customer}</td>
                    <td>{t.category}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.citations}</td>
                    <td>
                      <span style={{ color: t.status === 'Resolved' ? '#10b981' : '#c084fc', fontWeight: 700, fontSize: '0.75rem' }}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => alert(`Downloading PDF Ticket ${t.id} generated via ReportLab...`)}
                      >
                        <Download size={12} style={{ marginRight: 4 }} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL 3: CRM SUPPORT TICKET CREATION
         ========================================================================== */}
      {activeModal === 'ticket-create' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <Ticket size={20} color="#8b5cf6" />
                Mocked CRM Support Ticket Auto-Populated
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            {ticketSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Support Ticket #T-8821 Created!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Retrieved RAG evidence and citations stored in ticket database.
                </p>
                <button 
                  className="btn-primary" 
                  style={{ margin: '1.5rem auto 0 auto' }}
                  onClick={() => setActiveModal(null)}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="ticket-field-group">
                  <label className="ticket-field-label">Customer / Enterprise Name</label>
                  <input className="ticket-field-input" defaultValue="Acme Corp" readOnly />
                </div>

                <div className="ticket-field-group">
                  <label className="ticket-field-label">Support Ticket Category</label>
                  <input className="ticket-field-input" defaultValue="Bulk Order Refund Resolution" readOnly />
                </div>

                <div className="ticket-field-group">
                  <label className="ticket-field-label">RAG Evidence & Source Citations Summary</label>
                  <textarea 
                    className="ticket-field-textarea" 
                    rows={4}
                    defaultValue="Refund approved per Refund_Policy_2026.pdf (p.4) and Acme_Quotes.xlsx (Row 14). Terms: 30-day guarantee with 5% restocking fee."
                    readOnly
                  />
                </div>

                <div className="ticket-modal-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      alert("Downloading PDF Support Ticket generated via ReportLab mockup...");
                    }}
                  >
                    <Download size={14} style={{ marginRight: 4 }} />
                    Download PDF Ticket
                  </button>

                  <button 
                    className="btn-primary"
                    onClick={handleCreateTicketSubmit}
                  >
                    Submit Ticket to CRM
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
