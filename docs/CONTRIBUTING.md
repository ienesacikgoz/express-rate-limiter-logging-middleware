# Contributing to Express.js Production Starter with Rate Limiting & Structured Logging

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/ienesacikgoz/express-rate-limiter-logging-middleware.git`
3. Install dependencies: `npm install`
4. Set up environment: `cp .env.example .env`

## Development Workflow

### Setup Local Environment

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Code Style

- Use ESLint: `npm run lint`
- Format code consistently
- Use meaningful variable names
- Add JSDoc comments for functions
- Write tests for new features

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

### Commit Messages

- Use clear, descriptive messages
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Keep first line under 50 characters
- Add details in the body if needed

Good: `Add user-based rate limiting middleware`
Bad: `fix stuff`

## Pull Request Process

1. Update README.md with API changes
2. Run tests and ensure they pass: `npm test`
3. Run linter: `npm run lint`
4. Ensure code coverage doesn't decrease
5. Add description of changes in PR
6. Link any related issues

## Reporting Issues

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Node version and OS
- Relevant logs or error messages

## Project Structure

```
src/
├── config/           - Configuration (logger, rate limiter)
├── controller/       - Request handlers
├── middleware/       - Express middleware
├── routes/           - API routes
└── index.js          - Application entry point
```

## Middleware Development

When adding new middleware:

1. Create file in `src/middleware/`
2. Export as Express middleware function
3. Add error handling
4. Include logging
5. Document in README

Example:
```javascript
const myMiddleware = (req, res, next) => {
  // Add functionality
  next();
};

module.exports = myMiddleware;
```

## Questions?

- Check existing issues and discussions
- Review the README and documentation
- Open a new issue with the question label

Thank you for contributing! 🙏
