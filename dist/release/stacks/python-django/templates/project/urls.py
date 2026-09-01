from django.http import JsonResponse
from django.urls import path


def health(_request):
    return JsonResponse({"framework": "django", "status": "ok"})


urlpatterns = [
    path("", health),
    path("health", health),
]
