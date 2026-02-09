from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Product, Category
from .constants import FILTERS_BY_CATEGORY, DEFAULT_FILTERS

def home(request):
    return render(request, 'gnizdechko_app/home.html')

def delivery_and_payment(request):
    return render(request, 'gnizdechko_app/delivery_and_payment.html')

@method_decorator(ensure_csrf_cookie, name="dispatch")
class ProductListView(ListView):
    model = Product
    context_object_name = "products"
    paginate_by = 15

    def get_queryset(self):
        qs = Product.objects.prefetch_related("images", "colors")

        mode = self.kwargs.get("mode")
        slug = self.kwargs.get("slug")

        if mode == "new":
            qs = qs.filter(is_new=True)
        elif slug:
            qs = qs.filter(categories__slug=slug).distinct()

        q = (self.request.GET.get("q") or "").strip()
        if q:
            qs = qs.filter(title__icontains=q)

        return qs.order_by("-created_at")

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        slug = self.kwargs.get("slug")
        mode = self.kwargs.get("mode")

        if slug:
            ctx["category"] = get_object_or_404(Category, slug=slug)
        elif mode == "new":
            ctx["category"] = "Новинки"
        else:
            ctx["category"] = "Всі товари"

        ctx["enabled_filters"] = FILTERS_BY_CATEGORY.get(slug, DEFAULT_FILTERS)

        return ctx

@method_decorator(ensure_csrf_cookie, name="dispatch")
class ProductDetailView(DetailView):
    model = Product

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)

        cat_slug = self.request.GET.get("cat")
        if cat_slug:
            ctx["breadcrumb_category"] = Category.objects.filter(slug=cat_slug).first()
        else:
            ctx["breadcrumb_category"] = self.object.main_category

        return ctx
