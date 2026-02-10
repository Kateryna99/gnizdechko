from django.db import models
from django.core.exceptions import ValidationError
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFit

class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    main_image = models.ImageField(
        upload_to="categories/",
        default="categories/default.jpg",
    )

    main_image_webp = ImageSpecField(
        source='main_image',
        processors=[ResizeToFit(500, 800)],
        format='WEBP',
        options={'quality': 80},
    )

    def __str__(self):
        return self.name


class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    hex = models.CharField(max_length=7, blank=True, default="")

    def __str__(self):
        return self.name


class Product(models.Model):
    categories = models.ManyToManyField(Category, related_name="products")

    main_category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="main_products",
    )

    title = models.CharField(max_length=500)
    subtitle = models.CharField(max_length=500, blank=True, default="")
    description = models.TextField()

    price = models.PositiveIntegerField()
    sale_price = models.PositiveIntegerField(null=True, blank=True)

    is_new = models.BooleanField(default=False, db_index=True)
    is_special = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    main_image = models.ImageField(
        upload_to="products/main/",
        default="products/default.jpg",
    )

    main_image_webp_sm = ImageSpecField(
        source="main_image",
        processors=[ResizeToFit(360, 800)],
        format="WEBP",
        options={"quality": 78},
    )

    main_image_webp_md = ImageSpecField(
        source="main_image",
        processors=[ResizeToFit(768, 1100)],
        format="WEBP",
        options={"quality": 78},
    )

    main_image_webp_lg = ImageSpecField(
        source="main_image",
        processors=[ResizeToFit(1024, 1400)],
        format="WEBP",
        options={"quality": 78},
    )

    colors = models.ManyToManyField(
        Color,
        blank=True,
        related_name="products",
    )

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()

        if self.sale_price is not None and self.sale_price >= self.price:
            raise ValidationError({
                "sale_price": "Sale price must be less than price."
            })

        if self.pk and self.categories.count() == 0:
            raise ValidationError({
                "categories": "Товар повинен мати хоча б одну категорію."
            })

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

    image_webp_sm = ImageSpecField(
        source="image",
        processors=[ResizeToFit(360, 800)],
        format="WEBP",
        options={"quality": 78},
    )
    image_webp_md = ImageSpecField(
        source="image",
        processors=[ResizeToFit(768, 1100)],
        format="WEBP",
        options={"quality": 78},
    )
    image_webp_lg = ImageSpecField(
        source="image",
        processors=[ResizeToFit(1000, 1400)],
        format="WEBP",
        options={"quality": 78},
    )

    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.product.title} image #{self.id}"