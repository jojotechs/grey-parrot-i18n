# Grey Parrot I18n

A comprehensive i18n management solution for developers, featuring AI-assisted translation to simplify internationalization.

## Key Features

- 🚀 Lightweight SDK with multi-platform support (Vue, React, Flutter)
- 🎯 No predefined semantic keys needed - use actual text directly
- 🤖 Integrated AI translation capabilities
- 📊 Visual translation management dashboard
- 🔄 Smart translation memory system
- 🛠 Convenient CLI tools
- 🎭 Multi-role collaboration for team usage

## AI Capabilities

### Multiple AI Model Support
- OpenAI API compatible interface
  - Support for custom API endpoints
  - Configurable API keys and models
  - Compatible with OpenAI-like services
- Built-in support for:
  - OpenAI Model
  - Azure OpenAI Service
- Easy integration with other AI providers
  - Customizable model parameters
  - Flexible API configuration
  - Extensible provider architecture

### Intelligent Translation
- Context-aware translation with consistent style
- Smart key generation based on content semantics
- Batch translation with parallel processing
- Automatic terminology recognition and glossary management
- Brand voice preservation across languages
- Technical documentation expertise

### Smart Key Management
- AI-powered semantic key generation
- Context-aware key suggestions
- Duplicate key detection and resolution
- Automatic key categorization
- Key naming convention enforcement
- Semantic relationship mapping between keys

### Advanced Features
- One-click multi-language generation
- Intelligent context understanding
- Translation quality assessment and suggestions
- Automatic language detection
- Cultural adaptation recommendations
- Translation memory with fuzzy matching
- Real-time collaborative translation
- Custom training for domain-specific terminology
- Batch processing optimization
- Automatic placeholder handling
- Smart variable detection and validation

### Quality Assurance
- AI-powered consistency checks
- Format and placeholder verification
- Cultural sensitivity analysis
- SEO-friendly translation suggestions
- Automatic QA reporting
- Context validation
- Grammar and style enforcement
- Regional compliance checking

## Project Structure

- `packages/sdk`: SDK implementations
  - `js/core`: Core implementation based on @vue/reactivity
  - `js/vue`: Vue.js integration
  - `js/react`: React integration
  - `flutter`: Flutter SDK
- `packages/dashboard`: Translation management dashboard (Nuxt.js)
- `packages/cli`: Command-line tools

## ROADMAP

- [ ] SDK Implementation
  - [x] Core implementation
  - [x] Vue integration
  - [ ] React integration
  - [ ] Flutter SDK
- [ ] Translation Dashboard
  - [x] Basic dashboard functionality
  - [ ] AI translation integration
  - [ ] Translation memory system
  - [ ] Team collaboration features
- [ ] CLI Tools
  - [ ] Project initialization
  - [ ] Text extraction
  - [ ] AI batch translation

## Quick Start

### Initialize Project
```bash
npx @grey-parrot/cli init
```

### Pull Translations
```bash
npx @grey-parrot/cli pull
```

### Write your text
```vue
<template>
  <div>{{ $tt('Welcome, {name}') }}</div>
</template>
```

### Push Translations and Generate Language Files based on your text
```bash
npx @grey-parrot/cli trans
```

## i18n core sdk

### Install
```bash
npm install @grey-parrot/core
```

### Usage

1. Create language files in your project:

```
langs/
en.json
zh.json
```

2. Initialize with base locale:

```typescript
import { createI18n } from '@grey-parrot/core'

const i18n = createI18n({
  locale: 'zh',
  messages: {
    zh: {
      'Welcome, {name}': '欢迎, {name}',
    },
    en: {
      'Welcome, {name}': 'Welcome, {name}',
    },
  },
})
```

3. Use with dynamic import:

```typescript
// Helper function for lazy loading
async function loadLocaleMessages(locale: string) {
  // Works in both Vite and Webpack
  const messages = await import(`./langs/${locale}.json`)
  i18n.add(locale, messages.default) // Use .default for ESM imports
}

// Use in your app
async function changeLocale(locale: string) {
  if (!i18n.hasLocale(locale)) {
    await loadLocaleMessages(locale)
  }
  i18n.setLocale(locale)
}
```

## License

Apache-2.0
