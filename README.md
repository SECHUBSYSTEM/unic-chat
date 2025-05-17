# UNIC Chat - Modern LLM Platform

UNIC Chat is a modern, minimalistic yet powerful LLM (Large Language Model) platform built with Next.js, TypeScript, and the Microsoft Phi-3-mini-4k-instruct model. It provides a sleek chat interface with advanced features like web content scraping, markdown rendering, and real-time streaming responses.

![UNIC Chat]

## 🌟 Features

- 💬 Real-time chat interface with streaming responses
- 🤖 Powered by Microsoft Phi-3-mini-4k-instruct model
- 🌐 Web content scraping and integration
- 📝 Rich text editor with markdown support
- 🌓 Dark/Light mode support
- 📱 Responsive design for all devices
- 🔄 Message history management
- 📋 Copy and edit message functionality
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Hugging Face API token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/unic-chat.git
cd unic-chat
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your Hugging Face API token:
```env
HUGGINGFACE_API_TOKEN=your_token_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
unic-chat/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   │   ├── chat/      # Chat API endpoints
│   │   │   └── scrape/    # Web scraping endpoints
│   │   └── layout.tsx     # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── ChatInterface.tsx
│   │   ├── Editor.tsx
│   │   ├── ResponseRenderer.tsx
│   │   └── CommandInsertion.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useLLMAPI.ts
│   │   ├── useCommandExecution.ts
│   │   └── use-toast.ts
│   └── lib/               # Utility functions
│       ├── scraper.ts
│       └── utils.ts
├── public/                # Static assets
├── .env.local            # Environment variables
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Project dependencies
```

## 🔧 Technical Documentation

### Architecture Overview

UNIC Chat follows a modern React/Next.js architecture with:
- **App Router**: Next.js 14 App Router for routing and API endpoints
- **Component-Based**: Modular React components with clear separation of concerns
- **TypeScript**: Full TypeScript implementation for type safety
- **API Integration**: Edge runtime for API routes with streaming support
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks for local state management

### Key Components

#### Chat Interface (`ChatInterface.tsx`)
The main chat component that handles:
- Message history management
- Real-time message streaming
- Dark/light mode toggle
- Message editing and copying
- Command execution

```typescript
interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
}
```

#### Editor (`Editor.tsx`)
A WYSIWYG editor component built with TipTap that provides:
- Rich text editing
- Markdown support
- Placeholder text
- Custom styling

```typescript
interface WYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}
```

#### Response Renderer (`ResponseRenderer.tsx`)
Handles the rendering of chat messages with:
- Markdown support
- Code syntax highlighting
- Message truncation
- User/assistant message styling

```typescript
interface ResponseRendererProps {
  content: string;
  isUser: boolean;
}
```

### API Documentation

#### Chat API (`/api/chat`)
Handles chat completions using the Hugging Face API.

```typescript
interface ChatRequest {
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
}
```

#### Scrape API (`/api/scrape`)
Manages web content scraping with configurable options.

```typescript
interface ScrapeRequest {
  url: string;
  maxExecutionTime?: number;
  filter?: boolean;
  store?: boolean;
  maxWords?: number;
}
```

### Custom Hooks

#### `useLLMAPI`
Manages communication with the LLM API:
```typescript
const { sendMessage, isLoading, stopGeneration } = useLLMAPI();
```

#### `useCommandExecution`
Handles special command execution:
```typescript
const { executeCommand, isExecuting, error } = useCommandExecution();
```

Command Format:
```
[include-url: <url> max_execution_time:<time> filter:<boolean> store:<boolean>]
```

### Utility Functions

#### Scraper (`scraper.ts`)
Web content scraping utility:
```typescript
async function scrapeWebsite(
  url: string,
  maxExecutionTime?: number,
  filter?: boolean,
  store?: boolean,
  maxWords?: number
): Promise<string>
```

## 🛠️ Development

### State Management
- `useState` for local component state
- `useEffect` for side effects
- `useCallback` for memoized functions
- `useRef` for DOM references

### Error Handling
- API error handling with appropriate status codes
- User-friendly error messages
- Toast notifications
- Fallback UI components
- Try-catch blocks for async operations
- Error boundaries for React components

### Performance Optimizations
- Edge runtime for API routes
- Streaming responses
- Message truncation
- Lazy loading of components
- Memoization of expensive computations

### Security
- Environment variables for sensitive data
- CORS configuration
- Rate limiting
- Input validation
- Error message sanitization
- Secure API token storage
- XSS prevention
- CSRF protection

## 🎨 Styling

The project uses:
- Tailwind CSS for utility-first styling
- shadcn/ui for component library
- Custom CSS variables for theming
- Dark mode support
- Responsive design
- Animation utilities

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Testing Strategy
- Unit tests for utility functions
- Component testing with React Testing Library
- API endpoint testing
- Integration tests
- E2E testing with Cypress

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Microsoft Phi-3-mini-4k-instruct](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct)
- [Hugging Face](https://huggingface.co/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TipTap](https://tiptap.dev/) 