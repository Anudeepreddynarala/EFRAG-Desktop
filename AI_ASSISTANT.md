# AI Assistant - Setup and Usage Guide

## Overview

The EFRAG Desktop AI Assistant helps you automatically extract sustainability data from your documents and fill out the VSME form. This feature is completely **local** and **private** - your data never leaves your computer.

## 🔒 Privacy First

- **100% Local Processing**: All AI computations happen on your computer
- **No Internet Required**: Works offline after initial setup
- **No External APIs**: Zero data transmission to external servers
- **No Telemetry**: No usage tracking or data collection
- **Business Safe**: Suitable for confidential corporate data

## ✨ Key Features

### Zero Hallucination Policy
The AI follows a strict "zero hallucination" policy:
- **Never guesses** or makes up data
- **Only extracts** explicitly stated facts
- **Provides sources** for every value
- **Reports what's missing** clearly
- **Flags uncertain data** for review

### Complete Transparency
Every extracted value includes:
- Exact quote from your document
- Source reference (filename, page, section)
- Confidence score (0-100%)
- Review flag if confidence is low

---

## 📋 Prerequisites

### System Requirements

**Minimum (Ultra-light models):**
- 4GB RAM
- 2GB disk space for AI model
- Dual-core CPU

**Recommended (Balanced models):**
- 8GB RAM
- 5GB disk space
- Quad-core CPU

**Optimal (High-performance models):**
- 16GB+ RAM
- 10GB disk space
- Modern multi-core CPU

### Supported Document Types
- **PDF** - Annual reports, sustainability reports
- **TXT** - Plain text documents
- **CSV** - Structured data tables
- **JSON** - Structured data
- **DOCX** - Word documents (experimental)

---

## 🚀 Setup Guide

### Step 1: Access AI Assistant

1. Open EFRAG Desktop
2. Navigate to VSME Form
3. Click the **"Use AI Assistant (Experimental)"** button
4. The setup wizard will open

### Step 2: System Detection

The app will automatically detect:
- Your total RAM
- Available memory
- CPU cores
- Recommended AI model tier

**Model Tiers:**
- **Ultra-light** (4-8GB RAM): 1.7-2GB models - Good for basic extraction
- **Balanced** (8-16GB RAM): 4-5GB models - Best balance of speed and accuracy
- **High-performance** (16GB+ RAM): 7-8GB models - Maximum accuracy

### Step 3: Choose AI Model

Based on your system, you'll see recommended models:

**Ultra-light Tier:**
- **Qwen 2.5 3B** (2.0GB) - Recommended for limited RAM
- Gemma 2B (1.7GB) - Backup option

**Balanced Tier:**
- **Mistral 7B** (4.4GB) - Best for structured data extraction
- Qwen 2.5 7B (4.7GB) - Superior extraction accuracy

**High-Performance Tier:**
- **Qwen 2.5 14B** (8.2GB) - Maximum accuracy
- Mistral Nemo 12B (7.1GB) - Advanced extraction with multilingual support

All models are **optimized specifically for data extraction tasks**.

### Step 4: Install Jan

Jan is the AI backend that runs the models. It's user-friendly with no command line needed.

**Installation Steps:**
1. Click "Open Download Page" button
2. Download Jan for your platform (macOS/Windows)
3. Install Jan (drag to Applications on macOS)
4. Open Jan application
5. Download your chosen model from Jan's Hub
6. Enable API server in Jan settings

**Jan Setup in Detail:**

1. **Open Jan** after installation
2. **Go to Hub tab** in Jan
3. **Search for your model** (e.g., "Mistral 7B" or "Qwen 2.5 3B")
4. **Click Download** and wait for it to finish
5. **Go to Settings > Advanced**
6. **Enable "API Server"**
7. Default port is 1337 (leave as is)
8. Server should show as "Running"

### Step 5: Connect

Back in EFRAG Desktop:
1. Click "I've Installed It - Let's Go!"
2. The app will connect to Jan automatically
3. You'll see "✓ AI Connected - Ready to assist"

