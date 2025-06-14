import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container } from 'react-bootstrap';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAll = async () => {
      const usersRes = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);

      const tripsRes = await axios.get('/api/admin/trips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(tripsRes.data);
    };

    fetchAll();
  }, []);

  return (
    <Container className="mt-4">
      <h2>All Users</h2>
      <Table striped bordered hover>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mt-5">All Trips</h2>
      <Table striped bordered hover>
        <thead>
          <tr><th>Traveler</th><th>Destination</th><th>Budget</th></tr>
        </thead>
        <tbody>
          {trips.map(t => (
            <tr key={t._id}>
              <td>{t.traveler.name}</td>
              <td>{t.destination}</td>
              <td>{t.budget}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminPanel;
