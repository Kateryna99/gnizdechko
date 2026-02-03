from .models import Category, Product

def categories_context(request):
    new_products = Product.objects.filter(is_new=True)

    categories_with_products = Category.objects.filter(
        products__isnull=False
    ).distinct()

    return {
        "all_categories": categories_with_products,
        "new_products": new_products,
        "has_new_products": new_products.exists(),
    }