from django.db import models
from django.core.exceptions import ValidationError

class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    def __str__(self):
        return self.name


class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    hex = models.CharField(max_length=7, blank=True, default="")

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )

    title = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, blank=True, default="")
    description = models.TextField()

    price = models.PositiveIntegerField()
    sale_price = models.PositiveIntegerField(null=True, blank=True)

    main_image = models.ImageField(
        upload_to="products/main/",
        default="products/default.jpg",
    )

    colors = models.ManyToManyField(
        Color,
        blank=True,
        related_name="products",
    )

    def __str__(self):
        return self.title

    def clean(self):
        if self.sale_price is not None and self.sale_price >= self.price:
            raise ValidationError({"sale_price": "Sale price must be less than price."})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="products/extra/")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.title} image #{self.id}"