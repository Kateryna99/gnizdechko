from django.contrib import admin

from .models import Product, ProductImage, Color, Category

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "categories_list", "price", "sale_price", 'is_new', 'is_special')
    list_filter = ("categories", "colors")
    search_fields = ("title", "subtitle", "description")
    inlines = [ProductImageInline]

    def categories_list(self, obj):
        return ", ".join(obj.categories.values_list("name", flat=True))

    categories_list.short_description = "Категорії"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ("name", "slug")


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    search_fields = ("name", "hex")
