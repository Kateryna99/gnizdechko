from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('products/', views.ProductListView.as_view(), name='products'),
    path("products/category/<slug:slug>/", views.ProductListView.as_view(), name="products-category"),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
]
