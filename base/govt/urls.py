from django.urls import path
from . import views

app_name = "govt"
urlpatterns = [
    path("government/", views.government, name="government"),  # /govt/
]