from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('products/all/', views.ProductListView.as_view(), {"mode": "all"}, name='products-all'),
    path('products/new/', views.ProductListView.as_view(), {"mode": "new"}, name='products-new'),
    path("products/category/<slug:slug>/", views.ProductListView.as_view(), name="products-category"),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/delivery-payment/', views.delivery_and_payment, name='delivery-payment'),
]
