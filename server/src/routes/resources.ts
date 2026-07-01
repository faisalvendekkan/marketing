import { resourceRouter } from './resource.factory';
import * as v from '../validators/resource.validator';

export const campaignRouter = resourceRouter({
  crud: { table: 'campaigns', writable: ['type_id','owner_id','name','description','objective','status','budget','spent','start_date','end_date'], searchable: ['name','objective'], sortable: ['name','status','budget','created_at','updated_at'] },
  permission: 'campaigns.manage', readPermission: 'campaigns.view',
  createSchema: v.campaignCreate, updateSchema: v.campaignUpdate, entityName: 'campaign',
});

export const leadRouter = resourceRouter({
  crud: { table: 'leads', writable: ['source_id','campaign_id','assigned_to','full_name','email','phone','company_name','message','value','status'], searchable: ['full_name','email','company_name'], sortable: ['full_name','status','value','created_at'] },
  permission: 'leads.manage', entityName: 'lead',
  createSchema: v.leadCreate, updateSchema: v.leadUpdate,
});

export const postRouter = resourceRouter({
  crud: { table: 'posts', writable: ['campaign_id','author_id','media_id','platform','title','body','link','tags','status','approval_note'], searchable: ['title','body'], sortable: ['status','platform','created_at','published_at'] },
  permission: 'posts.manage', entityName: 'post',
  createSchema: v.postCreate, updateSchema: v.postUpdate,
});

export const taskRouter = resourceRouter({
  crud: { table: 'tasks', writable: ['assigned_to','created_by','campaign_id','title','description','priority','status','due_date'], searchable: ['title','description'], sortable: ['priority','status','due_date','created_at'] },
  permission: 'dashboard.view', entityName: 'task',
  createSchema: v.taskCreate, updateSchema: v.taskUpdate,
});

export const contentRouter = resourceRouter({
  crud: { table: 'content_library', writable: ['created_by','title','content_type','body','language','tags','status'], searchable: ['title','tags'], sortable: ['title','status','created_at'] },
  permission: 'ai.content', entityName: 'content',
  createSchema: v.contentCreate, updateSchema: v.contentUpdate,
});

export const seoProjectRouter = resourceRouter({
  crud: { table: 'seo_projects', writable: ['name','domain','location','language'], searchable: ['name','domain'], sortable: ['name','created_at'] },
  permission: 'seo.manage', entityName: 'seo_project',
  createSchema: v.seoProjectCreate, updateSchema: v.seoProjectUpdate,
});

export const emailCampaignRouter = resourceRouter({
  crud: { table: 'email_campaigns', writable: ['template_id','list_id','name','subject','from_name','from_email','html_body','status','scheduled_at'], searchable: ['name','subject'], sortable: ['name','status','created_at'] },
  permission: 'email.manage', entityName: 'email_campaign',
  createSchema: v.emailCampaignCreate, updateSchema: v.emailCampaignUpdate,
});

export const whatsappCampaignRouter = resourceRouter({
  crud: { table: 'whatsapp_campaigns', writable: ['template_id','name','message','status','scheduled_at'], searchable: ['name'], sortable: ['name','status','created_at'] },
  permission: 'whatsapp.manage', entityName: 'whatsapp_campaign',
  createSchema: v.whatsappCampaignCreate, updateSchema: v.whatsappCampaignUpdate,
});

export const blogRouter = resourceRouter({
  crud: { table: 'blog_articles', writable: ['author_id','title','slug','excerpt','body','cover_image','meta_title','meta_description','keywords','language','status','published_at'], searchable: ['title','keywords'], sortable: ['title','status','created_at','published_at'] },
  permission: 'seo.manage', readPermission: 'campaigns.view', entityName: 'blog_article',
  createSchema: v.blogCreate, updateSchema: v.blogUpdate,
});

export const automationRouter = resourceRouter({
  crud: { table: 'automations', writable: ['name','trigger_type','status'], searchable: ['name','trigger_type'], sortable: ['name','status','created_at'] },
  permission: 'campaigns.manage', entityName: 'automation',
  createSchema: v.automationCreate, updateSchema: v.automationUpdate,
});

export const gbpRouter = resourceRouter({
  crud: { table: 'google_business_posts', writable: ['post_type','title','body','cta_type','cta_url','status'], searchable: ['title','body'], sortable: ['post_type','status','created_at'] },
  permission: 'posts.manage', entityName: 'google_business_post',
  createSchema: v.gbpCreate, updateSchema: v.gbpUpdate,
});

export const reportRouter = resourceRouter({
  crud: { table: 'reports', writable: ['name','type','status','created_by'], searchable: ['name'], sortable: ['name','type','created_at'] },
  permission: 'reports.manage', entityName: 'report',
  createSchema: v.reportCreate, updateSchema: v.reportUpdate,
});
