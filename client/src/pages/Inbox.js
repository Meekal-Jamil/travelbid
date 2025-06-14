import React, { useEffect, useState } from 'react';
import { Row, Col, ListGroup, Form, Button, Card } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Inbox = () => {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchChatUsers();
    fetchAllUsers();
  }, []);

  const fetchChatUsers = async () => {
    const res = await api.get('/api/messages/chats');
    setChatUsers(res.data);
  };

  const fetchAllUsers = async () => {
    const res = await api.get('/api/auth/users');
    setAllUsers(res.data);
  };

  const fetchConversation = async (userId) => {
    setSelectedUser(userId);
    const res = await api.get(`/api/messages/conversation/${userId}`);
    setMessages(res.data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    await api.post('/api/messages', {
      receiverId: selectedUser,
      content
    });
    setContent('');
    fetchConversation(selectedUser);
  };

  const handleStartNewChat = (userId) => {
    setSelectedUser(userId);
    fetchConversation(userId);
  };

  return (
    <Row className="mt-4">
      <Col md={4}>
        <h4>Chats</h4>
        <ListGroup className="mb-4">
          {chatUsers.map((user) => (
            <ListGroup.Item
              key={user._id}
              action
              active={user._id === selectedUser}
              onClick={() => fetchConversation(user._id)}
            >
              {user.name} ({user.role})
            </ListGroup.Item>
          ))}
        </ListGroup>

        <h6>Start New Chat</h6>
        <Form.Select
          onChange={(e) => handleStartNewChat(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Select a user</option>
          {allUsers.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.role})
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col md={8}>
        {selectedUser ? (
          <>
            <h5>Conversation</h5>
            <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '1rem' }}>
              {messages.map((msg) => {
                const isMe = msg.sender._id === user?.id || msg.sender._id === user?._id;
                const rawTime = msg.timestamp || msg.createdAt;
                const timestamp = rawTime ? new Date(rawTime).toLocaleString() : 'Unknown time';

                return (
                  <div key={msg._id} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                    <Card
                      className={`mb-2 ${isMe ? 'bg-light text-dark' : 'bg-white border'}`}
                      style={{ maxWidth: '75%' }}
                    >
                      <Card.Body className={`${isMe ? 'text-end' : 'text-start'}`}>
                        <p className="mb-1">
                          <strong>{isMe ? 'Me' : msg.sender.name}:</strong> {msg.content}
                        </p>
                        <small className="text-muted">{timestamp}</small>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })}
            </div>

            <Form onSubmit={handleSend}>
              <Form.Group className="mb-2">
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type a message..."
                  required
                />
              </Form.Group>
              <Button type="submit" variant="success">Send</Button>
            </Form>
          </>
        ) : (
          <p className="text-muted">Select a chat to view messages</p>
        )}
      </Col>
    </Row>
  );
};

export default Inbox;
