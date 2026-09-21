/**
 * API Client for Digital Contact Book
 * Handles communication with Express REST endpoints
 */

const API_BASE = '/api/contacts';

class ContactAPI {
  static async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'}] ${url}:`, error);
      throw error;
    }
  }

  // Fetch all contacts with optional query filters
  static async getContacts({ search = '', category = '', isFavorite = '', sortBy = 'name-asc' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    if (isFavorite) params.append('isFavorite', isFavorite);
    if (sortBy) params.append('sortBy', sortBy);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(query);
  }

  // Fetch a single contact
  static async getContact(id) {
    return this.request(`/${id}`);
  }

  // Create new contact
  static async createContact(contactData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }

  // Update existing contact
  static async updateContact(id, contactData) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData)
    });
  }

  // Toggle favorite status
  static async toggleFavorite(id) {
    return this.request(`/${id}/favorite`, {
      method: 'PATCH'
    });
  }

  // Delete contact
  static async deleteContact(id) {
    return this.request(`/${id}`, {
      method: 'DELETE'
    });
  }

  // Fetch statistics summary
  static async getStats() {
    return this.request('/stats');
  }

  // Bulk import contacts
  static async importContacts(contactsArray) {
    return this.request('/import', {
      method: 'POST',
      body: JSON.stringify({ contacts: contactsArray })
    });
  }

  // Get direct URLs for file exports
  static getCsvExportUrl() {
    return `${API_BASE}/export/csv`;
  }

  static getVcfExportUrl() {
    return `${API_BASE}/export/vcf`;
  }
}

// Attach to window
window.ContactAPI = ContactAPI;
