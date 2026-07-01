-- =============================================================================
-- Abilix AI Marketing Studio - MySQL Schema
-- Engine: InnoDB | Charset: utf8mb4 | Compatible with Hostinger MySQL 8.x
-- =============================================================================
-- All tables use foreign keys, indexes and are normalized.
-- Use installation.sql for a clean, ordered install.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- RBAC: roles, permissions, role_permissions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(50)  NOT NULL,
  slug          VARCHAR(50)  NOT NULL,
  description   VARCHAR(255) NULL,
  is_system     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL,
  module        VARCHAR(60)  NOT NULL,
  description   VARCHAR(255) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permissions_slug (slug),
  KEY idx_permissions_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  KEY idx_rp_permission (permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Companies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150) NOT NULL,
  slug          VARCHAR(160) NOT NULL,
  website       VARCHAR(255) NULL,
  industry      VARCHAR(100) NULL,
  logo_url      VARCHAR(255) NULL,
  phone         VARCHAR(40)  NULL,
  email         VARCHAR(150) NULL,
  address       VARCHAR(255) NULL,
  city          VARCHAR(100) NULL,
  country       VARCHAR(100) NULL,
  timezone      VARCHAR(64)  NOT NULL DEFAULT 'UTC',
  status        ENUM('active','suspended','archived') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_companies_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id       INT UNSIGNED NULL,
  role_id          INT UNSIGNED NOT NULL,
  first_name       VARCHAR(80)  NOT NULL,
  last_name        VARCHAR(80)  NULL,
  email            VARCHAR(150) NOT NULL,
  password_hash    VARCHAR(255) NULL,
  phone            VARCHAR(40)  NULL,
  avatar_url       VARCHAR(255) NULL,
  google_id        VARCHAR(100) NULL,
  provider         ENUM('local','google') NOT NULL DEFAULT 'local',
  email_verified_at TIMESTAMP   NULL,
  two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0,
  two_factor_secret VARCHAR(255) NULL,
  status           ENUM('active','invited','suspended') NOT NULL DEFAULT 'active',
  last_login_at    TIMESTAMP    NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_google (google_id),
  KEY idx_users_company (company_id),
  KEY idx_users_role (role_id),
  KEY idx_users_status (status),
  CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE SET NULL,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Auth support: refresh tokens (sessions), password resets, email verifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  token_hash    CHAR(64)     NOT NULL,
  user_agent    VARCHAR(255) NULL,
  ip_address    VARCHAR(45)  NULL,
  expires_at    TIMESTAMP    NOT NULL,
  revoked_at    TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  KEY idx_refresh_user (user_id),
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  token_hash    CHAR(64)     NOT NULL,
  expires_at    TIMESTAMP    NOT NULL,
  used_at       TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pwreset_token (token_hash),
  KEY idx_pwreset_user (user_id),
  CONSTRAINT fk_pwreset_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verifications (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  token_hash    CHAR(64)     NOT NULL,
  expires_at    TIMESTAMP    NOT NULL,
  verified_at   TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_emailverif_token (token_hash),
  KEY idx_emailverif_user (user_id),
  CONSTRAINT fk_emailverif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Brand kit
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_kits (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  name          VARCHAR(120) NOT NULL,
  primary_color VARCHAR(9)   NULL,
  secondary_color VARCHAR(9) NULL,
  accent_color  VARCHAR(9)   NULL,
  logo_url      VARCHAR(255) NULL,
  font_heading  VARCHAR(80)  NULL,
  font_body     VARCHAR(80)  NULL,
  brand_voice   TEXT         NULL,
  tagline       VARCHAR(255) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_brandkit_company (company_id),
  CONSTRAINT fk_brandkit_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Media & content library
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  uploaded_by   INT UNSIGNED NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  mime_type     VARCHAR(120) NOT NULL,
  file_size     INT UNSIGNED NOT NULL DEFAULT 0,
  width         INT UNSIGNED NULL,
  height        INT UNSIGNED NULL,
  type          ENUM('image','video','audio','document','other') NOT NULL DEFAULT 'image',
  alt_text      VARCHAR(255) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_media_company (company_id),
  KEY idx_media_type (type),
  CONSTRAINT fk_media_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_library (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  created_by    INT UNSIGNED NULL,
  title         VARCHAR(200) NOT NULL,
  content_type  VARCHAR(60)  NOT NULL DEFAULT 'text',
  body          MEDIUMTEXT   NULL,
  language      VARCHAR(20)  NOT NULL DEFAULT 'en',
  tags          VARCHAR(255) NULL,
  status        ENUM('draft','approved','archived') NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_content_company (company_id),
  KEY idx_content_status (status),
  CONSTRAINT fk_content_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_content_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Campaigns
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_types (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(80)  NOT NULL,
  slug          VARCHAR(80)  NOT NULL,
  icon          VARCHAR(60)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_campaigntype_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaigns (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  type_id       INT UNSIGNED NULL,
  owner_id      INT UNSIGNED NULL,
  name          VARCHAR(160) NOT NULL,
  description   TEXT         NULL,
  objective     VARCHAR(120) NULL,
  status        ENUM('draft','scheduled','active','paused','completed','archived') NOT NULL DEFAULT 'draft',
  budget        DECIMAL(12,2) NOT NULL DEFAULT 0,
  spent         DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_date    DATE         NULL,
  end_date      DATE         NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_campaign_company (company_id),
  KEY idx_campaign_status (status),
  KEY idx_campaign_type (type_id),
  CONSTRAINT fk_campaign_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_campaign_type FOREIGN KEY (type_id) REFERENCES campaign_types (id) ON DELETE SET NULL,
  CONSTRAINT fk_campaign_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Posts & schedules
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  campaign_id   INT UNSIGNED NULL,
  author_id     INT UNSIGNED NULL,
  media_id      BIGINT UNSIGNED NULL,
  platform      ENUM('facebook','instagram','linkedin','x','threads','pinterest','google_business','youtube') NOT NULL,
  title         VARCHAR(200) NULL,
  body          MEDIUMTEXT   NULL,
  link          VARCHAR(500) NULL,
  tags          VARCHAR(255) NULL,
  status        ENUM('draft','pending_approval','approved','scheduled','published','failed') NOT NULL DEFAULT 'draft',
  approval_note VARCHAR(255) NULL,
  external_id   VARCHAR(120) NULL,
  published_at  TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_posts_company (company_id),
  KEY idx_posts_campaign (campaign_id),
  KEY idx_posts_status (status),
  KEY idx_posts_platform (platform),
  CONSTRAINT fk_posts_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL,
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_posts_media FOREIGN KEY (media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_schedules (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id       BIGINT UNSIGNED NOT NULL,
  scheduled_at  TIMESTAMP    NOT NULL,
  timezone      VARCHAR(64)  NOT NULL DEFAULT 'UTC',
  status        ENUM('queued','processing','sent','failed','canceled') NOT NULL DEFAULT 'queued',
  attempts      INT UNSIGNED NOT NULL DEFAULT 0,
  last_error    VARCHAR(255) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_schedule_post (post_id),
  KEY idx_schedule_time (scheduled_at),
  KEY idx_schedule_status (status),
  CONSTRAINT fk_schedule_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- AI conversations, messages, prompt history
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_conversations (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  user_id       INT UNSIGNED NULL,
  title         VARCHAR(200) NOT NULL DEFAULT 'New conversation',
  feature       VARCHAR(60)  NOT NULL DEFAULT 'content',
  model         VARCHAR(80)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_aiconv_company (company_id),
  KEY idx_aiconv_user (user_id),
  CONSTRAINT fk_aiconv_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_aiconv_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_messages (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  role            ENUM('system','user','assistant') NOT NULL,
  content         MEDIUMTEXT   NOT NULL,
  tokens          INT UNSIGNED NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_aimsg_conv (conversation_id),
  CONSTRAINT fk_aimsg_conv FOREIGN KEY (conversation_id) REFERENCES ai_conversations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prompt_history (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  user_id       INT UNSIGNED NULL,
  feature       VARCHAR(60)  NOT NULL,
  prompt        MEDIUMTEXT   NOT NULL,
  result        MEDIUMTEXT   NULL,
  tone          VARCHAR(40)  NULL,
  language      VARCHAR(20)  NOT NULL DEFAULT 'en',
  model         VARCHAR(80)  NULL,
  tokens_used   INT UNSIGNED NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_prompt_company (company_id),
  KEY idx_prompt_feature (feature),
  CONSTRAINT fk_prompt_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_prompt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Blog & SEO
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blog_articles (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  author_id     INT UNSIGNED NULL,
  title         VARCHAR(220) NOT NULL,
  slug          VARCHAR(240) NOT NULL,
  excerpt       VARCHAR(500) NULL,
  body          MEDIUMTEXT   NULL,
  cover_image   VARCHAR(255) NULL,
  meta_title    VARCHAR(180) NULL,
  meta_description VARCHAR(320) NULL,
  keywords      VARCHAR(255) NULL,
  language      VARCHAR(20)  NOT NULL DEFAULT 'en',
  status        ENUM('draft','review','published','archived') NOT NULL DEFAULT 'draft',
  published_at  TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_slug (company_id, slug),
  KEY idx_blog_status (status),
  CONSTRAINT fk_blog_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_projects (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  name          VARCHAR(160) NOT NULL,
  domain        VARCHAR(200) NOT NULL,
  location      VARCHAR(120) NULL,
  language      VARCHAR(20)  NOT NULL DEFAULT 'en',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_seoproj_company (company_id),
  CONSTRAINT fk_seoproj_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS keywords (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id    INT UNSIGNED NOT NULL,
  keyword       VARCHAR(200) NOT NULL,
  search_volume INT UNSIGNED NULL,
  difficulty    TINYINT UNSIGNED NULL,
  cpc           DECIMAL(8,2) NULL,
  current_rank  INT UNSIGNED NULL,
  intent        ENUM('informational','navigational','commercial','transactional') NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_keyword_project (project_id),
  CONSTRAINT fk_keyword_project FOREIGN KEY (project_id) REFERENCES seo_projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Google Business posts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS google_business_posts (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  created_by    INT UNSIGNED NULL,
  post_type     ENUM('update','offer','event','product') NOT NULL DEFAULT 'update',
  title         VARCHAR(200) NULL,
  body          TEXT         NULL,
  cta_type      VARCHAR(40)  NULL,
  cta_url       VARCHAR(500) NULL,
  media_id      BIGINT UNSIGNED NULL,
  starts_at     TIMESTAMP    NULL,
  ends_at       TIMESTAMP    NULL,
  status        ENUM('draft','scheduled','published','failed') NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_gbp_company (company_id),
  CONSTRAINT fk_gbp_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_gbp_media FOREIGN KEY (media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Email marketing
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_templates (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  name          VARCHAR(160) NOT NULL,
  subject       VARCHAR(255) NULL,
  html_body     MEDIUMTEXT   NULL,
  category      VARCHAR(60)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_emailtpl_company (company_id),
  CONSTRAINT fk_emailtpl_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_lists (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  name          VARCHAR(160) NOT NULL,
  description   VARCHAR(255) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_emaillist_company (company_id),
  CONSTRAINT fk_emaillist_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_subscribers (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  list_id       INT UNSIGNED NOT NULL,
  email         VARCHAR(180) NOT NULL,
  full_name     VARCHAR(160) NULL,
  status        ENUM('subscribed','unsubscribed','bounced') NOT NULL DEFAULT 'subscribed',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subscriber (list_id, email),
  CONSTRAINT fk_subscriber_list FOREIGN KEY (list_id) REFERENCES email_lists (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_campaigns (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  template_id   INT UNSIGNED NULL,
  list_id       INT UNSIGNED NULL,
  name          VARCHAR(180) NOT NULL,
  subject       VARCHAR(255) NOT NULL,
  from_name     VARCHAR(120) NULL,
  from_email    VARCHAR(180) NULL,
  html_body     MEDIUMTEXT   NULL,
  status        ENUM('draft','scheduled','sending','sent','paused') NOT NULL DEFAULT 'draft',
  scheduled_at  TIMESTAMP    NULL,
  sent_count    INT UNSIGNED NOT NULL DEFAULT 0,
  open_count    INT UNSIGNED NOT NULL DEFAULT 0,
  click_count   INT UNSIGNED NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_emailcamp_company (company_id),
  CONSTRAINT fk_emailcamp_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_emailcamp_template FOREIGN KEY (template_id) REFERENCES email_templates (id) ON DELETE SET NULL,
  CONSTRAINT fk_emailcamp_list FOREIGN KEY (list_id) REFERENCES email_lists (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- WhatsApp marketing
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  name          VARCHAR(160) NOT NULL,
  language      VARCHAR(20)  NOT NULL DEFAULT 'en',
  body          TEXT         NOT NULL,
  category      VARCHAR(60)  NULL,
  status        ENUM('draft','approved','rejected') NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_watpl_company (company_id),
  CONSTRAINT fk_watpl_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  template_id   INT UNSIGNED NULL,
  name          VARCHAR(180) NOT NULL,
  message       TEXT         NULL,
  status        ENUM('draft','scheduled','sending','sent','paused') NOT NULL DEFAULT 'draft',
  scheduled_at  TIMESTAMP    NULL,
  sent_count    INT UNSIGNED NOT NULL DEFAULT 0,
  delivered_count INT UNSIGNED NOT NULL DEFAULT 0,
  read_count    INT UNSIGNED NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_wacamp_company (company_id),
  CONSTRAINT fk_wacamp_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_wacamp_template FOREIGN KEY (template_id) REFERENCES whatsapp_templates (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Leads & sources
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_sources (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  name          VARCHAR(120) NOT NULL,
  channel       VARCHAR(60)  NULL,
  PRIMARY KEY (id),
  KEY idx_leadsrc_company (company_id),
  CONSTRAINT fk_leadsrc_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  source_id     INT UNSIGNED NULL,
  campaign_id   INT UNSIGNED NULL,
  assigned_to   INT UNSIGNED NULL,
  full_name     VARCHAR(160) NOT NULL,
  email         VARCHAR(180) NULL,
  phone         VARCHAR(40)  NULL,
  company_name  VARCHAR(160) NULL,
  message       TEXT         NULL,
  value         DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        ENUM('new','contacted','qualified','proposal','won','lost') NOT NULL DEFAULT 'new',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_leads_company (company_id),
  KEY idx_leads_status (status),
  KEY idx_leads_source (source_id),
  CONSTRAINT fk_leads_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_leads_source FOREIGN KEY (source_id) REFERENCES lead_sources (id) ON DELETE SET NULL,
  CONSTRAINT fk_leads_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL,
  CONSTRAINT fk_leads_assignee FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Marketing automation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS automations (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  name          VARCHAR(180) NOT NULL,
  trigger_type  VARCHAR(80)  NOT NULL,
  trigger_config JSON        NULL,
  status        ENUM('active','paused','draft') NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_automation_company (company_id),
  CONSTRAINT fk_automation_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS automation_steps (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  automation_id INT UNSIGNED NOT NULL,
  step_order    INT UNSIGNED NOT NULL DEFAULT 0,
  step_type     ENUM('condition','action','delay') NOT NULL,
  config        JSON         NULL,
  PRIMARY KEY (id),
  KEY idx_autostep_automation (automation_id),
  CONSTRAINT fk_autostep_automation FOREIGN KEY (automation_id) REFERENCES automations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Analytics, reports
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  metric        VARCHAR(80)  NOT NULL,
  dimension     VARCHAR(80)  NULL,
  value         DECIMAL(16,2) NOT NULL DEFAULT 0,
  event_date    DATE         NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_analytics_company (company_id),
  KEY idx_analytics_metric (metric),
  KEY idx_analytics_date (event_date),
  CONSTRAINT fk_analytics_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  created_by    INT UNSIGNED NULL,
  name          VARCHAR(180) NOT NULL,
  type          ENUM('pdf','excel','csv') NOT NULL DEFAULT 'pdf',
  params        JSON         NULL,
  file_path     VARCHAR(500) NULL,
  status        ENUM('pending','ready','failed') NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reports_company (company_id),
  CONSTRAINT fk_reports_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Notifications, tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  title         VARCHAR(180) NOT NULL,
  body          VARCHAR(500) NULL,
  type          VARCHAR(40)  NOT NULL DEFAULT 'info',
  link          VARCHAR(255) NULL,
  is_read       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notif_user (user_id),
  KEY idx_notif_read (is_read),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  assigned_to   INT UNSIGNED NULL,
  created_by    INT UNSIGNED NULL,
  campaign_id   INT UNSIGNED NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT         NULL,
  priority      ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  status        ENUM('todo','in_progress','review','done') NOT NULL DEFAULT 'todo',
  due_date      DATE         NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tasks_company (company_id),
  KEY idx_tasks_assignee (assigned_to),
  KEY idx_tasks_status (status),
  CONSTRAINT fk_tasks_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Activity logs, audit logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NULL,
  user_id       INT UNSIGNED NULL,
  action        VARCHAR(120) NOT NULL,
  entity_type   VARCHAR(80)  NULL,
  entity_id     BIGINT UNSIGNED NULL,
  description   VARCHAR(500) NULL,
  ip_address    VARCHAR(45)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_activity_company (company_id),
  KEY idx_activity_user (user_id),
  KEY idx_activity_created (created_at),
  CONSTRAINT fk_activity_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NULL,
  action        VARCHAR(120) NOT NULL,
  table_name    VARCHAR(80)  NULL,
  record_id     BIGINT UNSIGNED NULL,
  old_values    JSON         NULL,
  new_values    JSON         NULL,
  ip_address    VARCHAR(45)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_user (user_id),
  KEY idx_audit_table (table_name),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Settings, API keys, subscriptions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NULL,
  scope         ENUM('system','company') NOT NULL DEFAULT 'company',
  setting_key   VARCHAR(120) NOT NULL,
  setting_value TEXT         NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_scope_key (company_id, setting_key),
  CONSTRAINT fk_settings_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS api_keys (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  created_by    INT UNSIGNED NULL,
  name          VARCHAR(120) NOT NULL,
  key_prefix    VARCHAR(16)  NOT NULL,
  key_hash      CHAR(64)     NOT NULL,
  scopes        VARCHAR(255) NULL,
  last_used_at  TIMESTAMP    NULL,
  revoked_at    TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_apikey_hash (key_hash),
  KEY idx_apikey_company (company_id),
  CONSTRAINT fk_apikey_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
  CONSTRAINT fk_apikey_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id    INT UNSIGNED NOT NULL,
  plan          ENUM('free','starter','pro','enterprise') NOT NULL DEFAULT 'free',
  status        ENUM('trialing','active','past_due','canceled') NOT NULL DEFAULT 'trialing',
  seats         INT UNSIGNED NOT NULL DEFAULT 1,
  price         DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency      CHAR(3)      NOT NULL DEFAULT 'USD',
  current_period_end DATE    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sub_company (company_id),
  CONSTRAINT fk_sub_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Useful views
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_campaign_summary AS
SELECT c.company_id, c.id AS campaign_id, c.name, c.status, c.budget, c.spent,
       COUNT(DISTINCT p.id) AS post_count,
       COUNT(DISTINCT l.id) AS lead_count
FROM campaigns c
LEFT JOIN posts p ON p.campaign_id = c.id
LEFT JOIN leads l ON l.campaign_id = c.id
GROUP BY c.id;

CREATE OR REPLACE VIEW vw_user_directory AS
SELECT u.id, u.company_id, u.email,
       CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS full_name,
       r.name AS role_name, r.slug AS role_slug, u.status, u.last_login_at
FROM users u
JOIN roles r ON r.id = u.role_id;

SET FOREIGN_KEY_CHECKS = 1;
-- End of schema