---

## 📄 Using the AI Assistant

### Upload Documents

1. Click **"Use AI Assistant"** button
2. Choose **"Upload Files"** tab
3. Either:
   - Drag and drop files into the upload area
   - Click to browse and select files
4. Upload multiple files if needed
5. Review the list of uploaded files
6. Click **"Analyze with AI"**

### Paste Text

1. Click **"Use AI Assistant"** button
2. Choose **"Paste Text"** tab
3. Paste your sustainability report text
4. Click **"Analyze with AI"**

### Review Results

After analysis, you'll see:

**✅ Successfully Extracted Fields**
```
Company Name: "Acme Corporation"
Source: annual_report.pdf, page 3
Confidence: 95%
Quote: "Acme Corporation is a leading..."

GHG Scope 1 Emissions: "1,250 tCO2e"
Source: sustainability_report.pdf, page 12
Confidence: 90%
Quote: "Total Scope 1 emissions: 1,250 tCO2e"
```

**❌ Fields Not Found**
- Water consumption
- Waste generation
- Employee turnover rate

**⚠️ Needs Review**
- Board diversity (Confidence: 65% - multiple references found)
- Renewable energy % (Confidence: 55% - unclear unit)

### Accept or Edit Values

1. Review each extracted value
2. Check the source quote
3. Options:
   - **Accept**: Value is correct, add to form
   - **Edit**: Modify before adding
   - **Reject**: Don't use this value
4. Values marked "Needs Review" should be carefully verified

### Missing Data

For fields not found:
- You'll need to enter them manually
- The AI will list all missing fields
- Consider uploading additional documents

---

## 💡 Best Practices

### Document Preparation

**For Best Results:**
- Use clear, well-formatted documents
- Include sustainability/annual reports
- PDFs with text (not just scanned images)
- Multiple years of data increase accuracy

**Supported Content:**
- Structured tables and data
- Plain text descriptions
- Financial statements
- ESG/Sustainability sections

**Less Reliable:**
- Scanned images (OCR not yet supported)
- Heavily formatted documents
- Charts and graphs (no image analysis yet)
- Handwritten notes

### Multiple Documents

Upload different types for comprehensive extraction:
1. Annual Report - General company info
2. Sustainability Report - Environmental & social data
3. Financial Statements - Revenue, assets, employees
4. Board Reports - Governance data

### Iterative Approach

1. Start with primary documents
2. Review what was found
3. Upload additional docs for missing fields
4. Repeat until satisfied

---

## 🎯 What the AI Can Extract

### General Information
- Company name, legal form, country
- Registration numbers
- Reporting period dates
- Employee counts (FTE)
- Revenue and assets
- Business classification (NACE codes)

### Environmental Data
- Energy consumption (total, renewable)
- GHG emissions (Scope 1, 2, 3) with units
- Water consumption with units
- Waste generation (total, hazardous)
- Pollution data
- Biodiversity metrics

### Social Data
- Employee turnover rates
- Collective agreements coverage
- Work accidents/injuries count
- Gender diversity percentages
- Training hours
- Compensation ratios

### Governance
- Board composition
- Committee structures
- Policy existence (yes/no)
- Risk management frameworks

---

## ⚠️ Limitations

### What the AI Cannot Do

**Never Infers:**
- Missing data points
- Calculations from partial data
- Industry averages
- Trends or projections

**Never Estimates:**
- Approximate values
- Order of magnitude guesses
- Filled placeholders

**Never Calculates:**
- Scope 3 from Scope 1+2
- Totals from subtotals
- Percentages from counts

### Confidence Levels

**High (80-100%):**
- Exact matches found
- Clear, unambiguous data
- Consistent across documents

**Medium (60-79%):**
- Data found but needs verification
- Multiple similar values
- Unclear units or context

**Low (<60%):**
- Uncertain extraction
- Conflicting information
- Requires manual review

---

## 🔧 Troubleshooting

### Jan Won't Connect

