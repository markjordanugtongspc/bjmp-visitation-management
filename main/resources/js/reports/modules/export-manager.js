/**
 * Reports Export Manager
 * Handles exporting reports to various formats
 */

export class ReportsExportManager {
    constructor() {
        // Get the base URL from current role
        const path = window.location.pathname;
        // Handle paths like /admin/reports, /warden/reports, /assistant-warden/reports, /searcher/reports
        const pathParts = path.split('/').filter(p => p);
        const role = pathParts[0]; // admin, warden, assistant-warden, searcher
        this.baseUrl = `/${role}/reports/export`;
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (!this.csrfToken) {
            console.warn('CSRF token not found. Export functionality may not work.');
        }
    }

    /**
     * Export report to specified format
     */
    async export(filters, format = 'pdf', reportType = 'general') {
        try {
            switch (format.toLowerCase()) {
                case 'pdf':
                    await this.exportToPDF(filters, reportType);
                    break;
                case 'excel':
                case 'xlsx':
                    await this.exportToExcel(filters, reportType);
                    break;
                case 'csv':
                    await this.exportToCSV(filters, reportType);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            throw error;
        }
    }

    /**
     * Export to PDF
     */
    async exportToPDF(filters, reportType) {
        try {
            if (!this.csrfToken) {
                throw new Error('CSRF token is missing. Please refresh the page and try again.');
            }

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/pdf,text/html,application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    format: 'pdf',
                    report_type: reportType,
                    date_from: filters.dateFrom || '',
                    date_to: filters.dateTo || '',
                    reportType: filters.reportType || 'all'
                })
            });

            // Check content type before processing
            const contentType = response.headers.get('content-type') || '';
            
            // Handle errors first
            if (!response.ok) {
                // Clone response to read error without consuming
                const errorResponse = response.clone();
                let errorMessage = `HTTP error! status: ${response.status}`;
                
                try {
                    if (contentType.includes('application/json')) {
                        const errorData = await errorResponse.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } else {
                        const errorText = await errorResponse.text();
                        // Try to extract error from HTML if it's an error page
                        if (errorText.includes('<title>')) {
                            const match = errorText.match(/<title>(.*?)<\/title>/i);
                            if (match) errorMessage = match[1];
                        } else if (errorText.trim()) {
                            errorMessage = errorText.substring(0, 200);
                        }
                    }
                } catch (e) {
                    // Use status-based error message
                    if (response.status === 500) {
                        errorMessage = 'Server error. Please check the server logs or try again later.';
                    } else if (response.status === 404) {
                        errorMessage = 'Export endpoint not found. Please contact administrator.';
                    } else {
                        errorMessage = response.statusText || errorMessage;
                    }
                }
                throw new Error(errorMessage);
            }

            // Check if response is JSON (shouldn't happen if ok, but check anyway)
            if (contentType.includes('application/json')) {
                const result = await response.json();
                throw new Error(result.message || result.error || 'Export failed');
            }

            // Handle HTML responses (fallback PDF or error page)
            if (contentType.includes('text/html')) {
                // Clone to check content
                const htmlResponse = response.clone();
                const htmlText = await htmlResponse.text();
                
                // Check if it's our fallback HTML report
                if (htmlText.includes('Bureau of Jail Management and Penology') && 
                    htmlText.includes('Iligan City District Jail')) {
                    // Valid HTML fallback - DomPDF failed, but we have HTML
                    console.warn('DomPDF not available, falling back to HTML export');
                    
                    // Show user-friendly message
                    this.showNotification('PDF generation failed. Downloading HTML report instead. You can print this page to PDF.', 'warning');
                    
                    const blob = await response.blob();
                    const filename = this.getFilenameFromResponse(response) || `BJMP_Report_${reportType}_${new Date().toISOString().split('T')[0]}.html`;
                    this.downloadFile(blob, filename);
                    return;
                } else {
                    // Likely an error page
                    const errorMatch = htmlText.match(/<title>(.*?)<\/title>/i) || htmlText.match(/Error[:\s]+(.*?)(?:<|$)/i);
                    throw new Error(errorMatch ? errorMatch[1] : 'Server returned an error page. Please check the server logs.');
                }
            }
            
            // Check Content-Length header first (more reliable than blob.size)
            const contentLength = response.headers.get('content-length');
            const contentLengthNum = contentLength ? parseInt(contentLength, 10) : 0;
            
            // Download the PDF file
            const blob = await response.blob();
            
            // Debug information
            console.log('Export response details:', {
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                contentLength: contentLength,
                contentLengthNum: contentLengthNum,
                blobSize: blob.size,
                url: this.baseUrl
            });
            
            // Check if file was actually downloaded (IDM might have intercepted it)
            if (contentLengthNum > 0) {
                // Server sent content, IDM or download manager likely handled it
                console.log('File sent by server (Content-Length:', contentLengthNum, 'bytes)');
                this.showNotification('Export completed! Check your download folder.', 'success');
                return;
            }
            
            // Check blob size as fallback
            if (blob.size > 0) {
                const filename = this.getFilenameFromResponse(response) || `BJMP_Report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
                this.downloadFile(blob, filename);
                return;
            }
            
            // If we get here, the file is genuinely empty or there was an error
            console.warn('No content received from server');
            
            // Try to get debug info (only if this wasn't already a debug request)
            if (!filters.debug) {
                try {
                    const debugResponse = await fetch(this.baseUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': this.csrfToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({
                            format: 'pdf',
                            report_type: reportType,
                            date_from: filters.dateFrom || '',
                            date_to: filters.dateTo || '',
                            reportType: filters.reportType || 'all',
                            debug: true
                        })
                    });
                    
                    const debugText = await debugResponse.text();
                    console.error('Debug response from server:', debugText.substring(0, 500));
                } catch (debugError) {
                    console.error('Failed to get debug info:', debugError);
                }
            }
            
            throw new Error('No content received from server. The file may have been downloaded by your download manager, or there was a server error.');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            throw error;
        }
    }
    
    /**
     * Get filename from response headers
     */
    getFilenameFromResponse(response) {
        const disposition = response.headers.get('content-disposition');
        if (disposition && disposition.includes('filename=')) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
            if (matches && matches[1]) {
                return matches[1].replace(/['"]/g, '');
            }
        }
        return null;
    }

    /**
     * Export to Excel
     */
    async exportToExcel(filters, reportType) {
        try {
            if (!this.csrfToken) {
                throw new Error('CSRF token is missing. Please refresh the page and try again.');
            }

            const response = await fetch(`${this.baseUrl}`, {
                method: 'POST',
                headers: {
                    'Accept': 'text/csv,application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    format: 'excel',
                    report_type: reportType,
                    date_from: filters.dateFrom || '',
                    date_to: filters.dateTo || '',
                    reportType: filters.reportType || 'all'
                })
            });

            const contentType = response.headers.get('content-type') || '';
            
            // Handle errors
            if (!response.ok) {
                const errorResponse = response.clone();
                let errorMessage = `HTTP error! status: ${response.status}`;
                
                try {
                    if (contentType.includes('application/json')) {
                        const errorData = await errorResponse.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } else {
                        const errorText = await errorResponse.text();
                        if (errorText.includes('<title>')) {
                            const match = errorText.match(/<title>(.*?)<\/title>/i);
                            if (match) errorMessage = match[1];
                        }
                    }
                } catch (e) {
                    if (response.status === 500) {
                        errorMessage = 'Server error. Please check the server logs or try again later.';
                    } else if (response.status === 404) {
                        errorMessage = 'Export endpoint not found. Please contact administrator.';
                    }
                }
                throw new Error(errorMessage);
            }

            // Check for JSON error response
            if (contentType.includes('application/json')) {
                const result = await response.json();
                throw new Error(result.message || result.error || 'Export failed');
            }

            // Check for HTML error pages
            if (contentType.includes('text/html') && !contentType.includes('text/csv')) {
                const htmlResponse = response.clone();
                const htmlText = await htmlResponse.text();
                if (htmlText.trim().startsWith('<!DOCTYPE') || htmlText.trim().startsWith('<html')) {
                    const errorMatch = htmlText.match(/<title>(.*?)<\/title>/i) || htmlText.match(/Error[:\s]+(.*?)(?:<|$)/i);
                    throw new Error(errorMatch ? errorMatch[1] : 'Server returned an error page. Please check the server logs.');
                }
            }
            
            // Download the file
            const blob = await response.blob();
            
            if (blob.size === 0) {
                throw new Error('Received empty file from server');
            }
            
            const filename = this.getFilenameFromResponse(response) || `BJMP_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(blob, filename);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }

    /**
     * Export to CSV
     */
    async exportToCSV(filters, reportType) {
        try {
            if (!this.csrfToken) {
                throw new Error('CSRF token is missing. Please refresh the page and try again.');
            }

            const response = await fetch(`${this.baseUrl}`, {
                method: 'POST',
                headers: {
                    'Accept': 'text/csv,application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    format: 'csv',
                    report_type: reportType,
                    date_from: filters.dateFrom || '',
                    date_to: filters.dateTo || '',
                    reportType: filters.reportType || 'all'
                })
            });

            const contentType = response.headers.get('content-type') || '';
            
            // Handle errors
            if (!response.ok) {
                const errorResponse = response.clone();
                let errorMessage = `HTTP error! status: ${response.status}`;
                
                try {
                    if (contentType.includes('application/json')) {
                        const errorData = await errorResponse.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } else {
                        const errorText = await errorResponse.text();
                        if (errorText.includes('<title>')) {
                            const match = errorText.match(/<title>(.*?)<\/title>/i);
                            if (match) errorMessage = match[1];
                        }
                    }
                } catch (e) {
                    if (response.status === 500) {
                        errorMessage = 'Server error. Please check the server logs or try again later.';
                    } else if (response.status === 404) {
                        errorMessage = 'Export endpoint not found. Please contact administrator.';
                    }
                }
                throw new Error(errorMessage);
            }

            // Check for JSON error response
            if (contentType.includes('application/json')) {
                const result = await response.json();
                throw new Error(result.message || result.error || 'Export failed');
            }

            // Check for HTML error pages (CSV should be text/csv, not HTML)
            if (contentType.includes('text/html') && !contentType.includes('text/csv')) {
                const htmlResponse = response.clone();
                const htmlText = await htmlResponse.text();
                if (htmlText.trim().startsWith('<!DOCTYPE') || htmlText.trim().startsWith('<html')) {
                    const errorMatch = htmlText.match(/<title>(.*?)<\/title>/i) || htmlText.match(/Error[:\s]+(.*?)(?:<|$)/i);
                    throw new Error(errorMatch ? errorMatch[1] : 'Server returned an error page. Please check the server logs.');
                }
            }
            
            // Download the file
            const blob = await response.blob();
            
            if (blob.size === 0) {
                throw new Error('Received empty file from server');
            }
            
            const filename = this.getFilenameFromResponse(response) || `BJMP_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(blob, filename);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            throw error;
        }
    }


    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Try to use SweetAlert2 if available
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info',
                title: type === 'error' ? 'Export Error' : type === 'warning' ? 'Export Warning' : 'Export Info',
                text: message,
                showConfirmButton: true,
                confirmButtonText: 'OK',
                timer: type === 'warning' ? 5000 : null
            });
        } else {
            // Fallback to browser alert
            alert(message);
        }
    }

    /**
     * Download file to user's device
     */
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
