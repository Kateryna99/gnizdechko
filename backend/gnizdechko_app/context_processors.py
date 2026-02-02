from .models import Category

def categories_context(request):
    return {
        "all_categories": Category.objects.all()
    }