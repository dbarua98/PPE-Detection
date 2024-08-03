import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

export default function UnauthenticatedContent() {
  return (
    <Routes>
      <Route
        path='/login' 
        element={
            <Login/>
        }
      />
      <Route path='*' element={<Navigate to={'/login'} />}></Route>
    </Routes>
  );
}
