from django.contrib import admin
from .models import HeroImage, NailGalleryImage, Service, AvailableTimeSlot, Appointment
from django.conf import settings
from django.core.mail import send_mail


@admin.register(HeroImage)
class HeroImageAdmin(admin.ModelAdmin):
    list_display = ['caption', 'is_active', 'updated_at']
    list_editable = ['is_active']
    fields = ['image', 'caption', 'is_active']

    def has_add_permission(self, request):
        return not HeroImage.objects.exists()


@admin.register(NailGalleryImage)
class NailGalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    ordering = ['order']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'duration_minutes', 'order', 'is_active']
    list_editable = ['price', 'order', 'is_active']


@admin.register(AvailableTimeSlot)
class AvailableTimeSlotAdmin(admin.ModelAdmin):
    list_display = ['day_of_week', 'start_time', 'end_time', 'is_active']
    list_editable = ['is_active']
    list_filter = ['day_of_week', 'is_active']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'service', 'date', 'time_slot', 'status', 'created_at']
    list_filter = ['status', 'date']
    list_editable = ['status']
    readonly_fields = ['created_at']
    search_fields = ['client_name', 'client_email', 'client_phone']

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        old_status = form.initial.get('status')
        new_status = obj.status
        try:
            if (old_status != new_status):
                if new_status=='confirmed':
                    send_mail(
                    'CONFIRMED appointment - OlaNailedIt is glad to have you!',
                    f"Hello {obj.client_name}, thank you for booking an appointment with me! Your appointment for {obj.service} is on {obj.date} at 3311 Address Drive.",
                    settings.EMAIL_HOST_USER,
                    [obj.client_email, settings.EMAIL_HOST_USER ],
                     fail_silently=False,
                )

                elif new_status=='cancelled':
                    send_mail(
                    'CANCELLED appointment - sorry about that',
                    f"Hello {obj.client_name}, thank you for booking an appointment with me. Unfortunately, your appointment for {obj.service} on {obj.date} had to be cancelled at the moment. I will get back to you soon.",
                    settings.EMAIL_HOST_USER ,
                    [obj.client_email, settings.EMAIL_HOST_USER ],
                     fail_silently=False,
                )
        except Exception as e:
            print(f"Admin was not able to send email: {e}")


       
