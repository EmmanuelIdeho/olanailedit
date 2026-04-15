import json
from datetime import date

from django.core.mail import send_mail
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import HeroImage, NailGalleryImage, Service, AvailableTimeSlot, Appointment


def index(request):
    hero = HeroImage.objects.filter(is_active=True).first()
    gallery_images = NailGalleryImage.objects.filter(is_active=True)
    services = Service.objects.filter(is_active=True)
    time_slots = AvailableTimeSlot.objects.filter(is_active=True)

    # Group time slots by day
    days = {}
    for slot in time_slots:
        day_name = slot.get_day_of_week_display()
        if day_name not in days:
            days[day_name] = []
        days[day_name].append(slot)

    context = {
        'hero': hero,
        'gallery_images': gallery_images,
        'services': services,
        'time_slots': time_slots,
        'days': days,
    }
    return render(request, 'core/index.html', context)


@require_POST
def book_appointment(request):
    try:
        data = json.loads(request.body)
        service = Service.objects.get(pk=data['service_id'])
        time_slot = AvailableTimeSlot.objects.get(pk=data['time_slot_id'])

        appointment = Appointment.objects.create(
            client_name=data['name'],
            client_email=data['email'],
            client_phone=data['phone'],
            service=service,
            date=data['date'],
            time_slot=time_slot,
            notes=data.get('notes', ''),
        )

        send_mail(
            'PENDING appointment - OlaNailedIt is glad to have you!',
            f"Hello {appointment.client_name}, thank you for booking an appointment with me! Your appointment for {appointment.service} is on {appointment.date} from {time_slot.start_time} to {time_slot.end_time} at 3311 Address Drive. The appointment is PENDING right now, but I'll send you a confirmation message soon!",
            settings.EMAIL_HOST_USER,
            [appointment.client_email, settings.EMAIL_HOST_USER],
        )


        return JsonResponse({'success': True, 'id': appointment.pk})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

def available_dates(request):
    try:
        date_string = request.GET.get('date')
        chosen_date = date.fromisoformat(date_string)
        slot_data = list(AvailableTimeSlot.objects.filter(day_of_week=chosen_date.weekday()).exclude(appointment__date=chosen_date).values('id', 'start_time', 'end_time'))
        return JsonResponse({'success': True, 'data':slot_data})
    except Exception as e:
        return JsonResponse({'success':False, 'error':str(e)}, status=400)