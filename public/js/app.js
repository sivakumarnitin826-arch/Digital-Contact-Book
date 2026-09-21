/**
 * Digital Contact Book - Main Client Application Logic
 */

// Application State
const state = {
  contacts: [],
  activeFilter: 'All',
  searchQuery: '',
  sortBy: 'name-asc',
  viewMode: 'grid', // 'grid' | 'list'
  theme: 'dark',
  activeContact: null,
  deleteTargetId: null,
  isEditing: false
};

const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#e11d48',
  '#ea580c', '#d97706', '#059669', '#0891b2',
  '#2563eb', '#475569'
];

// DOM Element References
const elements = {
  // Theme
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIconSun: document.getElementById('themeIconSun'),
  themeIconMoon: document.getElementById('themeIconMoon'),

  // Stats
  statTotalContacts: document.getElementById('statTotalContacts'),
  statFavoriteContacts: document.getElementById('statFavoriteContacts'),
  statWorkContacts: document.getElementById('statWorkContacts'),
  statPersonalContacts: document.getElementById('statPersonalContacts'),

  // Toolbar & Filters
  searchInput: document.getElementById('searchInput'),
  searchClearBtn: document.getElementById('searchClearBtn'),
  sortSelect: document.getElementById('sortSelect'),
  viewGridBtn: document.getElementById('viewGridBtn'),
  viewListBtn: document.getElementById('viewListBtn'),
  categoryFilters: document.getElementById('categoryFilters'),
  contactsCountLabel: document.getElementById('visibleCount'),

  // Lists & Containers
  contactsGrid: document.getElementById('contactsGrid'),
  contactsList: document.getElementById('contactsList'),
  emptyState: document.getElementById('emptyState'),
  emptyStateActionBtn: document.getElementById('emptyStateActionBtn'),

  // Modals
  contactFormModal: document.getElementById('contactFormModal'),
  contactForm: document.getElementById('contactForm'),
  formModalTitle: document.getElementById('formModalTitle'),
  closeFormModalBtn: document.getElementById('closeFormModalBtn'),
  cancelFormBtn: document.getElementById('cancelFormBtn'),
  openAddModalBtn: document.getElementById('openAddModalBtn'),

  // Form Fields
  contactIdInput: document.getElementById('contactIdInput'),
  avatarColorInput: document.getElementById('avatarColorInput'),
  nameInput: document.getElementById('nameInput'),
  phoneInput: document.getElementById('phoneInput'),
  emailInput: document.getElementById('emailInput'),
  categoryInput: document.getElementById('categoryInput'),
  companyInput: document.getElementById('companyInput'),
  addressInput: document.getElementById('addressInput'),
  notesInput: document.getElementById('notesInput'),
  isFavoriteInput: document.getElementById('isFavoriteInput'),
  colorPickerContainer: document.getElementById('colorPickerContainer'),

  // Detail Modal
  contactDetailModal: document.getElementById('contactDetailModal'),
  closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
  detailAvatar: document.getElementById('detailAvatar'),
  detailName: document.getElementById('detailName'),
  detailCompany: document.getElementById('detailCompany'),
  detailCategoryBadge: document.getElementById('detailCategoryBadge'),
  detailPhone: document.getElementById('detailPhone'),
  detailEmail: document.getElementById('detailEmail'),
  detailAddress: document.getElementById('detailAddress'),
  detailNotes: document.getElementById('detailNotes'),
  detailCallLink: document.getElementById('detailCallLink'),
  detailWhatsappLink: document.getElementById('detailWhatsappLink'),
  detailEmailLink: document.getElementById('detailEmailLink'),
  detailCopyBtn: document.getElementById('detailCopyBtn'),
  detailEditBtn: document.getElementById('detailEditBtn'),
  detailDeleteBtn: document.getElementById('detailDeleteBtn'),

  // Delete Confirm Modal
  confirmDeleteModal: document.getElementById('confirmDeleteModal'),
  closeConfirmModalBtn: document.getElementById('closeConfirmModalBtn'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  deleteTargetName: document.getElementById('deleteTargetName'),

  // Export / Import
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  exportVcfBtn: document.getElementById('exportVcfBtn'),
  importBtn: document.getElementById('importBtn'),
  importFileInput: document.getElementById('importFileInput'),

  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================================================
// Utility Functions
// ==========================================================================

function getInitials(name = '') {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function sanitizePhoneNumber(phone = '') {
  return phone.replace(/[^0-9+]/g, '');
}

function debounce(func, wait = 250) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconSvg = type === 'success'
    ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    : type === 'error'
    ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message">${message}</span>
  `;

  elements.toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================================================
// Theme Management
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('contact_book_theme') || 'dark';
  setTheme(savedTheme);

  elements.themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('contact_book_theme', theme);

  if (theme === 'dark') {
    elements.themeIconSun.style.display = 'block';
    elements.themeIconMoon.style.display = 'none';
  } else {
    elements.themeIconSun.style.display = 'none';
    elements.themeIconMoon.style.display = 'block';
  }
}

// ==========================================================================
// Color Picker Swatches
// ==========================================================================
function initColorPicker() {
  elements.colorPickerContainer.innerHTML = '';
  AVATAR_COLORS.forEach(color => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;

    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      elements.avatarColorInput.value = color;
    });

    elements.colorPickerContainer.appendChild(swatch);
  });
}

function selectColorSwatch(color) {
  elements.avatarColorInput.value = color;
  document.querySelectorAll('.color-swatch').forEach(s => {
    if (s.dataset.color.toLowerCase() === color.toLowerCase()) {
      s.classList.add('selected');
    } else {
      s.classList.remove('selected');
    }
  });
}

// ==========================================================================
// Data Fetching & State
// ==========================================================================
async function loadContacts() {
  try {
    const response = await window.ContactAPI.getContacts({
      search: state.searchQuery,
      category: state.activeFilter,
      sortBy: state.sortBy
    });

    state.contacts = response.data || [];
    renderContacts();
    loadStats();
  } catch (err) {
    showToast('Failed to load contacts: ' + err.message, 'error');
  }
}

async function loadStats() {
  try {
    const res = await window.ContactAPI.getStats();
    if (res.success && res.data) {
      const { total, favorites, categories } = res.data;
      elements.statTotalContacts.textContent = total;
      elements.statFavoriteContacts.textContent = favorites;
      elements.statWorkContacts.textContent = categories.Work || 0;
      elements.statPersonalContacts.textContent = (categories.Personal || 0) + (categories.Family || 0);
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// ==========================================================================
// Rendering Contacts (Grid & List Views)
// ==========================================================================
function renderContacts() {
  const count = state.contacts.length;
  elements.contactsCountLabel.textContent = count;

  if (count === 0) {
    elements.contactsGrid.style.display = 'none';
    elements.contactsList.style.display = 'none';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  if (state.viewMode === 'grid') {
    elements.contactsGrid.style.display = 'grid';
    elements.contactsList.style.display = 'none';
    renderGridView();
  } else {
    elements.contactsGrid.style.display = 'none';
    elements.contactsList.style.display = 'flex';
    renderListView();
  }
}

function renderGridView() {
  elements.contactsGrid.innerHTML = '';

  state.contacts.forEach(contact => {
    const card = document.createElement('article');
    card.className = 'contact-card';
    card.dataset.id = contact.id;

    const initials = getInitials(contact.name);
    const cleanPhone = sanitizePhoneNumber(contact.phone);
    const encodedName = encodeURIComponent(contact.name);

    card.innerHTML = `
      <div class="card-top">
        <div class="avatar-wrapper">
          <div class="avatar" style="background-color: ${contact.avatarColor || '#4f46e5'};">
            ${initials}
          </div>
        </div>
        <button class="fav-btn ${contact.isFavorite ? 'is-fav' : ''}" data-action="fav" title="${contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
          <svg viewBox="0 0 24 24" fill="${contact.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      </div>

      <div class="card-body">
        <h3 class="contact-name">${escapeHTML(contact.name)}</h3>
        <div class="contact-company">
          ${contact.company ? escapeHTML(contact.company) : '<span style="opacity:0.6;">No organization specified</span>'}
        </div>
        <span class="category-badge ${contact.category}">${contact.category || 'Personal'}</span>

        <div class="contact-info-list">
          <div class="info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>${escapeHTML(contact.phone)}</span>
          </div>
          ${contact.email ? `
            <div class="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>${escapeHTML(contact.email)}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="card-footer">
        <div class="quick-actions">
          <a href="tel:${cleanPhone}" class="action-btn call" title="Call directly" onclick="event.stopPropagation();">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </a>
          <a href="https://wa.me/${cleanPhone.replace('+', '')}?text=Hello%20${encodedName}" target="_blank" rel="noopener" class="action-btn whatsapp" title="Chat on WhatsApp" onclick="event.stopPropagation();">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>
          ${contact.email ? `
            <a href="mailto:${escapeHTML(contact.email)}" class="action-btn email" title="Send email" onclick="event.stopPropagation();">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          ` : ''}
        </div>

        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.78rem;" data-action="view">
          View Profile
        </button>
      </div>
    `;

    // Event Delegation for Card
    card.addEventListener('click', (e) => {
      const favBtn = e.target.closest('[data-action="fav"]');
      if (favBtn) {
        e.stopPropagation();
        handleToggleFavorite(contact.id);
        return;
      }
      openDetailModal(contact);
    });

    elements.contactsGrid.appendChild(card);
  });
}

function renderListView() {
  elements.contactsList.innerHTML = '';

  state.contacts.forEach(contact => {
    const item = document.createElement('div');
    item.className = 'contact-list-item';
    item.dataset.id = contact.id;

    const initials = getInitials(contact.name);
    const cleanPhone = sanitizePhoneNumber(contact.phone);

    item.innerHTML = `
      <div class="list-item-main">
        <div class="avatar" style="background-color: ${contact.avatarColor || '#4f46e5'}; width: 42px; height: 42px; font-size: 0.95rem;">
          ${initials}
        </div>
        <div class="list-item-details">
          <div style="font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            ${escapeHTML(contact.name)}
            <span class="category-badge ${contact.category}" style="font-size: 0.7rem; padding: 1px 8px;">${contact.category}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            ${contact.company ? escapeHTML(contact.company) : 'No Organization'}
          </div>
        </div>
      </div>

      <div class="list-item-meta">
        <div class="list-meta-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>${escapeHTML(contact.phone)}</span>
        </div>
        <div class="list-meta-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>${contact.email ? escapeHTML(contact.email) : '—'}</span>
        </div>
      </div>

      <div class="quick-actions" style="margin-left: auto;">
        <button class="fav-btn ${contact.isFavorite ? 'is-fav' : ''}" data-action="fav" title="Favorite">
          <svg viewBox="0 0 24 24" fill="${contact.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.78rem;" data-action="view">
          View
        </button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      const favBtn = e.target.closest('[data-action="fav"]');
      if (favBtn) {
        e.stopPropagation();
        handleToggleFavorite(contact.id);
        return;
      }
      openDetailModal(contact);
    });

    elements.contactsList.appendChild(item);
  });
}

function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// Favorite Toggling
// ==========================================================================
async function handleToggleFavorite(id) {
  try {
    const res = await window.ContactAPI.toggleFavorite(id);
    if (res.success && res.data) {
      // Optimistic update in state
      const contact = state.contacts.find(c => c.id === id);
      if (contact) {
        contact.isFavorite = res.data.isFavorite;
      }
      renderContacts();
      loadStats();
      showToast(res.message, 'success');
    }
  } catch (err) {
    showToast('Failed to update favorite: ' + err.message, 'error');
  }
}

// ==========================================================================
// Modal Handlers: Add / Edit Contact
// ==========================================================================
function openAddModal() {
  state.isEditing = false;
  elements.formModalTitle.textContent = 'Add New Contact';
  elements.contactForm.reset();
  elements.contactIdInput.value = '';

  // Select random initial swatch
  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  selectColorSwatch(randomColor);

  elements.contactFormModal.classList.add('active');
  setTimeout(() => elements.nameInput.focus(), 150);
}

function openEditModal(contact) {
  state.isEditing = true;
  elements.formModalTitle.textContent = 'Edit Contact';
  elements.contactForm.reset();

  elements.contactIdInput.value = contact.id;
  elements.nameInput.value = contact.name || '';
  elements.phoneInput.value = contact.phone || '';
  elements.emailInput.value = contact.email || '';
  elements.categoryInput.value = contact.category || 'Personal';
  elements.companyInput.value = contact.company || '';
  elements.addressInput.value = contact.address || '';
  elements.notesInput.value = contact.notes || '';
  elements.isFavoriteInput.checked = Boolean(contact.isFavorite);

  selectColorSwatch(contact.avatarColor || AVATAR_COLORS[0]);

  // Close detail modal if open
  closeDetailModal();

  elements.contactFormModal.classList.add('active');
  setTimeout(() => elements.nameInput.focus(), 150);
}

function closeFormModal() {
  elements.contactFormModal.classList.remove('active');
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const name = elements.nameInput.value.trim();
  const phone = elements.phoneInput.value.trim();
  const email = elements.emailInput.value.trim();
  const category = elements.categoryInput.value;
  const company = elements.companyInput.value.trim();
  const address = elements.addressInput.value.trim();
  const notes = elements.notesInput.value.trim();
  const isFavorite = elements.isFavoriteInput.checked;
  const avatarColor = elements.avatarColorInput.value;

  if (!name || !phone) {
    showToast('Name and Phone Number are required.', 'error');
    return;
  }

  const payload = {
    name,
    phone,
    email,
    category,
    company,
    address,
    notes,
    isFavorite,
    avatarColor
  };

  try {
    if (state.isEditing) {
      const id = elements.contactIdInput.value;
      const res = await window.ContactAPI.updateContact(id, payload);
      showToast(res.message || 'Contact updated successfully!', 'success');
    } else {
      const res = await window.ContactAPI.createContact(payload);
      showToast(res.message || 'Contact added successfully!', 'success');
    }

    closeFormModal();
    loadContacts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================================================
// Modal Handlers: Contact Details
// ==========================================================================
function openDetailModal(contact) {
  state.activeContact = contact;

  elements.detailAvatar.textContent = getInitials(contact.name);
  elements.detailAvatar.style.backgroundColor = contact.avatarColor || '#4f46e5';
  elements.detailName.textContent = contact.name;
  elements.detailCompany.textContent = contact.company || 'No Company specified';

  elements.detailCategoryBadge.className = `category-badge ${contact.category}`;
  elements.detailCategoryBadge.textContent = contact.category || 'Personal';

  const cleanPhone = sanitizePhoneNumber(contact.phone);
  elements.detailPhone.textContent = contact.phone;
  elements.detailEmail.textContent = contact.email || 'None provided';
  elements.detailAddress.textContent = contact.address || 'None provided';
  elements.detailNotes.textContent = contact.notes || 'None provided';

  // Action links
  elements.detailCallLink.href = `tel:${cleanPhone}`;
  elements.detailWhatsappLink.href = `https://wa.me/${cleanPhone.replace('+', '')}?text=Hello%20${encodeURIComponent(contact.name)}`;

  if (contact.email) {
    elements.detailEmailLink.href = `mailto:${contact.email}`;
    elements.detailEmailLink.style.display = 'inline-flex';
  } else {
    elements.detailEmailLink.style.display = 'none';
  }

  elements.contactDetailModal.classList.add('active');
}

function closeDetailModal() {
  elements.contactDetailModal.classList.remove('active');
  state.activeContact = null;
}

// ==========================================================================
// Modal Handlers: Delete Confirmation
// ==========================================================================
function openDeleteConfirmModal(contactId, contactName) {
  state.deleteTargetId = contactId;
  elements.deleteTargetName.textContent = `"${contactName}"`;
  elements.confirmDeleteModal.classList.add('active');
}

function closeDeleteConfirmModal() {
  elements.confirmDeleteModal.classList.remove('active');
  state.deleteTargetId = null;
}

async function handleConfirmDelete() {
  if (!state.deleteTargetId) return;

  try {
    const res = await window.ContactAPI.deleteContact(state.deleteTargetId);
    showToast(res.message || 'Contact deleted successfully', 'success');
    closeDeleteConfirmModal();
    closeDetailModal();
    loadContacts();
  } catch (err) {
    showToast('Failed to delete contact: ' + err.message, 'error');
  }
}

// ==========================================================================
// Import & Export Handlers
// ==========================================================================
function handleExportCsv() {
  window.location.href = window.ContactAPI.getCsvExportUrl();
  showToast('Downloading CSV contacts export...', 'info');
}

function handleExportVcf() {
  window.location.href = window.ContactAPI.getVcfExportUrl();
  showToast('Downloading vCard (.vcf) export...', 'info');
}

function handleImportFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      const contactsArray = Array.isArray(parsed) ? parsed : (parsed.contacts || []);

      if (!contactsArray.length) {
        showToast('No valid contact entries found in JSON file.', 'error');
        return;
      }

      const res = await window.ContactAPI.importContacts(contactsArray);
      showToast(res.message || 'Contacts imported successfully!', 'success');
      loadContacts();
    } catch (err) {
      showToast('Error importing JSON: ' + err.message, 'error');
    } finally {
      elements.importFileInput.value = '';
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
  // Add Contact CTA Buttons
  elements.openAddModalBtn.addEventListener('click', openAddModal);
  elements.emptyStateActionBtn.addEventListener('click', openAddModal);

  // Form Modal Buttons
  elements.closeFormModalBtn.addEventListener('click', closeFormModal);
  elements.cancelFormBtn.addEventListener('click', closeFormModal);
  elements.contactForm.addEventListener('submit', handleFormSubmit);

  // Detail Modal Buttons
  elements.closeDetailModalBtn.addEventListener('click', closeDetailModal);
  elements.detailEditBtn.addEventListener('click', () => {
    if (state.activeContact) openEditModal(state.activeContact);
  });
  elements.detailDeleteBtn.addEventListener('click', () => {
    if (state.activeContact) openDeleteConfirmModal(state.activeContact.id, state.activeContact.name);
  });
  elements.detailCopyBtn.addEventListener('click', () => {
    if (state.activeContact) {
      const textToCopy = `${state.activeContact.name}: ${state.activeContact.phone}${state.activeContact.email ? ' | ' + state.activeContact.email : ''}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Contact info copied to clipboard!', 'info');
      }).catch(() => {
        showToast('Unable to copy info', 'error');
      });
    }
  });

  // Delete Confirm Modal Buttons
  elements.closeConfirmModalBtn.addEventListener('click', closeDeleteConfirmModal);
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModal);
  elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Click outside modal backdrop to close
  [elements.contactFormModal, elements.contactDetailModal, elements.confirmDeleteModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Search Input with Debounce
  const handleSearch = debounce((e) => {
    state.searchQuery = e.target.value.trim();
    if (state.searchQuery) {
      elements.searchClearBtn.classList.add('visible');
    } else {
      elements.searchClearBtn.classList.remove('visible');
    }
    loadContacts();
  }, 250);

  elements.searchInput.addEventListener('input', handleSearch);

  elements.searchClearBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.searchClearBtn.classList.remove('visible');
    loadContacts();
  });

  // Category Filter Pills
  elements.categoryFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    state.activeFilter = chip.dataset.category;
    loadContacts();
  });

  // Sort Order Dropdown
  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    loadContacts();
  });

  // View Switcher (Grid vs List)
  elements.viewGridBtn.addEventListener('click', () => {
    state.viewMode = 'grid';
    elements.viewGridBtn.classList.add('active');
    elements.viewListBtn.classList.remove('active');
    renderContacts();
  });

  elements.viewListBtn.addEventListener('click', () => {
    state.viewMode = 'list';
    elements.viewListBtn.classList.add('active');
    elements.viewGridBtn.classList.remove('active');
    renderContacts();
  });

  // Export / Import
  elements.exportCsvBtn.addEventListener('click', handleExportCsv);
  elements.exportVcfBtn.addEventListener('click', handleExportVcf);
  elements.importBtn.addEventListener('click', () => elements.importFileInput.click());
  elements.importFileInput.addEventListener('change', handleImportFileChange);

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Focus search on '/' or Ctrl+K / Cmd+K
    if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) && document.activeElement !== elements.searchInput) {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (!activeModal) {
        e.preventDefault();
        elements.searchInput.focus();
        elements.searchInput.select();
      }
    }

    // Escape to close active modals
    if (e.key === 'Escape') {
      closeFormModal();
      closeDetailModal();
      closeDeleteConfirmModal();
    }
  });
}

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initColorPicker();
  setupEventListeners();
  loadContacts();
});
