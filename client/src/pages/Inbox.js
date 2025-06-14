import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const token = localStorage.getItem('token');

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/messages`, {
        receiverId,
        content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message');
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Inbox</h2>
      <ul>
        {messages.map(msg => (
          <li key={msg._id}>
            <b>{msg.sender.name}</b> ➡ <i>{msg.receiver.name}</i>: {msg.content}
          </li>
        ))}
      </ul>

      <h3>Send a New Message</h3>
      <form onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Receiver User ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          required
        />
        <textarea
          placeholder="Message content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default Inbox;
