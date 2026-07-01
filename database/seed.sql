-- =============================================================================
-- Abilix AI Marketing Studio - Seed data
-- Run AFTER schema.sql. Idempotent via INSERT ... ON DUPLICATE KEY UPDATE.
-- Default super admin login:
--   email:    admin@abilix.ai
--   password: Admin@12345   (change immediately after first login)
-- =============================================================================

SET NAMES utf8mb4;

-- ---- Roles -------------------------------------------------------------------
INSERT INTO roles (id, name, slug, description, is_system) VALUES
  (1,'Super Admin','super_admin','Full system access',1),
  (2,'Admin','admin','Company administrator',1),
  (3,'Marketing Manager','marketing_manager','Manages campaigns and team',1),
  (4,'Content Writer','content_writer','Creates written content',1),
  (5,'Graphic Designer','graphic_designer','Creates visual assets',1),
  (6,'Video Editor','video_editor','Creates video assets',1),
  (7,'SEO Executive','seo_executive','Handles SEO tasks',1),
  (8,'Sales Executive','sales_executive','Handles leads and sales',1),
  (9,'Client','client','External client access',1),
  (10,'Viewer','viewer','Read-only access',1)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ---- Permissions (module.action) --------------------------------------------
INSERT INTO permissions (name, slug, module) VALUES
  ('View Dashboard','dashboard.view','dashboard'),
  ('Manage Campaigns','campaigns.manage','campaigns'),
  ('View Campaigns','campaigns.view','campaigns'),
  ('Manage Posts','posts.manage','social'),
  ('Approve Posts','posts.approve','social'),
  ('Use AI Content','ai.content','ai'),
  ('Use AI Image','ai.image','ai'),
  ('Use AI Video','ai.video','ai'),
  ('Manage SEO','seo.manage','seo'),
  ('Manage Email','email.manage','email'),
  ('Manage WhatsApp','whatsapp.manage','whatsapp'),
  ('Manage Leads','leads.manage','leads'),
  ('View Analytics','analytics.view','analytics'),
  ('Manage Reports','reports.manage','reports'),
  ('Manage Users','users.manage','admin'),
  ('Manage Roles','roles.manage','admin'),
  ('Manage Settings','settings.manage','settings'),
  ('View Audit Logs','audit.view','admin')
ON DUPLICATE KEY UPDATE name=VALUES(name), module=VALUES(module);

-- Super Admin & Admin get every permission
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE slug <> 'audit.view';

-- Marketing Manager
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE slug IN
  ('dashboard.view','campaigns.manage','campaigns.view','posts.manage','posts.approve',
   'ai.content','ai.image','ai.video','seo.manage','email.manage','whatsapp.manage',
   'leads.manage','analytics.view','reports.manage');

-- Content Writer
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE slug IN
  ('dashboard.view','campaigns.view','posts.manage','ai.content');

-- Graphic Designer / Video Editor
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE slug IN ('dashboard.view','posts.manage','ai.image');
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 6, id FROM permissions WHERE slug IN ('dashboard.view','posts.manage','ai.video');

-- SEO Executive
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 7, id FROM permissions WHERE slug IN ('dashboard.view','seo.manage','ai.content','analytics.view');

-- Sales Executive
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 8, id FROM permissions WHERE slug IN ('dashboard.view','leads.manage','analytics.view');

-- Client & Viewer (read-only)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 9, id FROM permissions WHERE slug IN ('dashboard.view','campaigns.view','analytics.view');
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 10, id FROM permissions WHERE slug IN ('dashboard.view','campaigns.view','analytics.view');

-- ---- Demo company ------------------------------------------------------------
INSERT INTO companies (id, name, slug, website, industry, timezone) VALUES
  (1,'Abilix Demo','abilix-demo','https://abilix.ai','Marketing','Asia/Kolkata')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---- Super admin user (password: Admin@12345) --------------------------------
INSERT INTO users (id, company_id, role_id, first_name, last_name, email, password_hash, provider, email_verified_at, status)
VALUES (1, 1, 1, 'Super', 'Admin', 'admin@abilix.ai',
        '$2b$10$qsOYkq.wqsnkSzDMUlFtEO0UHbBwpMI4Yhp1yJHi0yOh6K3JTpkwi',
        'local', NOW(), 'active')
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id), status='active';

