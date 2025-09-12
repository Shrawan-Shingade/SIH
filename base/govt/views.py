from django.shortcuts import render

# Create your views here.
def government(request):
    return render(request, 'government.html')