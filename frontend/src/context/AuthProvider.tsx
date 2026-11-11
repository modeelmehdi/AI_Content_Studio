import {useEffect,useState,type ReactNode} from 'react';
import {AuthContext} from './AuthContext';
import type {User} from '../types/studio';
import {api} from '../services/api';
export default function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null);const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;api<{user:User}>('/api/auth/me').then(d=>{if(active)setUser(d.user)}).catch(()=>{}).finally(()=>{if(active)setLoading(false)});const ended=()=>setUser(null);window.addEventListener('studio-session-ended',ended);return()=>{active=false;window.removeEventListener('studio-session-ended',ended)}},[]);
 async function logout(){await api('/api/auth/logout',{method:'POST'});setUser(null)}
 return <AuthContext.Provider value={{user,loading,setUser,logout}}>{children}</AuthContext.Provider>;
}
