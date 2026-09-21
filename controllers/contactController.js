const contactModel = require('../models/contactModel');

// Email regex validator
const isValidEmail = (email) => {
  if (!email) return true; // email is optional
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Phone validator (basic check: contains at least 7 digits)
const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

exports.getAllContacts = (req, res) => {
  try {
    const { search, category, isFavorite, sortBy } = req.query;
    const contacts = contactModel.getAll({ search, category, isFavorite, sortBy });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contacts',
      error: err.message
    });
  }
};

exports.getContactById = (req, res) => {
  try {
    const contact = contactModel.getById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: err.message
    });
  }
};

exports.createContact = (req, res) => {
  try {
    const { name, phone, email, category, company, address, notes, isFavorite, avatarColor } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required'
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Please enter a valid 7 to 15 digit phone number.'
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const newContact = contactModel.create({
      name,
      phone,
      email,
      category,
      company,
      address,
      notes,
      isFavorite,
      avatarColor
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: newContact
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create contact',
      error: err.message
    });
  }
};

exports.updateContact = (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, category, company, address, notes, isFavorite, avatarColor } = req.body;

    const existing = contactModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Contact name cannot be empty'
      });
    }

    if (phone !== undefined && !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    if (email !== undefined && email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format'
      });
    }

    const updated = contactModel.update(id, {
      name,
      phone,
      email,
      category,
      company,
      address,
      notes,
      isFavorite,
      avatarColor
    });

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update contact',
      error: err.message
    });
  }
};

exports.toggleFavorite = (req, res) => {
  try {
    const updated = contactModel.toggleFavorite(req.params.id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Contact ${updated.isFavorite ? 'added to' : 'removed from'} favorites`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
      error: err.message
    });
  }
};

exports.deleteContact = (req, res) => {
  try {
    const deleted = contactModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      data: deleted
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
      error: err.message
    });
  }
};

exports.getStats = (req, res) => {
  try {
    const stats = contactModel.getStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: err.message
    });
  }
};

exports.exportCSV = (req, res) => {
  try {
    const csvData = contactModel.exportCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.status(200).send(csvData);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV',
      error: err.message
    });
  }
};

exports.exportVCF = (req, res) => {
  try {
    const vcfData = contactModel.exportVCF();
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.vcf"');
    res.status(200).send(vcfData);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to export vCard',
      error: err.message
    });
  }
};

exports.importContacts = (req, res) => {
  try {
    const { contacts } = req.body;
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expected a non-empty array of contacts in "contacts" field.'
      });
    }

    const result = contactModel.importContacts(contacts);
    res.status(200).json({
      success: true,
      message: `Successfully imported ${result.count} contacts`,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to import contacts',
      error: err.message
    });
  }
};
