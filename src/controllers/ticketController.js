const ticketModel = require('../models/ticketModel');

const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const ticket = await ticketModel.createTicket(title, description, userId);
    return res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const listTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await ticketModel.getTicketsByUserId(userId);
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('List tickets error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ticket = await ticketModel.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['open', 'in_progress', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const ticket = await ticketModel.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
    }

    const current = ticket.status;
    const target = status;

    if (current === target) {
      return res.status(200).json({ id: ticket.id, status: ticket.status });
    }

    let allowed = false;
    if (current === 'open' && (target === 'in_progress' || target === 'closed')) {
      allowed = true;
    } else if (current === 'in_progress' && target === 'closed') {
      allowed = true;
    }

    if (!allowed) {
      return res.status(400).json({ error: `Invalid status transition from ${current} to ${target}` });
    }

    const updatedTicket = await ticketModel.updateTicketStatus(id, target);
    return res.status(200).json({ id: updatedTicket.id, status: updatedTicket.status });
  } catch (error) {
    console.error('Update ticket status error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createTicket,
  listTickets,
  getTicketById,
  updateTicketStatus
};
