# Contributing to Aptick

Thank you for your interest in contributing to Aptick! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (OS, browser, wallet, network)
- **Screenshots or logs** if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- **Use a clear, descriptive title**
- **Explain the current behavior** and **what you expected**
- **Describe the suggested enhancement** in detail
- **Explain why this would be useful** to most Aptick users

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Make your changes** with appropriate tests
4. **Follow the coding standards** outlined below
5. **Update documentation** if needed
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js (v18+)
- Aptos CLI
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/your-username/aptick.git
cd aptick

# Install dependencies
npm install

# Set up smart contract development
cd smartcontract
aptos init --network devnet

# Set up frontend development
cd ../frontend
npm install
npm run dev
```

### Testing

```bash
# Run smart contract tests
cd smartcontract
aptos move test

# Run frontend tests (when available)
cd frontend
npm test
```

## Coding Standards

### Smart Contract (Move)

- Use clear, descriptive function and variable names
- Include comprehensive documentation comments
- Follow Move's naming conventions (snake_case)
- Add appropriate error codes and messages
- Include unit tests for all functions

### Frontend (TypeScript/React)

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use consistent naming conventions (camelCase for variables, PascalCase for components)
- Include JSDoc comments for complex functions
- Ensure responsive design with Tailwind CSS

### SDK (TypeScript)

- Provide comprehensive type definitions
- Include detailed JSDoc documentation
- Follow semantic versioning for releases
- Maintain backward compatibility
- Include comprehensive examples

## Commit Guidelines

We use conventional commits for clear history:

```
type(scope): description

- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: code style changes
- refactor: code refactoring
- test: adding or updating tests
- chore: maintenance tasks
```

Examples:
```
feat(contract): add subscription billing model
fix(frontend): resolve wallet connection issue
docs(readme): update installation instructions
```

## Project Structure

```
aptick/
├── frontend/           # Next.js application
├── smartcontract/      # Move smart contracts
├── sdk/               # TypeScript SDK
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## Testing Guidelines

### Smart Contract Tests

- Test all entry functions with valid and invalid inputs
- Test edge cases and error conditions
- Verify gas consumption is reasonable
- Test with multiple users and scenarios

### Frontend Tests

- Unit tests for utility functions
- Component tests for React components
- Integration tests for user flows
- E2E tests for critical paths

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for public APIs
- Include code examples in documentation
- Update SDK documentation for API changes

## Release Process

1. **Version Bump**: Update version numbers following semantic versioning
2. **Changelog**: Update CHANGELOG.md with new features and fixes
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update docs if needed
5. **Release**: Create release with detailed notes

## Getting Help

If you need help or have questions:

- Check existing issues and documentation
- Ask questions in GitHub Discussions
- Join our Discord community (coming soon)
- Reach out to maintainers

## Recognition

Contributors will be recognized in:

- README.md acknowledgments
- Release notes
- Project documentation
- Community announcements

Thank you for contributing to Aptick! 🚀