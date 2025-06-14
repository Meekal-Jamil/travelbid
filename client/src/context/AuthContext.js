import { createContext, useContext, useEffect, useReducer } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  loading: true, // ✅ track auth status
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role', action.payload.user.role);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        role: action.payload.user.role,
        loading: false, // ✅ done loading
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return {
        user: null,
        token: null,
        role: null,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: true };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchProfile = async () => {
      if (state.token) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${state.token}` },
          });
          dispatch({ type: 'LOGIN', payload: { token: state.token, user: res.data } });
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
