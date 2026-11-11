export type Kind = 'blog'|'linkedin'|'instagram'|'twitter'|'seo'|'image';
export type User = {id:string;name:string;email:string;created_at:string};
export type Content = {id:string;kind:Kind;title:string;text:string;seo_title:string;meta_description:string;suggestions:string[];image_url?:string;created_at:string;updated_at:string;source:string;model:string};
export type Health = {status:string;database:string;text_generation_configured:boolean;image_generation_configured:boolean;media_storage:string;environment:string};
export type Stats = {saved_items:number;successful_generations:number;failed_generations:number;by_category:Record<Kind,number>};
export const tools:{kind:Kind;title:string;icon:string;description:string;path:string}[]=[
 {kind:'blog',title:'Blog Writer',icon:'📝',description:'Create structured articles and blog posts.',path:'/blog-generator'},
 {kind:'linkedin',title:'LinkedIn Post',icon:'💼',description:'Write professional posts with a clear point of view.',path:'/generate/linkedin'},
 {kind:'instagram',title:'Instagram Caption',icon:'📱',description:'Create captions, calls to action, and hashtags.',path:'/generate/instagram'},
 {kind:'twitter',title:'X / Twitter Post',icon:'💬',description:'Shape concise, character-aware social posts.',path:'/generate/twitter'},
 {kind:'seo',title:'SEO Content',icon:'🔎',description:'Draft titles, meta descriptions, and keywords.',path:'/generate/seo'},
 {kind:'image',title:'AI Images',icon:'🎨',description:'Turn your prompts into original generated visuals.',path:'/generate/image'},
];
