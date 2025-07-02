# AI Creative Studio

## Overview

AI Creative Studio is a single-page React application that enables users to create custom games and websites using natural language prompts. The application leverages the Groq AI API with the Llama 4 Scout model to generate code based on user descriptions, providing a live preview and download functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Code Editor**: CodeMirror 6 for syntax highlighting and editing
- **State Management**: React hooks with local state management
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution
- **Production**: esbuild for bundling

## Key Components

### Frontend Components
1. **AICreativeStudio**: Main application component with tab-based interface
2. **Code Editor**: CodeMirror integration for displaying generated code
3. **Live Preview**: Sandboxed iframe for rendering generated HTML/CSS/JS
4. **Settings Dialog**: API key management interface
5. **Example Prompts**: Pre-built prompt templates for games and websites

### UI System
- **Design System**: Custom dark theme with neutral base colors
- **Component Library**: Comprehensive set of accessible UI components
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Typography**: Montserrat for UI text, JetBrains Mono for code

### External Integrations
- **Groq AI API**: Code generation using meta-llama/llama-4-scout-17b-16e-instruct model
- **JSZip**: Client-side ZIP file creation for project downloads
- **CodeMirror**: Advanced code editing and syntax highlighting

## Data Flow

1. **User Input**: User enters natural language prompt describing desired game/website
2. **API Request**: Frontend sends POST request to Groq API with user prompt
3. **Code Generation**: AI model processes prompt and returns generated code
4. **Code Display**: Generated code appears in CodeMirror editor with syntax highlighting
5. **Live Preview**: Code is rendered in sandboxed iframe for immediate preview
6. **Download**: User can package and download generated files as ZIP archive

### API Integration Flow
```
User Prompt → Groq API Request → AI Code Generation → Display & Preview → Download
```

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **codemirror**: Code editor functionality
- **drizzle-orm**: Database ORM
- **react**: Core React library
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Database Schema

The application includes a basic user schema using Drizzle ORM:

```typescript
users = {
  id: serial (primary key)
  username: text (unique, not null)
  password: text (not null)
}
```

**Note**: Currently using in-memory storage for development, with PostgreSQL configuration ready for production deployment.

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Server**: Vite dev server with HMR
- **Database**: In-memory storage implementation

### Production Build
- **Frontend**: `vite build` outputs to `dist/public`
- **Backend**: `esbuild` bundles server to `dist/index.js`
- **Start**: `npm start` runs production server

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required for production)
- **NODE_ENV**: Environment flag (development/production)

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 02, 2025. Initial setup