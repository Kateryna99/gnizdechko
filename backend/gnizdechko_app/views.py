from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Product, Category
from .constants import FILTERS_BY_CATEGORY, DEFAULT_FILTERS

def home(request):
    return render(request, 'gnizdechko_app/home.html')

@method_decorator(ensure_csrf_cookie, name="dispatch")
class ProductListView(ListView):
    model = Product
    context_object_name = "products"
    paginate_by = 12

    def get_queryset(self):
        qs = Product.objects.prefetch_related("images", "colors")

        mode = self.kwargs.get("mode")
        slug = self.kwargs.get("slug")

        if mode == "new":
            qs = qs.filter(is_new=True)
        elif slug:
            qs = qs.filter(category__slug=slug)

        return qs.order_by("-created_at")

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        slug = self.kwargs.get("slug")

        ctx["current_category_slug"] = slug
        ctx["category"] = get_object_or_404(Category, slug=slug) if slug else None
        ctx["enabled_filters"] = FILTERS_BY_CATEGORY.get(slug, DEFAULT_FILTERS)

        return ctx

@method_decorator(ensure_csrf_cookie, name="dispatch")
class ProductDetailView(DetailView):
    model = Product
