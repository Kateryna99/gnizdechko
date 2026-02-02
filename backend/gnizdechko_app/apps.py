from django.apps import AppConfig


class GnizdechkoAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = 'gnizdechko_app'

    def ready(self):
        from . import signals
