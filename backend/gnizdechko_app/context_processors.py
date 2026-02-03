from .models import Category, Product

def categories_context(request):
    return {
        "all_categories": Category.objects.all(),
        "has_new_products": Product.objects.filter(is_new=True).exists()
    }