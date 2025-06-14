const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all messages sent or received by the user (legacy)
const getMessages = async (req, res) => {
  const userId = req.user._id;
  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name')
      .populate('receiver', 'name');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Get users you’ve chatted with (new)
const getChatUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const sent = await Message.find({ sender: userId }).distinct('receiver');
    const received = await Message.find({ receiver: userId }).distinct('sender');

    const partnerIds = [...new Set([...sent, ...received])];
    const users = await User.find({ _id: { $in: partnerIds } }).select('_id name email role');

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Get full conversation with a selected user
const getMessagesBetweenUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender receiver', 'name');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,              // legacy if needed
  getChatUsers,             // ✅ NEW
  getMessagesBetweenUsers   // ✅ NEW
};
