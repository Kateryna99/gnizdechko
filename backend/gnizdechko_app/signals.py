# gnizdechko_app/signals.py
import os
from django.db.models.signals import post_migrate
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import Product, ProductImage

def _safe_delete_file(field_file):
    try:
        if field_file and field_file.name:
            field_file.delete(save=False)
    except Exception:
        pass


@receiver(post_delete, sender=Product)
def delete_product_main_image_on_delete(sender, instance, **kwargs):
    if instance.main_image and instance.main_image.name != "products/default.jpg":
        _safe_delete_file(instance.main_image)


@receiver(post_delete, sender=ProductImage)
def delete_product_extra_image_on_delete(sender, instance, **kwargs):
    _safe_delete_file(instance.image)


@receiver(pre_save, sender=Product)
def delete_old_main_image_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = Product.objects.get(pk=instance.pk)
    except Product.DoesNotExist:
        return

    if old.main_image and old.main_image.name and old.main_image != instance.main_image:
        if old.main_image.name != "products/default.jpg":
            _safe_delete_file(old.main_image)


@receiver(pre_save, sender=ProductImage)
def delete_old_extra_image_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = ProductImage.objects.get(pk=instance.pk)
    except ProductImage.DoesNotExist:
        return

    if old.image and old.image.name and old.image != instance.image:
        _safe_delete_file(old.image)