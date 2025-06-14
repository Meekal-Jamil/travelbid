const Message = require('../models/Message');

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

const getMessages = async (req, res) => {
  const userId = req.user._id;
  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'name')
      .populate('receiver', 'name');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { sendMessage, getMessages };
