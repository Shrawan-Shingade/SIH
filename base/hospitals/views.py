from django.shortcuts import render, redirect
from .forms import HospitalForm
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Hospital
from django.utils.timezone import now
from django.utils import timezone
from datetime import timedelta
from hospitals.models import ResourceSnapshot, Hospital
from django.http import JsonResponse

# Create your views here.
def register_hospital(request):
    if request.method == 'POST':
        form = HospitalForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('success')
    else:
        form = HospitalForm()
    return render(request, 'hospitals/register.html', {'form': form})

def success(request):
    return render(request, 'hospitals/success.html')

def home(request):
    return render(request, "home.html") 

def hospitals_list(request):
    #  hospitals = Hospital.objects.all()
    return render(request, 'hospitals.html')

def hospital_detail(request, id):
    hospital = get_object_or_404(Hospital, id=id)
    return render(request, "hospital_detail.html", {"hospital": hospital})

def resource_map(request):
    return render(request, 'map.html')

def save_alert(request):
    if request.method == "POST" and request.user.is_authenticated:
        # for now just dummy response
        return JsonResponse({"success": True, "message": "Alert saved!"})
    return JsonResponse({"success": False, "message": "Not allowed"})

def refresh_data(request):
    if request.method == "POST":
        # in future you can refresh from API/db here
        return JsonResponse({
            "success": True,
            "message": "Data refreshed successfully!",
            "timestamp": now().strftime("%H:%M:%S")
        })
    return JsonResponse({"success": False, "message": "Invalid request"})

def get_trends(hospital_id, interval="1h"):
    now = timezone.now()

    if interval == "1h":
        start = now - timedelta(hours=1)
    elif interval == "1d":
        start = now - timedelta(days=1)
    elif interval == "1w":
        start = now - timedelta(weeks=1)
    elif interval == "1m":
        start = now - timedelta(days=30)
    else:
        raise ValueError("Invalid interval: choose 1h, 1d, 1w, 1m")

    return (ResourceSnapshot.objects
            .filter(hospital_id=hospital_id, timestamp__gte=start)
            .order_by("timestamp"))

def resource_data(request, hospital_id):
    """Return resource snapshots for a hospital in given interval."""
    interval = request.GET.get("interval", "1d")  # default = 1 day
    now = timezone.now()

    if interval == "1h":
        start_time = now - timedelta(hours=1)
    elif interval == "1d":
        start_time = now - timedelta(days=1)
    elif interval == "1w":
        start_time = now - timedelta(weeks=1)
    elif interval == "1m":
        start_time = now - timedelta(days=30)
    else:
        return JsonResponse({"error": "Invalid interval"}, status=400)

    snapshots = (
        ResourceSnapshot.objects.filter(hospital_id=hospital_id, timestamp__gte=start_time)
        .order_by("timestamp")
    )

    data = [
        {
            "timestamp": snap.timestamp.isoformat(),
            "occupied_beds": snap.occupied_beds,
            "occupied_icu": snap.occupied_icu,
            "occupied_oxygen": snap.occupied_oxygen,
            "occupied_ventilators": snap.occupied_ventilators,
            "occupied_doctors": snap.occupied_doctors,
            "occupied_nurses": snap.occupied_nurses,
        }
        for snap in snapshots
    ]

    return JsonResponse({"hospital_id": hospital_id, "interval": interval, "data": data})

def hospitals_api(request):
    hospitals = Hospital.objects.all()
    hospital_list = []

    for h in hospitals:
        snapshot = h.snapshots.order_by('-timestamp').first()

        if snapshot:
            available_beds = max(h.total_beds - snapshot.occupied_beds, 0)
            available_icu = max(h.icu_beds - snapshot.occupied_icu, 0)
            available_ventilators = max(h.ventilators - snapshot.occupied_ventilators, 0)
            available_oxygen = max(h.oxygen_cylinders - snapshot.occupied_oxygen, 0)
        else:
            # If no snapshot exists, assume all are available
            available_beds = h.total_beds
            available_icu = h.icu_beds
            available_ventilators = h.ventilators
            available_oxygen = h.oxygen_cylinders

        hospital_list.append({
            "id": h.id,
            "name": h.name,
            "address": h.address,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "last_updated": snapshot.timestamp if snapshot else h.last_updated,

            "general_beds_available": available_beds,
            "general_beds_total": h.total_beds,

            "icu_beds_available": available_icu,
            "icu_beds_total": h.icu_beds,

            "ventilators_available": available_ventilators,
            "ventilators_total": h.ventilators,

            "oxygen_available": available_oxygen,
            "oxygen_total": h.oxygen_cylinders,

            "doctors": h.doctors,
            "nurses": h.nurses,
        })

    return JsonResponse({"hospitals": hospital_list})