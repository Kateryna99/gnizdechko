from django.urls import path
from . import views

urlpatterns = [
    path("cart/add/", views.cart_add, name="cart-add"),
    path("cart/remove/", views.cart_remove, name="cart-remove"),
    path("cart/qty/", views.cart_qty, name="cart-qty"),
]
