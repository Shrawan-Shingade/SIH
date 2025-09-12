from django.db import models
from django.utils import timezone

# Create your models here.
class Hospital(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    total_beds = models.IntegerField()
    icu_beds = models.IntegerField()
    ventilators = models.IntegerField()
    oxygen_cylinders = models.IntegerField()
    doctors = models.IntegerField()
    nurses = models.IntegerField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    

class ResourceSnapshot(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='snapshots')
    timestamp = models.DateTimeField(default=timezone.now)

    # store capacities redundantly for immutability of historical data
    occupied_beds = models.IntegerField()
    occupied_icu = models.IntegerField()
    occupied_oxygen = models.IntegerField()
    occupied_ventilators = models.IntegerField()
    occupied_doctors = models.IntegerField()
    occupied_nurses = models.IntegerField()

    class Meta:
        indexes = [
            models.Index(fields=['hospital', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.hospital.name} @ {self.timestamp.isoformat()}"    
    
class Patients(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='patients')
    name = models.CharField(max_length=200)
    age = models.IntegerField()
    condition = models.TextField()
    admitted_on = models.DateTimeField(default=timezone.now)
    discharged_on = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.hospital.name})"

