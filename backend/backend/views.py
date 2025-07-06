from    django.http import HttpResponse
from    django.shortcuts import render
from django.http import JsonResponse 
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def index(request):
    # Add CORS headers
 
    if request.method == "POST":
        print("Received POST request")
        data = json.loads(request.body)
        print("Received data:", data)
      
       

    """
    A simple view that returns a welcome message.
    """
    response = JsonResponse({
        "Output": "Welcome to the backend of N8N Clone!"
    })

    return response