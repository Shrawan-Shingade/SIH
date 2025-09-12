from django.urls import path
from . import views

app_name = "hospitals"
urlpatterns = [
    path('register/', views.register_hospital, name='register_hospital'),
    path('success/', views.success, name='success'),
    path("", views.home, name="home"),                # /
    path("hospitals/", views.hospitals_list, name="hospitals"),
    path("map/", views.resource_map, name="map"),
    path("hospital/<int:id>/", views.hospital_detail, name="hospital_detail"),

    path("save-alert/", views.save_alert, name="save_alert"),
    path("refresh-data/", views.refresh_data, name="refresh_data"),
    path('api/resources/<int:hospital_id>/', views.resource_data, name='resource_data'),
    path('api/hospitals/', views.hospitals_api, name='hospital_api'),
]