# Contributing to WanderLink

First off, thank you for considering contributing to WanderLink! 🎉

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list to avoid duplicates. When you create a bug report, include as many details as possible:

- **Description:** Clear description of the bug
- **Steps to reproduce:** Step-by-step instructions
- **Expected behavior:** What you expected to happen
- **Actual behavior:** What actually happened
- **Environment:** OS, browser, Node version, etc.
- **Screenshots:** If applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Clear title:** Use a descriptive title
- **Detailed description:** Provide a step-by-step description
- **Use cases:** Explain why this enhancement would be useful
- **Examples:** Provide examples from other projects if possible

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies:** `pnpm install`
3. **Make your changes:**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable
4. **Test your changes:**
   - Run `pnpm test` for each package
   - Ensure all tests pass
5. **Commit your changes:**
   - Use clear commit messages
   - Follow conventional commits format
6. **Push to your fork** and submit a pull request

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(contracts): add emergency pause functionality
fix(frontend): resolve wallet connection issue on mobile
docs(readme): update setup instructions
```

## 🏗️ Development Setup

See [docs/SETUP.md](./docs/SETUP.md) for complete setup instructions.

### Quick Start

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/WanderLink.git
cd WanderLink

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local
# Fill in your credentials

# Start development
pnpm dev
```

## 📝 Coding Guidelines

### TypeScript/JavaScript

- Use **TypeScript** for type safety
- Follow **ESLint** rules (`pnpm lint`)
- Use **Prettier** for formatting
- Prefer **functional components** in React
- Use **async/await** over promises

### Solidity

- Follow **Solidity style guide**
- Add **NatSpec comments** for all functions
- Write **comprehensive tests** for all contracts
- Use **OpenZeppelin** contracts where possible
- Run **Slither** for security analysis

### Testing

- **Unit tests** for all business logic
- **Integration tests** for API endpoints
- **Contract tests** with >80% coverage
- **E2E tests** for critical user flows

## 🔒 Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Email security@WanderLink.xyz with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

### Security Best Practices

- Never commit sensitive data (keys, passwords)
- Use environment variables for secrets
- Review all dependencies regularly
- Follow smart contract security patterns
- Run security audits before deployment

## 📚 Documentation

- Update README.md if you change functionality
- Add inline comments for complex logic
- Update architecture docs for system changes
- Include JSDoc/TSDoc comments
- Update API documentation

## 🧪 Testing Requirements

Before submitting a PR:

```bash
# Run all tests
pnpm test

# Check TypeScript types
pnpm typecheck

# Lint code
pnpm lint

# Build all packages
pnpm build
```

All checks must pass before merging.

## 📦 Package Structure

```
packages/
├── frontend/    # Next.js app
├── contracts/   # Smart contracts
├── backend/     # Node.js API
├── agents/      # AI agents
└── shared/      # Shared utilities
```

When contributing:
- Keep packages isolated
- Use `@WanderLink/shared` for common code
- Update package.json if adding dependencies

## 🎨 UI/UX Guidelines

- Follow existing design patterns
- Ensure mobile responsiveness
- Test on multiple browsers
- Maintain accessibility (WCAG 2.1)
- Use TailwindCSS utility classes

## 🤝 Code Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainer
3. **Testing** on testnet
4. **Approval** from 1+ maintainers
5. **Merge** to main branch

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Security considerations addressed
- [ ] Performance implications considered

## 🌍 Community

- **Discord:** [Join our community](https://discord.gg/WanderLink)
- **Twitter:** [@WanderLink](https://twitter.com/WanderLink)
- **Email:** team@WanderLink.xyz

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making WanderLink better! 🚀**
