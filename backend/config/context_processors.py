from . import settings

def debug_flag(request):
    return {
        "DEBUG": settings.DEBUG
    }