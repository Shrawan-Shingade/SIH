from django.contrib import admin
from .models import Hospital, ResourceSnapshot

# Register your models here.



@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("name", "total_beds", "icu_beds", "ventilators", "oxygen_cylinders", "doctors", "nurses")

@admin.register(ResourceSnapshot)
class ResourceSnapshotAdmin(admin.ModelAdmin):
    list_display = ("hospital", "timestamp", "occupied_beds", "occupied_icu", "occupied_oxygen",
                    "occupied_ventilators", "occupied_doctors", "occupied_nurses")
    list_filter = ("hospital", "timestamp")