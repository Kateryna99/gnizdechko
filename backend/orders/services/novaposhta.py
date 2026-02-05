import requests
from django.conf import settings

NP_API_URL = "https://api.novaposhta.ua/v2.0/json/"


def np_request(model, method, properties=None):
    payload = {
        "apiKey": settings.NOVA_POSHTA_API_KEY,
        "modelName": model,
        "calledMethod": method,
        "methodProperties": properties or {},
    }

    r = requests.post(NP_API_URL, json=payload, timeout=10)
    r.raise_for_status()

    data = r.json()

    if not data.get("success"):
        raise ValueError(data.get("errors") or "Nova Poshta API error")

    return data.get("data", [])


def np_get_cities(search=""):
    return np_request(
        model="Address",
        method="getCities",
        properties={
            "FindByString": search,
            "Limit": 20,
        },
    )


def np_get_warehouses(city_ref, search=""):
    return np_request(
        model="Address",
        method="getWarehouses",
        properties={
            "CityRef": city_ref,
            "FindByString": search,
            "Limit": 20,
        },
    )