# UNIC Chat Codebase Documentation

This document provides detailed technical documentation for the UNIC Chat codebase, including component architecture, API specifications, and implementation details.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Documentation](#component-documentation)
3. [API Documentation](#api-documentation)
4. [Custom Hooks](#custom-hooks)
5. [Utility Functions](#utility-functions)
6. [Styling System](#styling-system)
7. [State Management](#state-management)
8. [Error Handling](#error-handling)
9. [Performance Considerations](#performance-considerations)

## Architecture Overview

UNIC Chat follows a modern React/Next.js architecture with the following key characteristics:

- **App Router**: Uses Next.js 14 App Router for routing and API endpoints
- **Component-Based**: Modular React components with clear separation of concerns
- **TypeScript**: Full TypeScript implementation for type safety
- **API Integration**: Edge runtime for API routes with streaming support
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks for local state management

## Component Documentation

### ChatInterface (`src/components/ChatInterface.tsx`)

The main chat interface component that orchestrates the entire chat experience.

#### Key Features
- Real-time message streaming
- Message history management
- Dark/light mode toggle
- Command execution
- Message editing and copying

#### Props
```typescript
// No external props - self-contained component
```

#### State Management
```typescript
interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
}

// Key state variables
const [messages, setMessages] = useState<Message[]>([]);
const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
const [isGenerating, setIsGenerating] = useState<boolean>(false);
const [inputContent, setInputContent] = useState("");
```

#### Key Methods
- `handleSendMessage`: Processes and sends user messages
- `toggleTheme`: Handles dark/light mode switching
- `scrollToBottom`: Manages chat scroll behavior
- `handleCommandExecution`: Processes special commands

### Editor (`src/components/Editor.tsx`)

A WYSIWYG editor component built with TipTap.

#### Props
```typescript
interface WYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}
```

#### Features
- Rich text editing with TipTap
- Markdown support
- Custom styling
- Placeholder text
- Auto-resize functionality

### ResponseRenderer (`src/components/ResponseRenderer.tsx`)

Handles the rendering of chat messages with markdown and code highlighting.

#### Props
```typescript
interface ResponseRendererProps {
  content: string;
  isUser: boolean;
}
```

#### Features
- Markdown rendering with `react-markdown`
- Code syntax highlighting
- Message truncation
- User/assistant message styling
- Custom styling for code blocks

## API Documentation

### Chat API (`src/app/api/chat/route.ts`)

Handles chat completions using the Hugging Face API.

#### Endpoint
```
POST /api/chat
```

#### Request Body
```typescript
interface ChatRequest {
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
}
```

#### Response
- Streams responses using Server-Sent Events (SSE)
- Returns chunks of generated text
- Handles errors with appropriate status codes

### Scrape API (`src/app/api/scrape/route.ts`)

Manages web content scraping.

#### Endpoint
```
POST /api/scrape
```

#### Request Body
```typescript
interface ScrapeRequest {
  url: string;
  maxExecutionTime?: number;
  filter?: boolean;
  store?: boolean;
  maxWords?: number;
}
```

#### Response
```typescript
interface ScrapeResponse {
  content: string;
  error?: string;
}
```

## Custom Hooks

### useLLMAPI (`src/hooks/useLLMAPI.ts`)

Manages communication with the LLM API.

#### Methods
```typescript
const { sendMessage, isLoading, stopGeneration } = useLLMAPI();
```

#### Features
- Message streaming
- Response generation
- Error handling
- Generation control (stop/start)

### useCommandExecution (`src/hooks/useCommandExecution.ts`)

Handles special command execution.

#### Methods
```typescript
const { executeCommand, isExecuting, error } = useCommandExecution();
```

#### Command Format
```
[include-url: <url> max_execution_time:<time> filter:<boolean> store:<boolean>]
```

## Utility Functions

### Scraper (`src/lib/scraper.ts`)

Web content scraping utility.

#### Functions
```typescript
async function scrapeWebsite(
  url: string,
  maxExecutionTime?: number,
  filter?: boolean,
  store?: boolean,
  maxWords?: number
): Promise<string>
```

#### Features
- Timeout handling
- Content filtering
- Word limit
- Error handling
- Retry mechanism

## Styling System

### Tailwind Configuration (`tailwind.config.ts`)

Custom Tailwind configuration with:
- Dark mode support
- Custom color scheme
- Extended theme
- Animation utilities

### Component Styling
- Uses shadcn/ui components
- Custom CSS variables for theming
- Responsive design
- Dark mode support

## State Management

The application uses React's built-in state management:
- `useState` for local component state
- `useEffect` for side effects
- `useCallback` for memoized functions
- `useRef` for DOM references

## Error Handling

### Global Error Handling
- API error handling with appropriate status codes
- User-friendly error messages
- Toast notifications for errors
- Fallback UI components

### Component-Level Error Handling
- Try-catch blocks for async operations
- Error boundaries for React components
- Graceful degradation
- User feedback mechanisms

## Performance Considerations

### Optimizations
- Edge runtime for API routes
- Streaming responses
- Message truncation
- Lazy loading of components
- Memoization of expensive computations

### Best Practices
- TypeScript for type safety
- Proper error handling
- Efficient state management
- Responsive design
- Accessibility considerations

## Security Considerations

### API Security
- Environment variables for sensitive data
- CORS configuration
- Rate limiting
- Input validation
- Error message sanitization

### Data Handling
- Secure API token storage
- Input sanitization
- XSS prevention
- CSRF protection
- Proper error handling

## Testing

### Recommended Testing Strategy
- Unit tests for utility functions
- Component testing with React Testing Library
- API endpoint testing
- Integration tests
- E2E testing with Cypress

## Deployment

### Requirements
- Node.js 18.x or later
- Environment variables configuration
- Build optimization
- Proper CORS settings
- SSL/TLS configuration

### Deployment Steps
1. Build the application
2. Configure environment variables
3. Set up proper CORS headers
4. Deploy to hosting platform
5. Configure SSL/TLS
6. Set up monitoring and logging 