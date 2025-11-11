# Le Magazine du Mali

A modern news magazine platform built with React, TypeScript, Vite, and Supabase.

## 🚀 Features

- **Article Management**: Create, edit, and manage articles with rich text editor
- **Category Management**: Organize articles by categories
- **User Authentication**: Admin and SuperAdmin authentication
- **Comments System**: User comments on articles
- **Media Management**: Upload and manage images and videos
- **Stories**: Create and manage stories
- **Polls**: Create and manage polls with voting
- **Videos**: Manage video content
- **Menu Management**: Customize main navigation menu
- **Pages Management**: Create and manage static pages
- **Albums**: Manage audio albums
- **Responsive Design**: Mobile and desktop views
- **Multi-language Support**: i18n internationalization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **yarn** or **pnpm**
- **Supabase Account** - [Sign up here](https://supabase.com)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd magma
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_TINYMCE_API_KEY=your-tinymce-api-key-here
VITE_TEMPO=false
```

### 4. Set up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration files in your Supabase SQL Editor:
   - `add_videos_table.sql`
   - `add_pages_table.sql`
   - `add_main_menu.sql`
   - `add_main_menu_hierarchy.sql`
   - `add_share_fields_to_articles.sql`

3. Create the following storage buckets:
   - `stories` (public)
   - `polls` (public)
   - `videos` (public)
   - `images` (public)
   - `medias` (public)

4. Set up Row Level Security (RLS) policies for your tables
5. Configure authentication providers if needed

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema documentation.

### 5. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📁 Project Structure

```
magma/
├── src/
│   ├── admin/              # Admin article management components
│   ├── components/         # Reusable React components
│   │   ├── admin-dashboard/  # Admin dashboard components
│   │   ├── header/         # Header components
│   │   ├── hero/           # Hero section components
│   │   └── ui/             # UI components (shadcn/ui)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── supabaseClient.ts  # Supabase client configuration
│   │   ├── i18n.ts         # Internationalization setup
│   │   └── utils.ts        # Utility functions
│   ├── mobile/             # Mobile-specific pages
│   ├── pages/              # Main application pages
│   │   ├── admin/          # Admin dashboard pages
│   │   └── superadmin/     # SuperAdmin dashboard pages
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── .env.example           # Environment variables example
├── DATABASE_SCHEMA.md     # Database schema documentation
└── README.md              # This file
```

## 🔐 Authentication

### Admin Dashboard
- URL: `/admin`
- Login: `/admin/login`
- Register: `/admin/register`

### SuperAdmin Dashboard
- URL: `/superadmin`
- Login: `/superadmin/login`
- Register: `/superadmin/register`

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Style

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** (if configured) for code formatting

## 🚢 Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The project includes a `vercel.json` configuration file for Vercel deployment.

### Other Platforms

The project can be deployed to any platform that supports Node.js and static site hosting:
- Netlify
- AWS Amplify
- Cloudflare Pages
- GitHub Pages (with build step)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_TINYMCE_API_KEY` | TinyMCE API key for rich text editor | No |
| `VITE_TEMPO` | Enable Tempo development tools | No |

### Supabase Configuration

1. Create a Supabase project
2. Get your project URL and anon key from Settings > API
3. Set up authentication providers
4. Create required database tables (see SQL files)
5. Set up storage buckets
6. Configure RLS policies

## 📝 Database Setup

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed database schema documentation.

Key tables:
- `articles` - Article content
- `categories` - Article categories
- `comments` - User comments
- `stories` - Stories content
- `polls` - Polls and voting
- `videos` - Video content
- `pages` - Static pages
- `main_menu` - Navigation menu
- `albums` - Audio albums
- `medias` - Media files
- `banners` - Banner advertisements

## 🐛 Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify your `.env` file has correct credentials
   - Check that your Supabase project is active
   - Verify network connectivity

2. **Build errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (should be v18+)

3. **Authentication issues**
   - Verify Supabase Auth is enabled
   - Check RLS policies are correctly configured
   - Verify email provider is configured in Supabase

## 📚 Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Supabase** - Backend as a Service
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **TinyMCE** - Rich text editor
- **React Query** - Data fetching
- **i18next** - Internationalization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

---

**Note**: This project is built with [Lovable](https://lovable.dev). You can edit this project directly in Lovable or use your preferred IDE.
