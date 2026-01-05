# Contributing to QuantumFlow Toolkit

Thank you for your interest in contributing to QuantumFlow Toolkit! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/QuantumFlow-Toolkit.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Python 3.9+
- Rust (latest stable)
- Node.js v18+
- Docker (optional)

### Setup Steps

1. **Python Environment**
   ```bash
   cd backend/python
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Rust Environment**
   ```bash
   cd backend/rust
   cargo build
   ```

3. **Frontend Environment**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Coding Standards

### Python

- Follow PEP 8 style guide
- Use type hints for all function signatures
- Maximum line length: 100 characters
- Use Black for code formatting: `black backend/python`
- Use flake8 for linting: `flake8 backend/python`
- Use mypy for type checking: `mypy backend/python`

### Rust

- Follow Rust style guide
- Use `rustfmt` for formatting: `cargo fmt`
- Use `clippy` for linting: `cargo clippy`

### JavaScript/React

- Follow ESLint rules
- Use Prettier for formatting
- Maximum line length: 100 characters

### Architecture

- Follow Clean Architecture principles
- Separate concerns: Entities, Use Cases, Interface Adapters, Frameworks
- Use dependency injection
- Write self-documenting code with clear docstrings

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat: add cost estimation API endpoint

- Add CostEstimator API routes
- Implement cost calculation logic
- Add unit tests for cost estimation
```

## Pull Request Process

1. Ensure all tests pass: `pytest tests/`
2. Update documentation if needed
3. Add tests for new features
4. Ensure code coverage is maintained (>90%)
5. Update CHANGELOG.md
6. Request review from maintainers

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts
- [ ] All CI checks passing

## Testing

### Running Tests

```bash
# Python tests
pytest tests/python/ -v --cov=backend.python

# Rust tests
cd backend/rust
cargo test

# Frontend tests
cd frontend
npm test
```

### Writing Tests

- Write unit tests for all new functions
- Write integration tests for API endpoints
- Aim for >90% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

## Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add docstrings to all public functions
- Include examples in docstrings
- Update architecture diagrams if needed

## Questions?

If you have questions, please:
- Open an issue for discussion
- Check existing documentation
- Contact maintainers

Thank you for contributing to QuantumFlow Toolkit!

