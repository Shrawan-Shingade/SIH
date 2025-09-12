from django import forms
from .models import Hospital

class HospitalForm(forms.ModelForm):
    class Meta:
        model = Hospital
        fields = [
            'name', 'address', 'latitude', 'longitude', 'total_beds',
            'icu_beds', 'ventilators', 'oxygen_cylinders', 'doctors', 'nurses'
        ]
        widgets = {
            }