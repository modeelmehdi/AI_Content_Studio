import {api} from './api';
import type {User} from '../types/studio';
export async function login(email:string,password:string){return api<{user:User;csrf_token:string}>('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})})}
export async function register(name:string,email:string,password:string){return api<{user:User;csrf_token:string}>('/api/auth/register',{method:'POST',body:JSON.stringify({name,email,password})})}
