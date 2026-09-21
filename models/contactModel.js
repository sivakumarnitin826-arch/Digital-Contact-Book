const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'contacts.json');

const INITIAL_SEED_CONTACTS = [
  {
    id: 'seed-1',
    name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@techcorp.io',
    category: 'Work',
    company: 'TechCorp Solutions',
    address: 'Indiranagar, Bengaluru, India',
    notes: 'Lead System Architect for Cloud Migration project.',
    isFavorite: true,
    avatarColor: '#4f46e5',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'seed-2',
    name: 'Dr. Priya Nair',
    phone: '+91 98450 11223',
    email: 'dr.priya.nair@healthplus.org',
    category: 'Emergency',
    company: 'Apollo Care Clinic',
    address: 'Koramangala 4th Block, Bengaluru',
    notes: 'Family Physician. Emergency clinic number available 24/7.',
    isFavorite: true,
    avatarColor: '#e11d48',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'seed-3',
    name: 'Rohan Verma',
    phone: '+91 99001 88776',
    email: 'rohan.v@gmail.com',
    category: 'Friends',
    company: 'Freelance Designer',
    address: 'Bandra West, Mumbai',
    notes: 'College roommate. UI/UX portfolio designer.',
    isFavorite: true,
    avatarColor: '#059669',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'seed-4',
    name: 'Ananya Patel',
    phone: '+91 97654 32109',
    email: 'ananya.p@familynet.in',
    category: 'Family',
    company: '',
    address: 'Ellisbridge, Ahmedabad',
    notes: 'Cousin. Birthday on 14th November.',
    isFavorite: false,
    avatarColor: '#d97706',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'seed-5',
    name: 'Vikramaditya Rao',
    phone: '+91 91234 56780',
    email: 'vikram.rao@fintechventures.com',
    category: 'Work',
    company: 'Fintech Ventures',
    address: 'Hitec City, Hyderabad',
    notes: 'Product Manager. Discussion scheduled on Tuesday 10 AM.',
    isFavorite: false,
    avatarColor: '#7c3aed',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'seed-6',
    name: 'Meera Deshmukh',
    phone: '+91 98220 54321',
    email: 'meera.d@personalspace.net',
    category: 'Personal',
    company: 'Yoga & Wellness Studio',
    address: 'Kothrud, Pune',
    notes: 'Yoga instructor and wellness mentor.',
    isFavorite: false,
    avatarColor: '#0891b2',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'seed-7',
    name: 'Kabir Sen',
    phone: '+91 98301 99887',
    email: 'kabir.sen@soundlab.io',
    category: 'Friends',
    company: 'SoundLab Studios',
    address: 'Park Street, Kolkata',
    notes: 'Guitarist and sound engineer. Jamming on weekends.',
    isFavorite: false,
    avatarColor: '#db2777',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'seed-8',
    name: 'Sunita Joshi',
    phone: '+91 94225 67890',
    email: 'sunita.joshi@homemail.in',
    category: 'Family',
    company: '',
    address: 'Shivaji Nagar, Pune',
    notes: 'Aunt Sunita. Sweet dish expert.',
    isFavorite: false,
    avatarColor: '#ea580c',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const AVATAR_PALETTE = [
  '#4f46e5', '#7c3aed', '#db2777', '#e11d48',
  '#ea580c', '#d97706', '#059669', '#0891b2',
  '#2563eb', '#475569'
];

class ContactModel {
  constructor() {
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      this.saveContacts(INITIAL_SEED_CONTACTS);
    }
  }

  readContacts() {
    try {
      this.ensureDataFile();
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading contacts file:', err);
      return [];
    }
  }

  saveContacts(contacts) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2), 'utf8');
  }

  getRandomAvatarColor() {
    return AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)];
  }

  getAll({ search = '', category = '', isFavorite = '', sortBy = 'name-asc' } = {}) {
    let contacts = this.readContacts();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      contacts = contacts.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      contacts = contacts.filter(c => c.category && c.category.toLowerCase() === category.toLowerCase());
    }

    if (isFavorite === 'true' || isFavorite === true) {
      contacts = contacts.filter(c => c.isFavorite);
    }

    contacts.sort((a, b) => {
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'favorite-first') {
        if (a.isFavorite === b.isFavorite) {
          return a.name.localeCompare(b.name);
        }
        return a.isFavorite ? -1 : 1;
      }
      // default: name-asc
      return a.name.localeCompare(b.name);
    });

    return contacts;
  }

  getById(id) {
    const contacts = this.readContacts();
    return contacts.find(c => c.id === id) || null;
  }

  create(data) {
    const contacts = this.readContacts();
    const newContact = {
      id: uuidv4(),
      name: (data.name || '').trim(),
      phone: (data.phone || '').trim(),
      email: (data.email || '').trim(),
      category: data.category || 'Personal',
      company: (data.company || '').trim(),
      address: (data.address || '').trim(),
      notes: (data.notes || '').trim(),
      isFavorite: Boolean(data.isFavorite),
      avatarColor: data.avatarColor || this.getRandomAvatarColor(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    contacts.unshift(newContact);
    this.saveContacts(contacts);
    return newContact;
  }

  update(id, data) {
    const contacts = this.readContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) return null;

    const existing = contacts[index];
    const updated = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
      email: data.email !== undefined ? data.email.trim() : existing.email,
      category: data.category !== undefined ? data.category : existing.category,
      company: data.company !== undefined ? data.company.trim() : existing.company,
      address: data.address !== undefined ? data.address.trim() : existing.address,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
      isFavorite: data.isFavorite !== undefined ? Boolean(data.isFavorite) : existing.isFavorite,
      avatarColor: data.avatarColor || existing.avatarColor,
      updatedAt: new Date().toISOString()
    };

    contacts[index] = updated;
    this.saveContacts(contacts);
    return updated;
  }

  toggleFavorite(id) {
    const contacts = this.readContacts();
    const contact = contacts.find(c => c.id === id);
    if (!contact) return null;

    contact.isFavorite = !contact.isFavorite;
    contact.updatedAt = new Date().toISOString();
    this.saveContacts(contacts);
    return contact;
  }

  delete(id) {
    const contacts = this.readContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) return false;

    const removed = contacts.splice(index, 1)[0];
    this.saveContacts(contacts);
    return removed;
  }

  getStats() {
    const contacts = this.readContacts();
    const total = contacts.length;
    const favorites = contacts.filter(c => c.isFavorite).length;

    const categories = {
      Work: 0,
      Personal: 0,
      Family: 0,
      Friends: 0,
      Emergency: 0,
      Other: 0
    };

    contacts.forEach(c => {
      const cat = c.category;
      if (categories[cat] !== undefined) {
        categories[cat]++;
      } else {
        categories.Other++;
      }
    });

    return {
      total,
      favorites,
      categories
    };
  }

  exportCSV() {
    const contacts = this.readContacts();
    const headers = ['Name', 'Phone', 'Email', 'Category', 'Company', 'Address', 'Favorite', 'Notes', 'Created At'];
    
    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = contacts.map(c => [
      escapeCSV(c.name),
      escapeCSV(c.phone),
      escapeCSV(c.email),
      escapeCSV(c.category),
      escapeCSV(c.company),
      escapeCSV(c.address),
      escapeCSV(c.isFavorite ? 'Yes' : 'No'),
      escapeCSV(c.notes),
      escapeCSV(c.createdAt)
    ].join(','));

    return [headers.join(','), ...rows].join('\r\n');
  }

  exportVCF() {
    const contacts = this.readContacts();
    const vcfCards = contacts.map(c => {
      const nameParts = (c.name || '').split(' ');
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const firstName = nameParts[0] || '';

      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${c.name || ''}`,
        `N:${lastName};${firstName};;;`,
        c.company ? `ORG:${c.company}` : '',
        c.phone ? `TEL;TYPE=CELL:${c.phone}` : '',
        c.email ? `EMAIL;TYPE=INTERNET:${c.email}` : '',
        c.address ? `ADR;TYPE=HOME:;;${c.address};;;;` : '',
        c.notes ? `NOTE:${c.notes.replace(/\n/g, '\\n')}` : '',
        c.category ? `CATEGORIES:${c.category}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\r\n');
    });

    return vcfCards.join('\r\n\r\n');
  }

  importContacts(importedList) {
    if (!Array.isArray(importedList)) return { count: 0, imported: [] };
    const current = this.readContacts();
    const newItems = [];

    for (const item of importedList) {
      if (!item.name || !item.phone) continue;
      const contact = {
        id: uuidv4(),
        name: item.name.trim(),
        phone: item.phone.trim(),
        email: (item.email || '').trim(),
        category: item.category || 'Personal',
        company: (item.company || '').trim(),
        address: (item.address || '').trim(),
        notes: (item.notes || '').trim(),
        isFavorite: Boolean(item.isFavorite),
        avatarColor: item.avatarColor || this.getRandomAvatarColor(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      newItems.push(contact);
    }

    const combined = [...newItems, ...current];
    this.saveContacts(combined);
    return { count: newItems.length, imported: newItems };
  }
}

module.exports = new ContactModel();
