# MyCloudFTS

**My Cloud File Transfer Service** — a self-hosted, web-based file and project management platform built for small teams that need straightforward cloud storage without the complexity (or cost) of enterprise file-sharing tools.

[![CI](https://github.com/LiamBlanton17/MyCloudFTS/actions/workflows/ci.yml/badge.svg)](https://github.com/LiamBlanton17/MyCloudFTS/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/django-5.1-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)

## Overview

MyCloudFTS lets teams create projects, organize files into nested folders, and invite collaborators — all through a clean, self-contained web UI backed by Django. It was built by a four-person team as a full end-to-end exercise in web application design: authentication, authorization, relational data modeling, and test-driven development, from the database up through the browser.

## Features

- **Authentication & 2FA** — Email/password signup and login, with optional email-based two-factor authentication (time-limited one-time codes).
- **Projects & folders** — Create, rename, and delete projects, each with its own root directory and nested folder hierarchy.
- **File management** — Upload, download, and delete files within a project's folder structure.
- **Team invitations** — Generate secure, time-limited invite links to add collaborators to a project via email.
- **User profiles** — Editable display name and email, with an auto-generated avatar (initials + deterministic color) that can be customized.
- **Account settings** — Per-user toggle for two-factor authentication and personal info management.
- **Transactional email** — Signup confirmations, 2FA codes, and project invites sent via SMTP.

## Tech Stack

| Layer            | Technology                                  |
|-------------------|----------------------------------------------|
| Backend           | Python, Django                               |
| Database          | SQLite (dev)                                 |
| Frontend          | Django templates, HTML/CSS, JavaScript, jQuery |
| Auth              | Django `django.contrib.auth` + custom email-based 2FA |
| Email             | Django SMTP backend (Gmail)                  |
| Testing           | Django `TestCase` (Python) · Jest + jsdom (JavaScript) |
| CI                | GitHub Actions                               |

## Project Structure

```
MyCloudFTS/
├── .github/workflows/       # CI pipeline (Django + Jest test suites)
└── Code/
    ├── DjangoMyCloudFTS/     # Django project config (settings, URLs, WSGI/ASGI)
    ├── users/                # Core app: auth, projects, folders, files, 2FA, invites
    │   ├── models.py         # Project, Folder, File, InviteKeys, Auth2FA, UserSettings
    │   ├── views.py          # Page views + JSON API endpoints
    │   └── tests.py          # Django integration & unit tests
    ├── templates/            # Server-rendered HTML templates
    ├── static/               # CSS and per-page JavaScript modules
    ├── test/                 # Jest black-box tests
    └── manage.py
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (for running the JavaScript test suite)

### Setup

```bash
git clone https://github.com/LiamBlanton17/MyCloudFTS.git
cd MyCloudFTS/Code

# Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The app will be available at `http://localhost:8000`.

> **Note:** Outbound email (signup confirmations, 2FA codes, invites) requires SMTP credentials configured in `DjangoMyCloudFTS/settings.py`. Without them, the app still runs, but emails will fail to send.

### Running Tests

```bash
# Django test suite
cd Code
python manage.py test

# JavaScript test suite (Jest)
npm install
npm test
```

Both suites run automatically on every push and pull request via GitHub Actions.

## Contributors

- [Liam Blanton](https://github.com/LiamBlanton17)
- [Ivan Bogdan](https://github.com/ivanchikb360)
- [Jennifer Cruz](https://github.com/jencruzcallejas)
- [Daniel Hansen](https://github.com/DanielSHansen)

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
