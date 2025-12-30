# Testing Guide

## Testing Philosophy

- **Coverage Target**: >80% for backend/worker, >70% for frontend
- **Fast Tests**: Mock external services (Supabase, OpenAI, Redis)
- **Deterministic**: All tests pass without external API calls
- **CI-Friendly**: Tests run in GitHub Actions with mock providers

## Running Tests

### Backend Tests

```bash
cd backend
poetry run pytest --cov=app --cov-report=html --cov-report=xml
```

Coverage report: `backend/htmlcov/index.html`

### Worker Tests

```bash
cd worker
AI_PROVIDER=mock poetry run pytest --cov=app --cov-report=html --cov-report=xml
```

### Frontend Tests

```bash
cd frontend
pnpm test --coverage
```

## Test Structure

### Backend Tests (`backend/tests/`)

- `test_auth.py`: JWT validation, dev bypass
- `test_encryption.py`: Contact field encryption/decryption
- `test_latex_escape.py`: LaTeX escaping utilities
- `test_api_*.py`: API endpoint tests
- `conftest.py`: Shared fixtures

### Worker Tests (`worker/tests/`)

- `test_ai_mock_adapter.py`: Mock AI provider
- `test_latex_renderer.py`: Template rendering
- `test_pdf_compiler.py`: PDF compilation (mocked)
- `conftest.py`: Shared fixtures

### Frontend Tests (`frontend/__tests__/`)

- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests with Playwright (optional)

## Writing Tests

### Backend Example

```python
def test_create_profile(client, mock_supabase, auth_headers):
    """Test creating a profile."""
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "test-id", "name": "Test User"}
    ]
    response = client.post(
        "/api/v1/profiles",
        json={"name": "Test User"},
        headers=auth_headers,
    )
    assert response.status_code == 201
```

### Worker Example

```python
def test_mock_adapter_generate_content():
    """Test mock adapter returns valid content."""
    adapter = MockAdapter()
    result = adapter.generate_content(
        profile_snapshot={...},
        job_description="Test JD",
        page_count=1,
        include_projects=True,
        include_skills=True,
    )
    assert "education" in result
```

## Mock Providers

### AI Provider

Set `AI_PROVIDER=mock` to use MockAdapter:
- Returns deterministic JSON
- No API calls
- Fast execution
- Perfect for CI/CD

### Supabase

Mock Supabase client in tests:
- Use `unittest.mock.MagicMock`
- Configure return values for queries
- Test business logic without database

### Redis/Celery

Use Celery's test mode or mock Redis:
- `CELERY_TASK_ALWAYS_EAGER=True` for synchronous execution
- Mock Redis client for unit tests

## Coverage Reports

### Local

- HTML reports: `backend/htmlcov/index.html`, `worker/htmlcov/index.html`
- XML reports: `backend/coverage.xml`, `worker/coverage.xml` (for CI)

### CI/CD

- Codecov integration in GitHub Actions
- Coverage uploaded automatically on PRs
- Coverage badges in README

## Best Practices

1. **Mock External Services**: Never call real APIs in tests
2. **Test Business Logic**: Focus on application code, not frameworks
3. **Fast Tests**: Keep test suite under 30 seconds
4. **Isolated Tests**: Each test should be independent
5. **Clear Test Names**: Describe what is being tested
6. **Arrange-Act-Assert**: Structure tests clearly

## CI/CD Integration

Tests run automatically on:
- Push to main branch
- Pull requests

All tests must pass before merge:
- Backend tests with >80% coverage
- Worker tests with >80% coverage
- Frontend tests with >70% coverage
- Lint and type checks

