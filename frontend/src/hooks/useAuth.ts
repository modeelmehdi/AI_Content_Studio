import {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
export default function useAuth(){const context=useContext(AuthContext);if(!context)throw Error('Authentication provider is missing.');return context}