-- ---- Brand kit ---------------------------------------------------------------
INSERT INTO brand_kits (id, company_id, name, primary_color, secondary_color, accent_color, font_heading, font_body, brand_voice, tagline)
VALUES (1,1,'Default Brand','#6366F1','#0EA5E9','#F59E0B','Inter','Inter',
        'Confident, helpful and modern. Speaks to growth-focused businesses.',
        'AI marketing, simplified.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---- Campaign types ----------------------------------------------------------
INSERT INTO campaign_types (id, name, slug, icon) VALUES
  (1,'Social Media','social-media','share-2'),
  (2,'Email','email','mail'),
  (3,'SEO','seo','search'),
  (4,'Paid Ads','paid-ads','megaphone'),
  (5,'WhatsApp','whatsapp','message-circle'),
  (6,'Content','content','file-text')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---- Lead sources ------------------------------------------------------------
INSERT INTO lead_sources (id, company_id, name, channel) VALUES
  (1,1,'Website Form','website'),
  (2,1,'Facebook Ads','facebook'),
  (3,1,'Google Ads','google'),
  (4,1,'Referral','referral'),
  (5,1,'WhatsApp','whatsapp')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---- Subscription ------------------------------------------------------------
INSERT INTO subscriptions (id, company_id, plan, status, seats, price, currency)
VALUES (1,1,'pro','active',10,49.00,'USD')
ON DUPLICATE KEY UPDATE plan=VALUES(plan);

-- ---- Sample campaigns --------------------------------------------------------
INSERT INTO campaigns (id, company_id, type_id, owner_id, name, description, objective, status, budget, spent, start_date, end_date) VALUES
  (1,1,1,1,'Summer Launch','Product launch across social channels','awareness','active',5000.00,1850.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
  (2,1,2,1,'Newsletter Q3','Quarterly nurture newsletter','engagement','scheduled',1200.00,0.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
  (3,1,3,1,'SEO Growth','Rank for core keywords','traffic','active',3000.00,900.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY))
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---- Sample leads ------------------------------------------------------------
INSERT INTO leads (company_id, source_id, campaign_id, full_name, email, phone, status, value) VALUES
  (1,1,1,'Aarav Menon','aarav@example.com','+91 90000 11111','new',1200.00),
  (1,2,1,'Sara Thomas','sara@example.com','+91 90000 22222','contacted',3400.00),
  (1,3,3,'John Carter','john@example.com','+1 555 0101','qualified',5600.00),
  (1,4,1,'Meera Nair','meera@example.com','+91 90000 33333','won',8900.00),
  (1,5,2,'Liam Brown','liam@example.com','+1 555 0102','new',450.00);

-- ---- Sample posts ------------------------------------------------------------
INSERT INTO posts (company_id, campaign_id, author_id, platform, title, body, status) VALUES
  (1,1,1,'instagram','Summer is here','Big things coming this summer. Stay tuned! #launch','scheduled'),
  (1,1,1,'facebook','New product teaser','Something new is on the way. Can you guess what?','pending_approval'),
  (1,1,1,'linkedin','Behind the build','How our team ships marketing at speed with AI.','draft');

-- ---- Sample tasks ------------------------------------------------------------
INSERT INTO tasks (company_id, assigned_to, created_by, campaign_id, title, priority, status, due_date) VALUES
  (1,1,1,1,'Design summer creatives','high','in_progress', DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
  (1,1,1,2,'Write newsletter draft','medium','todo', DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
  (1,1,1,3,'Keyword research batch 1','high','review', DATE_ADD(CURDATE(), INTERVAL 2 DAY));

-- ---- Sample notifications ----------------------------------------------------
INSERT INTO notifications (user_id, title, body, type) VALUES
  (1,'Welcome to Abilix','Your workspace is ready. Explore the dashboard.','success'),
  (1,'Post pending approval','A Facebook post is awaiting your approval.','info');

-- ---- Analytics sample (last 30 days of key metrics) --------------------------
INSERT INTO analytics_events (company_id, metric, dimension, value, event_date)
SELECT 1, 'traffic', 'organic',
       FLOOR(200 + RAND(seq)*400),
       DATE_SUB(CURDATE(), INTERVAL seq DAY)
FROM (SELECT 0 seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
      UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17
      UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
      UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29) d;

INSERT INTO analytics_events (company_id, metric, dimension, value, event_date)
SELECT 1, 'conversions', 'all',
       FLOOR(5 + RAND(seq+100)*25),
       DATE_SUB(CURDATE(), INTERVAL seq DAY)
FROM (SELECT 0 seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
      UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17
      UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
      UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29) d;

-- End of seed
