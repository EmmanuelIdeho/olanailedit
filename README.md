# Ola's Nailedit — Django Website

A single-page appointment booking website for Ola's Nailedit Acrylic Nails.

## Setup

# Environment variables
Create a .env file based on the given .env.template file
```env
SECRET_KEY=<your_secret_key_here>
DB_NAME=<postgres_database_name>
DB_USER=<postgres_database_username>
DB_PASSWORD=<postgres_database_password>
DB_HOST=<postgres_database_host_name>
DB_PORT=<postgres_database_port_number>

EMAIL_HOST_USER=<sendgrid_verified_sender_email>
SENDGRID_API_KEY=<sendgrid_api_key>

SETTING_DEBUG=True #False, in production
SETTING_ALLOWED=* # In production, your deployment domain
CSRF_TRUSTED_ORIGINS=http://0.0.0.0:8000 # In production, your deployment domain with https tag included
```
# Local without Docker 
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (if starting fresh)
python manage.py createsuperuser

# Run the dev server
python manage.py runserver
```

# Local with Docker
```bash
docker-compose up --build

```

## Admin Panel

Visit `/admin/` and log in to manage:

| Section | What you can change |
|---|---|
| **Hero Images** | The full-screen background photo on the landing page |
| **Gallery Images** | The nail design slide reel (add URL, title, reorder) |
| **Services** | Service names, descriptions, prices, durations |
| **Available Time Slots** | Days and times clients can book |
| **Appointments** | View and update booking status (pending/confirmed/cancelled) |

## Gallery & Hero Images

Images are stored on server, and uploaded through the admin side with a button.

## Structure

```
olanailedit/
├── core/
│   ├── models.py        # HeroImage, NailGalleryImage, Service, AvailableTimeSlot, Appointment
│   ├── views.py         # index view + book_appointment API
│   ├── admin.py         # Admin panel customisations
│   └── urls.py
├── templates/core/
│   └── index.html       # Single-page template
├── static/
│   ├── css/main.css
│   └── js/main.js
└── olanailedit/
    ├── settings.py
    └── urls.py
```
## Tech Stack
- **Django 6.0** — web framework [https://www.djangoproject.com/]
- **PostgreSQL** — production database [https://www.postgresql.org/]
- **Docker** — containerisation [https://www.docker.com/]
- **WhiteNoise** — static file serving [https://whitenoise.readthedocs.io/en/latest/]
- **SendGrid** — transactional email [https://www.twilio.com/docs/sendgrid]
- **django-unfold** — modern admin UI [https://unfoldadmin.com/?utm_medium=github&utm_source=unfold]

## Deployment
Deployed on Railway. Push to the connected GitHub repository to trigger an automatic redeploy. Environment variables are managed through Railway's dashboard.