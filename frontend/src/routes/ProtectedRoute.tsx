import {Navigate,Outlet,useLocation} from 'react-router-dom';
import useAuth from '../hooks/useAuth';
export default function ProtectedRoute(){const {user,loading}=useAuth();const location=useLocation();if(loading)return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300" role="status">Checking your secure session…</main>;return user?<Outlet/>:<Navigate to="/login" state={{from:location.pathname}} replace/>}
