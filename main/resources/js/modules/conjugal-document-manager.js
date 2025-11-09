/**
 * Conjugal Document Manager Module
 * Handles viewing, downloading, and deleting conjugal visit documents
 */

const API_BASE = '/api/conjugal-visits';

/**
 * Fetch document information for a conjugal visit
 * @param {number} conjugalVisitId - The ID of the conjugal visit
 * @returns {Promise<Object>} Document information
 */
export async function getDocumentInfo(conjugalVisitId) {
  try {
    const response = await fetch(`${API_BASE}/${conjugalVisitId}/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch document information');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching document info:', error);
    throw error;
  }
}

/**
 * View a document in a new tab
 * @param {number} conjugalVisitId - The ID of the conjugal visit
 * @param {string} documentType - The type of document ('marriage_contract' or 'cohabitation_cert')
 */
export async function viewDocument(conjugalVisitId, documentType) {
  try {
    const url = `${API_BASE}/${conjugalVisitId}/documents/${documentType}/view`;
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error viewing document:', error);
    throw error;
  }
}

/**
 * Download a document
 * @param {number} conjugalVisitId - The ID of the conjugal visit
 * @param {string} documentType - The type of document ('marriage_contract' or 'cohabitation_cert')
 */
export async function downloadDocument(conjugalVisitId, documentType) {
  try {
    const url = `${API_BASE}/${conjugalVisitId}/documents/${documentType}/download`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download document');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `${documentType}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}

/**
 * Delete a document with confirmation
 * @param {number} conjugalVisitId - The ID of the conjugal visit
 * @param {string} documentType - The type of document ('marriage_contract' or 'cohabitation_cert')
 * @returns {Promise<Object>} Updated document information
 */
export async function deleteDocument(conjugalVisitId, documentType) {
  try {
    // Show confirmation dialog
    const Swal = (await import('sweetalert2')).default;
    
    const documentName = documentType === 'marriage_contract' 
      ? 'Marriage Contract' 
      : 'Cohabitation Certificate';

    const result = await Swal.fire({
      title: 'Delete Document?',
      text: `Are you sure you want to delete the ${documentName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return null;
    }

    const response = await fetch(`${API_BASE}/${conjugalVisitId}/documents/${documentType}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete document');
    }

    const data = await response.json();
    
    await Swal.fire({
      title: 'Deleted!',
      text: `${documentName} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });

    return data;
  } catch (error) {
    console.error('Error deleting document:', error);
    const Swal = (await import('sweetalert2')).default;
    await Swal.fire({
      title: 'Error',
      text: error.message || 'Failed to delete document',
      icon: 'error',
    });
    throw error;
  }
}
