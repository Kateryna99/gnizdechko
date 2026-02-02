from django.contrib import admin

from .models import Product, ProductImage, Color, Category

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "sale_price")
    list_filter = ("category", "colors")
    search_fields = ("title", "subtitle", "description")
    inlines = [ProductImageInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ("name", "slug")


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    search_fields = ("name", "hex")
