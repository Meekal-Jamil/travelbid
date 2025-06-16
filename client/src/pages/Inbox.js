import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Alert } from 'react-bootstrap';
import axios from '../utils/axios';
import '../styles/inbox.css';

const Inbox = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User ID not found. Please login again.');
      setLoading(false);
      return;
    }
    setCurrentUserId(userId);
    // console.log(currentUserId);
  }, []);

  useEffect(() => {
    if (currentUserId) {
      Promise.all([fetchChatUsers(), fetchAllUsers()])
        .catch(err => {
          console.error('Error fetching data:', err);
          setError('Failed to load data. Please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentUserId]);

  const fetchChatUsers = async () => {
    try {
      const response = await axios.get('/api/messages/chats');
      setChatUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching chat users:', err);
      throw err;
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users');
      const filteredUsers = response.data.filter(user => user._id !== currentUserId);
      setAllUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  };

  const fetchConversation = async (userId) => {
    try {
      setSelectedUser(userId);
      const response = await axios.get(`/api/messages/conversation/${userId}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to fetch conversation. Please try again later.');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !content.trim()) return;

    try {
      await axios.post('/api/messages', {
        receiverId: selectedUser,
        content: content.trim()
      });
      setContent('');
      fetchConversation(selectedUser);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again later.');
    }
  };

  const handleStartNewChat = (userId) => {
    if (!userId || userId === currentUserId) return;
    setSelectedUser(userId);
    fetchConversation(userId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container >
      <h2 className="mb-4">Inbox</h2>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>Chats</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {chatUsers.map((user) => (
                  <ListGroup.Item
                    key={user._id}
                    action
                    active={user._id === selectedUser}
                    onClick={() => fetchConversation(user._id)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-0">{user.name}</h6>
                      <small className="text-muted">{user.role}</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>Start New Chat</Card.Header>
            <Card.Body>
              <Form.Select
                onChange={(e) => handleStartNewChat(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Select a user</option>
                {allUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </Form.Select>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {selectedUser ? (
            <Card>
              <Card.Body>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '1rem' }}>
                  {messages.map((msg) => {
                    const isMe = msg.sender._id === currentUserId;
                    console.log(currentUserId);
                    return (
                      <div key={msg._id} className={`d-flex ${isMe ? 'justify-content-end msg-sent' : 'justify-content-start msg-received'}`}>
                        <Card
                          className={`mb-2 ${isMe ? 'bg-light text-dark' : 'bg-white border'}`}
                          style={{ maxWidth: '75%' }}
                        >
                          <Card.Body className={`${isMe ? 'text-end' : 'text-start'}`}>
                            <p className="mb-1">
                              <strong>{isMe ? 'Me' : msg.sender.name}:</strong> {msg.content}
                            </p>
                            <small className="text-muted">{formatDate(msg.timestamp || msg.createdAt)}</small>
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
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body className="text-center text-muted">
                Select a chat to view messages
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Inbox;
