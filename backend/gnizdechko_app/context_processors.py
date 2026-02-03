from .models import Category, Product

def categories_context(request):
    new_products = Product.objects.filter(is_new=True)

    return {
        "all_categories": Category.objects.all(),
        "new_products": new_products,
        "has_new_products": new_products.exists(),
    }