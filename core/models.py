from django.db import models


class HeroImage(models.Model):
    #image_url = models.URLField(max_length=500, help_text="Paste an Unsplash or image URL for the hero background")
    image = models.ImageField(upload_to='hero/', null=True, help_text="Upload an image for the Hero section")
    caption = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Hero Image"

    def __str__(self):
        return f"Hero Image ({self.caption or 'No caption'})"


class NailGalleryImage(models.Model):
    #image_url = models.URLField(max_length=500)
    image = models.ImageField(upload_to='gallery/', null=True, help_text="Upload an image for the nail gallery section")
    title = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = "Gallery Image"
        verbose_name_plural = "Gallery Images"

    def __str__(self):
        return self.title or f"Gallery Image #{self.pk}"


class Service(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    duration_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class AvailableTimeSlot(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['day_of_week', 'start_time']
        verbose_name = "Available Time Slot"
        verbose_name_plural = "Available Time Slots"

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time.strftime('%I:%M %p')} – {self.end_time.strftime('%I:%M %p')}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    client_name = models.CharField(max_length=100)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=20)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    time_slot = models.ForeignKey(AvailableTimeSlot, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.client_name} – {self.date} ({self.status})"
