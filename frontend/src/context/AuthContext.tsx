import {createContext} from 'react';
import type {User} from '../types/studio';
export type AuthState={user:User|null;loading:boolean;setUser:(user:User|null)=>void;logout:()=>Promise<void>};
export const AuthContext=createContext<AuthState|undefined>(undefined);
