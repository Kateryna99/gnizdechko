from django.urls import path
from . import views

urlpatterns = [
    path("checkout/", views.checkout, name="checkout"),
    path("checkout/send/", views.checkout_telegram, name="checkout-send"),
    path("api/delivery/carriers/", views.delivery_carriers, name="delivery-carriers"),
    path("api/delivery/cities/", views.delivery_cities, name="delivery-cities"),
    path("api/delivery/warehouses/", views.delivery_warehouses, name="delivery-warehouses"),
    path("api/delivery/countries/", views.countries_api, name="countries-api"),
]
