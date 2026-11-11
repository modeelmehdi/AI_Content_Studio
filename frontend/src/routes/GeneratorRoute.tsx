import {useParams,Navigate} from 'react-router-dom';
import {tools} from '../types/studio';
import BlogGenerator from '../pages/BlogGenerator';
export default function GeneratorRoute(){const {kind}=useParams();const tool=tools.find(t=>t.kind===kind);return tool?<BlogGenerator key={tool.kind} kind={tool.kind}/>:<Navigate to="/dashboard" replace/>}
