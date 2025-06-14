import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TravelerDashboard from './pages/TravelerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import TripForm from './pages/TripForm';
import Inbox from './pages/Inbox';
import Logout from './pages/Logout';
import BookingHistory from './pages/BookingHistory';
import AdminPanel from './pages/AdminPanel';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/traveler" element={<TravelerDashboard />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/post-trip" element={<TripForm />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
export default App;
