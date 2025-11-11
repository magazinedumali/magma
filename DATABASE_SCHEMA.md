# Database Schema Documentation

This document describes the database schema for the Magazine du Mali application.

## Tables

### articles
Stores article content and metadata.

```sql
- id: uuid (PRIMARY KEY)
- titre: text (NOT NULL)
- contenu: text
- image: text
- image_url: text
- categorie: text
- category_id: uuid (FOREIGN KEY -> categories.id)
- auteur: text
- date_publication: date
- date_creation: timestamp
- statut: text (default: 'brouillon') - Values: 'publie', 'brouillon'
- slug: text (UNIQUE)
- tags: text[]
- views: integer
- meta_title: text
- meta_description: text
- share_image_url: text
- share_description: text
- gallery: text[]
- created_at: timestamp
- updated_at: timestamp
```

### categories
Stores article categories.

```sql
- id: uuid (PRIMARY KEY)
- name: text (NOT NULL, UNIQUE)
- created_at: timestamp
```

### comments
Stores user comments on articles.

```sql
- id: uuid (PRIMARY KEY)
- content: text (NOT NULL)
- user_id: uuid (FOREIGN KEY -> auth.users.id)
- article_id: uuid (FOREIGN KEY -> articles.id)
- created_at: timestamp
- updated_at: timestamp
```

### stories
Stores story content for the stories feature.

```sql
- id: uuid (PRIMARY KEY)
- title: text (NOT NULL)
- image_url: text
- badge: text
- views: integer
- is_active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp
```

### polls
Stores poll questions and metadata.

```sql
- id: uuid (PRIMARY KEY)
- question: text (NOT NULL)
- image_url: text
- active: boolean (default: false)
- created_at: timestamp
- updated_at: timestamp
```

### poll_options
Stores poll answer options.

```sql
- id: uuid (PRIMARY KEY)
- poll_id: uuid (FOREIGN KEY -> polls.id)
- label: text (NOT NULL)
- votes: integer (default: 0)
- created_at: timestamp
```

### videos
Stores video content.

```sql
- id: uuid (PRIMARY KEY)
- title: text (NOT NULL)
- author: text (NOT NULL)
- date: date (NOT NULL)
- image: text (NOT NULL)
- author_avatar: text
- video_url: text (NOT NULL)
- created_at: timestamp
```

### pages
Stores static pages.

```sql
- id: uuid (PRIMARY KEY)
- title: text (NOT NULL)
- path: text (NOT NULL, UNIQUE)
- is_active: boolean (default: true)
- created_at: timestamp
- updated_at: timestamp
```

### main_menu
Stores main navigation menu items.

```sql
- id: uuid (PRIMARY KEY)
- name: text (NOT NULL)
- path: text (NOT NULL)
- has_dropdown: boolean (default: false)
- hot: boolean (default: false)
- order: integer (NOT NULL)
- parent_id: uuid (FOREIGN KEY -> main_menu.id, nullable)
- link_type: text (default: 'internal') - Values: 'internal', 'external'
- target_blank: boolean (default: false)
- created_at: timestamp
- updated_at: timestamp
```

### albums
Stores audio albums.

```sql
- id: uuid (PRIMARY KEY)
- title: text (NOT NULL)
- description: text
- cover_image: text
- tracks: jsonb
- created_at: timestamp
- updated_at: timestamp
```

### medias
Stores media files metadata.

```sql
- id: uuid (PRIMARY KEY)
- name: text (NOT NULL)
- url: text (NOT NULL)
- type: text (NOT NULL)
- created_at: timestamp
```

### banners
Stores banner advertisements.

```sql
- id: uuid (PRIMARY KEY)
- title: text (NOT NULL)
- image: text (NOT NULL)
- link: text
- status: text (default: 'inactif') - Values: 'actif', 'inactif'
- position: text (NOT NULL)
- created_at: timestamp
- updated_at: timestamp
```

## Storage Buckets

The following Supabase Storage buckets are used:

- **stories**: Stores story images
- **polls**: Stores poll images
- **videos**: Stores video files
- **images**: Stores general images (article images, banners, etc.)
- **medias**: Stores media files

## Relationships

- `articles.category_id` -> `categories.id` (Many-to-One)
- `comments.user_id` -> `auth.users.id` (Many-to-One)
- `comments.article_id` -> `articles.id` (Many-to-One)
- `poll_options.poll_id` -> `polls.id` (Many-to-One)
- `main_menu.parent_id` -> `main_menu.id` (Self-referencing, One-to-Many)

## Indexes

Recommended indexes for performance:

```sql
-- Articles
CREATE INDEX idx_articles_statut ON articles(statut);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_date_publication ON articles(date_publication);

-- Comments
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Polls
CREATE INDEX idx_polls_active ON polls(active);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);

-- Main Menu
CREATE INDEX idx_main_menu_parent_id ON main_menu(parent_id);
CREATE INDEX idx_main_menu_order ON main_menu(order);
```

## Row Level Security (RLS)

Ensure RLS policies are set up appropriately for:
- Public read access for published articles
- Admin write access for articles
- User read/write access for their own comments
- Admin access for all management tables

## Migration Files

The following SQL migration files are available in the root directory:

- `add_videos_table.sql` - Creates videos table
- `add_pages_table.sql` - Creates pages table
- `add_main_menu.sql` - Creates main_menu table
- `add_main_menu_hierarchy.sql` - Adds hierarchy support to main_menu
- `add_share_fields_to_articles.sql` - Adds share fields to articles
- `remove_trending_topics.sql` - Removes trending topics feature