**Check:**
1. Is Jan running? (should see icon in system tray)
2. Is API server enabled? (Settings > Advanced > API Server)
3. Is the port 1337? (or whatever Jan is configured to)
4. Try restarting Jan

**Fix:**
- Open Jan
- Go to Settings > Advanced
- Toggle "API Server" off and on
- Check port shows 1337
- Should say "Running"

### Model Download Failed

**Solutions:**
1. Check internet connection
2. Check available disk space (need 2-10GB)
3. Try a smaller model if out of space
4. Restart Jan and try again

### Low Extraction Accuracy

**Improve Results:**
1. Use better quality documents
2. Upload additional source documents
3. Try a larger AI model (if RAM allows)
4. Ensure documents contain the actual data (not just charts)

### Out of Memory

**If Jan crashes or system freezes:**
1. Close other applications
2. Choose a smaller AI model
3. Process documents one at a time
4. Restart computer and try again
5. Consider upgrading RAM for better experience

### Slow Performance

**Speed up:**
1. Close unnecessary applications
2. Use smaller AI model
3. Process shorter documents
4. Ensure SSD (not HDD) storage
5. Disable other background AI/ML apps

---

## 📊 Understanding Confidence Scores

The AI provides a confidence score (0-100%) for each extracted value:

**90-100% - Very High**
- Exact match found
- Clear, unambiguous text
- Accept with confidence

**80-89% - High**
- Good match
- Clear context
- Safe to accept

**70-79% - Good**
- Reasonable match
- Minor ambiguity
- Review recommended

**60-69% - Medium**
- Uncertain match
- Multiple interpretations
- Review required

**Below 60% - Low**
- Unclear extraction
- Conflicts found
- Manual verification needed

---

## 🔐 Data Privacy & Security

### Where is Data Stored?

**During Processing:**
- Document content: Stays in RAM only
- AI model: Stored in Jan's data directory
- Extracted data: Temporarily in RAM

**After Processing:**
- Form data: Your EFRAG Desktop database (SQLite)
- Documents: Not stored (you can delete after analysis)
- AI doesn't save or cache your documents

### What Data is Transmitted?

**Zero external transmission:**
- No API calls to external servers
- No data sent to Anthropic, OpenAI, or anyone
- No telemetry or analytics
- No crash reports with data

**Only local communication:**
- EFRAG Desktop ↔ Jan (localhost:1337)
- All stays on your computer
- Firewall can block external connections

### Compliance

**Suitable for:**
- GDPR compliance (data stays local)
- Confidential business data
- Pre-publication financial reports
- Sensitive sustainability metrics

---

## 🆘 Getting Help

### Common Questions

**Q: How much does the AI cost?**
A: Free! Both EFRAG Desktop and Jan are open source.

**Q: Do I need internet?**
A: Only for initial download of Jan and the AI model. After that, works completely offline.

**Q: Can I use multiple models?**
A: Yes! Download multiple models in Jan and switch between them.

**Q: How accurate is the extraction?**
A: Depends on document quality and model size. Typically 70-90% accuracy for clear documents.

**Q: Is my data safe?**
A: Yes. Everything runs locally. Your data never leaves your computer.

**Q: Can I use this for multiple companies?**
A: Yes! Process documents for any number of entities.

---

## 📞 Support

- **Setup Issues**: Check this guide's Troubleshooting section
- **Jan Help**: Visit [jan.ai/docs](https://jan.ai/docs)
- **Feature Requests**: [GitHub Issues](https://github.com/Anudeepreddynarala/EFRAG-Desktop/issues)
- **Bug Reports**: [GitHub Issues](https://github.com/Anudeepreddynarala/EFRAG-Desktop/issues)

---

## 🔄 Updates

This feature is experimental and actively being improved:

**Current Version:** 1.0.0 (Experimental)

**Planned Improvements:**
- OCR support for scanned PDFs
- Image/chart data extraction
- Multi-language document support
- Batch processing multiple reports
- Historical data comparison
- Data quality anomaly detection

---

*Last Updated: 2025-09-30*
