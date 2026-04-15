# Ola's Nailedit — Django Website

A single-page appointment booking website for Ola's Nailedit Acrylic Nails.

## Setup

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

## Admin Panel

Visit `/admin/` and log in to manage:

| Section | What you can change |
|---|---|
| **Hero Images** | The full-screen background photo on the landing page |
| **Gallery Images** | The nail design slide reel (add URL, title, reorder) |
| **Services** | Service names, descriptions, prices, durations |
| **Available Time Slots** | Days and times clients can book |
| **Appointments** | View and update booking status (pending/confirmed/cancelled) |


## Production Checklist

- Set `DEBUG = False` in `settings.py`
- Set a real `SECRET_KEY`
- Set `ALLOWED_HOSTS` to your domain
- Configure a real database (PostgreSQL recommended)
- Set up static file serving (WhiteNoise or Nginx)
- Add email backend for booking confirmations

## Gallery & Hero Images

Images are stored as URLs (Unsplash or your own CDN). To use your own photos:
1. Upload them to a hosting service (Cloudinary, AWS S3, etc.)
2. Paste the URL into the admin panel

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
